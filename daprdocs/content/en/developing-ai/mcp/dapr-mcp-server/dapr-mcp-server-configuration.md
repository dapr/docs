---
type: docs
title: "Dapr MCP server configuration reference"
linkTitle: "Configuration"
weight: 20
description: "Every command-line flag and environment variable the Dapr MCP server reads, with defaults"
---

The Dapr MCP server takes a few command-line flags and reads everything else from environment variables. The server checks authentication settings at startup and exits with an error if they are invalid or incomplete, rather than starting without protection.

## Command-line flags

| Flag | Default | Description |
|---|---|---|
| `--http <addr>` | Not set (stdio) | Serve streamable HTTP on this address, for example `localhost:8080` or `0.0.0.0:8080`, instead of stdio. The health endpoints are served on the same address. |
| `--version` | `false` | Print the version and exit. |
| `--health-check` | `false` | Request `/livez` from a running server and exit with `0` on a `200` response, `1` otherwise. The container image uses this for its `HEALTHCHECK`. |
| `--health-check-addr <host:port>` | From `--http`, else `localhost:8080` | Address that `--health-check` probes. A wildcard host such as `0.0.0.0` is probed as `localhost`. |

## Server and Dapr connection

| Variable | Default | Description |
|---|---|---|
| `DAPR_GRPC_PORT` | `50001` | Port of the Dapr sidecar's gRPC API on `127.0.0.1`. `dapr run` and the Kubernetes sidecar injector set this for you. |
| `DAPR_GRPC_ENDPOINT` | Not set | Full address of the sidecar's gRPC API. Takes precedence over `DAPR_GRPC_PORT`. |
| `DAPR_API_TOKEN` | Not set | Token sent to the sidecar when it requires [API token authentication]({{% ref api-token.md %}}). |
| `DAPR_CLIENT_TIMEOUT_SECONDS` | `5` | Timeout for each attempt to connect to the sidecar. The server makes up to five attempts, two seconds apart, then exits. |
| `DAPR_MCP_SERVER_LOG_LEVEL` | `info` | Log level: `debug`, `info`, `warn`, or `error`. Logs are JSON on stderr. At `debug`, request headers are logged with credential headers redacted. |

The `DAPR_*` connection variables are read by the [Dapr Go SDK](https://github.com/dapr/go-sdk) that the server uses.

## HTTP transport

These settings apply only when the server runs with `--http`.

| Variable | Default | Description |
|---|---|---|
| `DAPR_MCP_CORS_ORIGIN` | Not set | Origin allowed to call the server from a browser, for example `https://app.example.com`. When set, the server adds CORS headers to every response and answers `OPTIONS` preflight requests. When not set, no CORS headers are sent and browsers on other origins are refused. Set it only for a browser-based MCP client on another origin. |

The server always serves `/livez`, `/readyz`, and `/startupz` without authentication; see [Health endpoints]({{% ref "dapr-mcp-server-observability.md#health-endpoints" %}}). MCP requests are served on every other path, so `http://<host>:<port>/` is the MCP endpoint. The one exception is `/dapr/subscribe`, which returns an empty subscription list for the Dapr sidecar and also needs no authentication.

## Authentication

Authentication applies to the HTTP transport. See [Authentication]({{% ref dapr-mcp-server-authentication.md %}}) for how the modes work and for examples.

| Variable | Default | Description |
|---|---|---|
| `AUTH_MODE` | Not set (disabled) | `oidc`, `spiffe`, `dapr-sentry`, or `hybrid` turns authentication on. Not set, or `disabled`, turns it off. |
| `OIDC_ENABLED` | `false` | In `hybrid` mode, accept OIDC tokens. Ignored in other modes. |
| `OIDC_ISSUER_URL` | Not set | OIDC issuer URL. Required when OIDC is on. |
| `OIDC_CLIENT_ID` | Not set | Expected `aud` claim. Required when OIDC is on. |
| `OIDC_ALLOWED_ALGORITHMS` | `RS256,ES256` | Comma-separated signing algorithms to accept. |
| `OIDC_SKIP_ISSUER_CHECK` | `false` | Skip the `iss` check. For development only. |
| `SPIFFE_ENABLED` | `false` | In `hybrid` mode, accept SPIFFE JWT-SVIDs. Ignored in other modes. |
| `SPIFFE_TRUST_DOMAIN` | Not set | Trust domain that callers must belong to. Required when SPIFFE is on. |
| `SPIFFE_SERVER_ID` | Not set | This server's SPIFFE ID, which callers' JWT-SVIDs must use as their audience. Required when SPIFFE is on. |
| `SPIFFE_ENDPOINT_SOCKET` | Not set | Address of the SPIFFE Workload API, for example `unix:///run/spire/sockets/agent.sock`. |
| `SPIFFE_ALLOWED_CLIENTS` | Not set (any workload in the trust domain) | Comma-separated SPIFFE IDs allowed to call the server. |
| `DAPR_SENTRY_ENABLED` | `false` | In `hybrid` mode, accept Dapr Sentry JWTs. Ignored in other modes. |
| `DAPR_SENTRY_JWKS_URL` | Not set | URL of the Sentry JWKS. Required when Dapr Sentry is on. |
| `DAPR_SENTRY_TRUST_DOMAIN` | Not set | Trust domain of the SPIFFE ID in the token's `sub` claim. Required when Dapr Sentry is on. |
| `DAPR_SENTRY_AUDIENCE` | Not set | Expected `aud` claim. Required when Dapr Sentry is on. |
| `DAPR_SENTRY_ISSUER` | Not set | Expected `iss` claim. Checked only when set. |
| `DAPR_SENTRY_TOKEN_HEADER` | `Authorization` | Header to read the token from. A custom header carries the raw token, without a `Bearer` prefix. |
| `DAPR_SENTRY_JWKS_REFRESH_INTERVAL` | `5m` | How often to refresh the JWKS, as a Go duration. Minimum `30s`. |

`AUTH_ENABLED` and `AUTH_SKIP_PATHS` are no longer supported. If either is set at all, the server refuses to start. Use `AUTH_MODE` to turn authentication on; the health endpoints never need a token.

## Telemetry

Telemetry is off until an OTLP endpoint is set. See [Observability]({{% ref dapr-mcp-server-observability.md %}}) for what the server emits.

| Variable | Default | Description |
|---|---|---|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Not set | OTLP collector endpoint for all signals, for example `http://otel-collector:4317`. An endpoint without a scheme uses TLS. |
| `OTEL_EXPORTER_OTLP_PROTOCOL` | `grpc` | `grpc` or `http/protobuf`. `http/json` falls back to `http/protobuf`. |
| `OTEL_EXPORTER_OTLP_INSECURE` | `false` | Use plaintext for an endpoint given without a scheme. An explicit `http://` or `https://` scheme always wins. |
| `OTEL_EXPORTER_OTLP_HEADERS` | Not set | Comma-separated `key=value` headers sent with every export, such as an API key. Values are percent-decoded. |
| `OTEL_EXPORTER_OTLP_{TRACES,METRICS,LOGS}_ENDPOINT` | Not set | Per-signal endpoint, overriding the generic one. For HTTP, used as given unless it has no path, in which case `/v1/traces`, `/v1/metrics`, or `/v1/logs` is added. |
| `OTEL_EXPORTER_OTLP_{TRACES,METRICS,LOGS}_PROTOCOL` | Generic value | Per-signal protocol. |
| `OTEL_EXPORTER_OTLP_{TRACES,METRICS,LOGS}_INSECURE` | Generic value | Per-signal plaintext setting. |
| `OTEL_EXPORTER_OTLP_{TRACES,METRICS,LOGS}_HEADERS` | Not set | Per-signal headers, merged over the generic ones. |
| `OTEL_SERVICE_NAME` | `dapr-mcp-server` | `service.name` resource attribute. |
| `OTEL_SERVICE_VERSION` | Binary version | `service.version` resource attribute. |
| `OTEL_METRIC_EXPORT_INTERVAL` | `10000` | Metric export interval in milliseconds. Go durations such as `30s` are also accepted. |
| `OTEL_LOG_EXPORT_INTERVAL` | `5000` | Log export interval in milliseconds. Go durations are also accepted. |
| `DAPR_MCP_SERVER_METRICS_ENABLED` | `true` | Set to `false` to stop exporting metrics while keeping traces. |
| `DAPR_MCP_SERVER_LOGS_OTEL_ENABLED` | `true` | Set to `false` to stop exporting logs over OTLP. Logs are still written to stderr. |
