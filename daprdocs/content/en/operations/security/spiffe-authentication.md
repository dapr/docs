---
type: docs
title: "Authenticate components with the Dapr SPIFFE identity"
linkTitle: "SPIFFE authentication"
weight: 1100
description: "The recommended, secretless way for components to authenticate to third-party services"
---

{{% alert title="Recommended" color="primary" %}}
SPIFFE authentication is the recommended way for Dapr components to authenticate to third-party services. Use it wherever the component and the service support it, instead of API keys, passwords, or cloud access keys.
{{% /alert %}}

Every Dapr app with mTLS enabled has a [SPIFFE](https://spiffe.io/) identity, issued by Sentry:

```
spiffe://<trust-domain>/ns/<namespace>/<app-id>
```

With SPIFFE authentication, a component proves this identity to a third-party service, such as a cloud provider or an LLM provider, and the service grants access to that identity. This is the best way to authenticate because:

- **It is secretless.** No API keys, passwords, or cloud credentials are stored in component metadata, secret stores, or environment variables. There is nothing to leak, rotate, or revoke.
- **The service trusts your app's own Dapr identity.** You grant access to a specific app ID in a specific namespace, and the service's audit logs record which app made each request.
- **Credentials are short-lived.** Sentry signs them for minutes or hours, and Dapr renews them automatically.
- **It works the same wherever Dapr runs.** Kubernetes, virtual machines, and any cloud use the same identity, without depending on the hosting platform's identity system.

Dapr proves the identity with one of two credentials:

| Credential | How it is used |
|------------|----------------|
| JWT SVID | Sentry signs a short-lived JWT for the app. The component exchanges it for an access token, using the service's workload identity federation. |
| X.509 SVID | The app's mTLS certificate, signed by Sentry, authenticates the app to the service directly. |

## Supported components

| Component | Credential | Service-side setup |
|-----------|------------|--------------------|
| [Anthropic conversation]({{% ref "/reference/components-reference/supported-conversation/anthropic.md#spiffe-authentication-recommended" %}}) | JWT SVID | Anthropic workload identity federation |
| [OpenAI conversation]({{% ref "/reference/components-reference/supported-conversation/openai.md#spiffe-authentication-recommended" %}}) | JWT SVID | OpenAI workload identity federation |
| [Azure OpenAI conversation]({{% ref "/reference/components-reference/supported-conversation/openai.md#azure-openai-with-microsoft-entra-id" %}}) | JWT SVID | Microsoft Entra ID federated identity credential |
| [AWS Bedrock conversation]({{% ref "/reference/components-reference/supported-conversation/aws-bedrock.md#spiffe-authentication-recommended" %}}) | JWT SVID or X.509 SVID | AWS IAM OIDC identity provider, or AWS IAM Roles Anywhere |
| [Google AI conversation]({{% ref "/reference/components-reference/supported-conversation/googleai.md#spiffe-authentication-recommended" %}}) | JWT SVID | Google Cloud workload identity federation |
| [Azure components]({{% ref "authenticating-azure.md#authenticating-with-a-federated-identity-credential" %}}) | JWT SVID | Microsoft Entra ID federated identity credential |
| [AWS components]({{% ref "authenticating-aws.md#iam-roles-anywhere" %}}) | X.509 SVID | AWS IAM Roles Anywhere |
| [MCPServer resources]({{% ref "mcp-server-resource.md#spiffe-workload-identity" %}}) | JWT SVID | The MCP server verifies the JWT with Sentry's public keys |

## Choosing an authentication method

Use the first method that the component and the service support:

1. SPIFFE authentication, as described on this page.
1. The hosting platform's workload identity, such as managed identities on Azure, or EKS Pod Identity on AWS.
1. Static credentials, such as API keys, stored in a [secret store]({{% ref component-secrets.md %}}). Use these only when the service supports nothing else.

## How JWT SVIDs are issued

1. When the component needs an access token, it asks daprd for a JWT SVID with the audience the service expects.
1. daprd requests a new JWT SVID from Sentry, authenticating with the app's X.509 SVID as the mTLS client certificate.
1. Sentry signs a JWT with these claims:
   - `sub`: the app's SPIFFE ID
   - `aud`: the requested audience
   - `iss`: the issuer configured in Sentry
   - `jti`: a unique ID
   - `exp`: 5 minutes after `iat`, or earlier if the Sentry JWT TTL or the app's X.509 certificate ends first
1. The component exchanges the JWT SVID for an access token, and reuses the access token until shortly before it expires. Each exchange uses a new JWT SVID, so services that accept a JWT only once, such as Anthropic, work as expected.
1. The service verifies the JWT signature with Sentry's public keys, which it fetches from Sentry's OIDC discovery endpoint.

## Prerequisites

Both credentials need mTLS enabled for the app. AWS IAM Roles Anywhere also needs an ECDSA workload key: set the `dapr.io/workload-key-algorithm: "ecdsa"` annotation on Kubernetes, or the `--workload-key-algorithm ecdsa` flag or the `DAPR_WORKLOAD_KEY_ALGORITHM=ecdsa` environment variable in self-hosted mode. This option requires Dapr v1.20 or later. JWT SVIDs also need:

- daprd and Sentry from Dapr v1.20 or later. Older Sentry versions cannot issue JWT SVIDs on demand, and the component reports an error asking you to upgrade the control plane.
- Sentry configured to issue JWTs and serve OIDC discovery, with the following Dapr Sentry Helm values:

  ```yaml
  jwt:
    enabled: true
    # Must be the URL that the services use to reach the OIDC endpoints.
    issuer: "https://<your-issuer-domain>"

  oidc:
    enabled: true
    server:
      port: 9080
    tls:
      enabled: true
      certFile: "<path-to-tls-cert.pem>"
      keyFile: "<path-to-tls-key.pem>"
  ```

  In self-hosted mode, pass the equivalent flags to Sentry:

  ```bash
  ./sentry --issuer-credentials $HOME/.dapr/certs --trust-domain cluster.local \
    --jwt-enabled --jwt-issuer "https://<your-issuer-domain>" \
    --oidc-enabled --oidc-server-listen-address 0.0.0.0 --oidc-server-listen-port 9080 \
    --oidc-server-tls-cert-file "<path-to-tls-cert.pem>" \
    --oidc-server-tls-key-file "<path-to-tls-key.pem>"
  ```

  JWT SVIDs that components request on demand are valid for 5 minutes. Sentry's `--jwt-ttl` flag, 24 hours by default, caps this lifetime, and a JWT SVID never outlives the app's X.509 certificate. On Kubernetes, set it with the `dapr_sentry.extraArgs` Helm value, as described in [Sentry]({{% ref "sentry.md#additional-sentry-container-arguments" %}}).

- Sentry's OIDC endpoints, `/.well-known/openid-configuration` and `/jwks.json`, reachable by the services over HTTPS at the issuer URL. If you cannot expose them publicly, register Sentry's JWK set (the contents of `/jwks.json`) with services that accept it directly: Anthropic, OpenAI, and Google Cloud. Update the registered keys whenever Sentry's JWT signing key changes.

## Configure the service for JWT SVIDs

Every service needs the same three values to trust Sentry:

| Value | Set it to |
|-------|-----------|
| Issuer | The Sentry `jwt.issuer` value, exactly. |
| Subject | The app's SPIFFE ID, for example `spiffe://public/ns/default/my-app`. The trust domain is `public` unless the app's Configuration sets `accessControl.trustDomain`. |
| Audience | The audience the component requests. Each component page lists its default. |

Grant access to the exact SPIFFE ID of each app, rather than to every subject from the issuer, so that only the intended apps can obtain access tokens.

## Deprecated: JWT audiences requested at startup

The `--sentry-request-jwt-audiences` flag and the `dapr.io/sentry-request-jwt-audiences` annotation are deprecated. They requested JWT SVIDs for fixed audiences together with the app's X.509 certificate, because earlier versions of Sentry could not issue JWT SVIDs on demand. All components now request JWT SVIDs for the audience they need, when they need it, so you can remove the flag and the annotation.
