---
type: docs
title: "OAuth2 client credentials"
linkTitle: "OAuth2 client credentials"
description: "Use OAuth2 client credentials middleware to secure HTTP endpoints"
aliases:
- /developing-applications/middleware/supported-middleware/middleware-oauth2clientcredentials/
---

The OAuth2 client credentials [HTTP middleware]({{< ref middleware.md >}}) enables the [OAuth2 Client Credentials flow](https://tools.ietf.org/html/rfc6749#section-4.4) on a Web API without modifying the application. This design separates authentication/authorization concerns from the application, so that application operators can adopt and configure authentication/authorization providers without impacting the application code.

## Component format

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: oauth2clientcredentials
spec:
  type: middleware.http.oauth2clientcredentials
  version: v1
  metadata:
  - name: clientId
    value: "<your client ID>"
  - name: clientSecret
    value: "<your client secret>"
  - name: scopes
    value: "https://www.googleapis.com/auth/userinfo.email"
  - name: tokenURL
    value: "https://accounts.google.com/o/oauth2/token"
  - name: headerName
    value: "authorization"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field      | Details | Example |
|------------|---------|---------|
| clientId | The client ID of your application that is created as part of a credential hosted by a OAuth-enabled platform
| clientSecret | The client secret of your application that is created as part of a credential hosted by a OAuth-enabled platform
| scopes | A list of space-delimited, case-sensitive strings of [scopes](https://tools.ietf.org/html/rfc6749#section-3.3) which are typically used for authorization in the application | `"https://www.googleapis.com/auth/userinfo.email"`
| tokenURL | The endpoint is used by the client to obtain an access token by presenting its authorization grant or refresh token | `"https://accounts.google.com/o/oauth2/token"`
| headerName | The authorization header name to forward to your application | `"authorization"`
| endpointParamsQuery | Specifies additional parameters for requests to the token endpoint | `true`
| authStyle | Optionally specifies how the endpoint wants the client ID & client secret sent. See the table of possible values below | `0`

### Possible values for `authStyle`

| Value | Meaning |
|-------|---------|
| `1`   | Sends the "client_id" and "client_secret" in the POST body as application/x-www-form-urlencoded parameters. |
| `2`   | Sends the "client_id" and "client_secret" using HTTP Basic Authorization. This is an optional style described in the [OAuth2 RFC 6749 section 2.3.1](https://tools.ietf.org/html/rfc6749#section-2.3.1). |
| `0`   | Means to auto-detect which authentication style the provider wants by trying both ways and caching the successful way for the future. |

## Dapr configuration

To be applied, the middleware must be referenced in a [configuration]({{< ref configuration-concept.md >}}). See [middleware pipelines]({{< ref "middleware.md#customize-processing-pipeline">}}).

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  httpPipeline:
    handlers:
    - name: oauth2clientcredentials
      type: middleware.http.oauth2clientcredentials
```

## Related links
- [Middleware]({{< ref middleware.md >}})
- [Configuration concept]({{< ref configuration-concept.md >}})
- [Configuration overview]({{< ref configuration-overview.md >}})
