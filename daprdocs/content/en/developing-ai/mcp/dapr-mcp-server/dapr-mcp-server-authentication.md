---
type: docs
title: "Authenticating clients of the Dapr MCP server"
linkTitle: "Authentication"
weight: 30
description: "Require OIDC, SPIFFE, or Dapr Sentry tokens on the Dapr MCP server's HTTP transport"
---

The Dapr MCP server can require a valid token on every MCP request it serves over streamable HTTP. Authentication is off by default. Set `AUTH_MODE` to turn it on:

| `AUTH_MODE` | Accepts |
|---|---|
| Not set, or `disabled` | Any request. Use only on `localhost`. |
| `oidc` | ID or access tokens (JWTs) from an OpenID Connect provider |
| `spiffe` | SPIFFE JWT-SVIDs, validated with trust bundles from the SPIFFE Workload API |
| `dapr-sentry` | JWTs issued by Dapr Sentry for a Dapr app |
| `hybrid` | Any combination of the three above |

Authentication only applies to the HTTP transport. Over stdio, the MCP client starts the server as a local process, and there is no network listener to protect.

The server checks the settings for the selected mode at startup. If a required variable is missing or a value can't be parsed, it exits with an error that names the variable. An unrecognized `AUTH_MODE` value is also rejected at startup.

## Sending a token

Clients send the token in the `Authorization` header, either as `Bearer <token>` or as the raw token. If `DAPR_SENTRY_TOKEN_HEADER` names another header, the server checks that header first, in every mode, and expects the raw token there.

A request with no token, or with a token that no enabled method accepts, gets `401 Unauthorized`. The server doesn't say which check failed. Set `DAPR_MCP_SERVER_LOG_LEVEL=debug` to log the reason on the server.

## OIDC

Use `oidc` for tokens issued to users or applications by an identity provider such as Microsoft Entra ID, Okta, Auth0, Keycloak, or Google.

| Variable | Required | Description |
|---|---|---|
| `OIDC_ISSUER_URL` | Yes | Issuer URL. The server fetches the provider's discovery document from it at startup, and exits if it can't. |
| `OIDC_CLIENT_ID` | Yes | Value the token's `aud` claim must contain. |
| `OIDC_ALLOWED_ALGORITHMS` | No | Signing algorithms to accept. Default `RS256,ES256`. |
| `OIDC_SKIP_ISSUER_CHECK` | No | Skip the `iss` check. For development only; the server logs a warning when it's on. |

```bash
export AUTH_MODE=oidc
export OIDC_ISSUER_URL=https://login.example.com/realms/agents
export OIDC_CLIENT_ID=dapr-mcp-server
dapr run --app-id dapr-mcp-server --resources-path ./components -- dapr-mcp-server --http 0.0.0.0:8080
```

## SPIFFE

Use `spiffe` for service-to-service calls between workloads that get JWT-SVIDs from a SPIFFE implementation such as SPIRE. The server connects to the Workload API at startup to get trust bundles, waiting up to 10 seconds.

| Variable | Required | Description |
|---|---|---|
| `SPIFFE_TRUST_DOMAIN` | Yes | Trust domain, for example `example.org`. Tokens from other trust domains are rejected. |
| `SPIFFE_SERVER_ID` | Yes | This server's SPIFFE ID, for example `spiffe://example.org/dapr-mcp-server`. Callers must request their JWT-SVID with this ID as the audience. |
| `SPIFFE_ENDPOINT_SOCKET` | No | Workload API address, for example `unix:///run/spire/sockets/agent.sock`. |
| `SPIFFE_ALLOWED_CLIENTS` | No | Comma-separated SPIFFE IDs allowed to call the server. Each must be in the trust domain. When not set, any workload in the trust domain is accepted. |

```bash
export AUTH_MODE=spiffe
export SPIFFE_TRUST_DOMAIN=example.org
export SPIFFE_SERVER_ID=spiffe://example.org/dapr-mcp-server
export SPIFFE_ENDPOINT_SOCKET=unix:///run/spire/sockets/agent.sock
export SPIFFE_ALLOWED_CLIENTS=spiffe://example.org/ns/agents/sa/planner
```

## Dapr Sentry

Use `dapr-sentry` when the callers are Dapr apps. Dapr Sentry can issue each app a JWT whose subject is the app's SPIFFE ID, and publish the signing keys as a JWKS. To turn this on in Sentry, enable JWT issuing and the OIDC server, using the Sentry Helm values shown in [Authenticating with a Federated Identity Credential]({{% ref "authenticating-azure.md#authenticating-with-a-federated-identity-credential" %}}). The Microsoft Entra ID steps on that page don't apply. The JWKS is served at `/jwks.json` on the Sentry OIDC port. Each calling app requests a token for the audience you set in `DAPR_SENTRY_AUDIENCE` with the `dapr.io/sentry-request-jwt-audiences` annotation, or the `--sentry-request-jwt-audiences` flag in self-hosted mode.

An [`MCPServer` resource]({{% ref "mcp-server-resource.md#spiffe-workload-identity" %}}) with `auth.spiffe.jwt` sends such a token on every call, so this mode pairs naturally with declaring the Dapr MCP server as an `MCPServer`.

| Variable | Required | Description |
|---|---|---|
| `DAPR_SENTRY_JWKS_URL` | Yes | URL of the Sentry JWKS. |
| `DAPR_SENTRY_TRUST_DOMAIN` | Yes | Trust domain of the caller's SPIFFE ID, for example `public`. The `sub` claim must be a SPIFFE ID in this trust domain with a workload path. |
| `DAPR_SENTRY_AUDIENCE` | Yes | Value the token's `aud` claim must contain. Use the audience your callers request their tokens for. |
| `DAPR_SENTRY_ISSUER` | No | Expected `iss` claim. When not set, the issuer isn't checked. |
| `DAPR_SENTRY_TOKEN_HEADER` | No | Header that carries the raw token. Default `Authorization`. |
| `DAPR_SENTRY_JWKS_REFRESH_INTERVAL` | No | How often to refresh the JWKS. Default `5m`, minimum `30s`. |

```bash
export AUTH_MODE=dapr-sentry
export DAPR_SENTRY_JWKS_URL=https://dapr-sentry.dapr-system.svc.cluster.local:9080/jwks.json
export DAPR_SENTRY_TRUST_DOMAIN=public
export DAPR_SENTRY_AUDIENCE=mcp://dapr-mcp-server
export DAPR_SENTRY_ISSUER=https://sentry.example.com
```

The server fetches the JWKS at startup and exits if it can't. Afterwards it refreshes the keys on the configured interval, and also when a token arrives signed with a key it doesn't have, at most once every 30 seconds. If Sentry can't be reached, the server keeps using the cached keys for up to 24 hours. Only asymmetric signing algorithms are accepted, the token must have an `exp` claim, and `exp`, `nbf`, and `iat` are checked with one minute of clock-skew leeway.

## Hybrid

`hybrid` accepts tokens from more than one method. Turn on each method you want with its `*_ENABLED` variable, and set that method's required variables. At least one method must be on.

```bash
export AUTH_MODE=hybrid

export OIDC_ENABLED=true
export OIDC_ISSUER_URL=https://login.example.com/realms/agents
export OIDC_CLIENT_ID=dapr-mcp-server

export DAPR_SENTRY_ENABLED=true
export DAPR_SENTRY_JWKS_URL=https://dapr-sentry.dapr-system.svc.cluster.local:9080/jwks.json
export DAPR_SENTRY_TRUST_DOMAIN=public
export DAPR_SENTRY_AUDIENCE=mcp://dapr-mcp-server
```

The server tries the enabled methods in the order OIDC, SPIFFE, Dapr Sentry, and accepts the request as soon as one of them validates the token. The `*_ENABLED` variables are ignored in single-method modes.

## Unauthenticated paths

The health endpoints `/livez`, `/readyz`, and `/startupz` are always served without authentication, as is `/dapr/subscribe`, which only tells the sidecar the server has no subscriptions. Every other path is MCP and needs a token. There is no setting to exempt more paths, and setting the old `AUTH_SKIP_PATHS` variable makes the server fail at startup.

## Related links

- [Configuration reference]({{% ref dapr-mcp-server-configuration.md %}})
- [MCP security posture]({{% ref mcp-security.md %}})
