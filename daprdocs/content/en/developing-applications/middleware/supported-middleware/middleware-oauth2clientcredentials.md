---
type: docs
title: "OAuth2 client credentials"
linkTitle: "OAuth2 client credentials"
weight: 3000
description: "Use Dapr OAuth2 client credentials middleware to secure HTTP endpoints"
type: docs
---

The Dapr OAuth2 client credentials [HTTP middleware]({{< ref middleware-concept.md >}}) enables the [OAuth2 Client Credentials flow](https://tools.ietf.org/html/rfc6749#section-1.3.4) on a Web API without modifying the application. This design separates authentication/authorization concerns from the application, so that application operators can adopt and configure authentication/authorization providers without impacting the application code.

## Middleware component definition

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: oauth2
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

| Metadata field      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Example                                            |
|---------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------|
| clientId            | The client ID of your application that is created as part of a credential hosted by a OAuth-enabled platform                                                                                                                                                                                                                                                                                                                                                                                        |                                                    |
| clientSecret        | The client secret of your application that is created as part of a credential hosted by a OAuth-enabled platform                                                                                                                                                                                                                                                                                                                                                                                    |                                                    |
| scopes              | A list of space-delimited, case-sensitive strings of [scopes](https://tools.ietf.org/html/rfc6749#section-3.3) which are typically used for authorization in the application                                                                                                                                                                                                                                                                                                                        | `"https://www.googleapis.com/auth/userinfo.email"` |
| tokenURL            | The endpoint is used by the client to obtain an access token by presenting its authorization grant or refresh token                                                                                                                                                                                                                                                                                                                                                                                 | `"https://accounts.google.com/o/oauth2/token"`     |
| headerName          | The authorization header name to forward to your application                                                                                                                                                                                                                                                                                                                                                                                                                                        | `"authorization"`                                  |
| endpointParamsQuery | Specifies additional parameters for requests to the token endpoint                                                                                                                                                                                                                                                                                                                                                                                                                                  | `true`                                             |
| authStyle           | Optionally specifies how the endpoint wants the client ID & client secret sent. See the table below of possible values. | `0`                                                |


**Posible values for `authStyle`**

| Value | Meaning |
|-------|---------|
| `1`   | Sends the "client_id" and "client_secret" in the POST body as application/x-www-form-urlencoded parameters. |
| `2`   | Sends the "client_id" and "client_secret" using HTTP Basic Authorization. This is an optional style described in the [OAuth2 RFC 6749 section 2.3.1](https://tools.ietf.org/html/rfc6749#section-2.3.1). |
| `0`   | Means to auto-detect which authentication style the provider wants by trying both ways and caching the successful way for the future. |

## Related links
- [Middleware concept]({{< ref middleware-concept.md >}})
- [Dapr configuration]({{< ref configuration-concept.md >}})