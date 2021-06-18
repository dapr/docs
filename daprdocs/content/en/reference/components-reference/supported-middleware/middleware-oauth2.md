---
type: docs
title: "OAuth2"
linkTitle: "OAuth2"
description: "Use OAuth2 middleware to secure HTTP endpoints"
aliases:
- /developing-applications/middleware/supported-middleware/middleware-oauth2/
---

The OAuth2 [HTTP middleware]({{< ref middleware.md >}}) enables the [OAuth2 Authorization Code flow](https://tools.ietf.org/html/rfc6749#section-4.1) on a Web API without modifying the application. This design separates authentication/authorization concerns from the application, so that application operators can adopt and configure authentication/authorization providers without impacting the application code.

## Component format

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: oauth2
spec:
  type: middleware.http.oauth2
  version: v1
  metadata:
  - name: clientId
    value: "<your client ID>"
  - name: clientSecret
    value: "<your client secret>"
  - name: scopes
    value: "https://www.googleapis.com/auth/userinfo.email"
  - name: authURL
    value: "https://accounts.google.com/o/oauth2/v2/auth"
  - name: tokenURL
    value: "https://accounts.google.com/o/oauth2/token"
  - name: redirectURL
    value: "http://dummy.com"
  - name: authHeaderName
    value: "authorization"
  - name: forceHTTPS
    value: "false"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field | Details | Example |
|-------|---------|---------|
| clientId | The client ID of your application that is created as part of a credential hosted by a OAuth-enabled platform
| clientSecret | The client secret of your application that is created as part of a credential hosted by a OAuth-enabled platform
| scopes | A list of space-delimited, case-sensitive strings of [scopes](https://tools.ietf.org/html/rfc6749#section-3.3) which are typically used for authorization in the application | `"https://www.googleapis.com/auth/userinfo.email"`
| authURL | The endpoint of the OAuth2 authorization server | `"https://accounts.google.com/o/oauth2/v2/auth"`
| tokenURL | The endpoint is used by the client to obtain an access token by presenting its authorization grant or refresh token | `"https://accounts.google.com/o/oauth2/token"`
| redirectURL | The URL of your web application that the authorization server should redirect to once the user has authenticated | `"https://myapp.com"`
| authHeaderName | The authorization header name to forward to your application | `"authorization"`
| forceHTTPS | If true, enforces the use of TLS/SSL | `"true"`,`"false"`                                           |

## Dapr configuration

To be applied, the middleware must be referenced in [configuration]({{< ref configuration-concept.md >}}). See [middleware pipelines]({{< ref "middleware.md#customize-processing-pipeline">}}).

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  httpPipeline:
    handlers:
    - name: oauth2
      type: middleware.http.oauth2
```

## Related links

- [Configure API authorization with OAuth]({{< ref oauth >}})
- [Middleware OAuth quickstart](https://github.com/dapr/quickstarts/tree/master/middleware)
- [Middleware]({{< ref middleware.md >}})
- [Configuration concept]({{< ref configuration-concept.md >}})
- [Configuration overview]({{< ref configuration-overview.md >}})
