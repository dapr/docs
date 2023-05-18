---
type: docs
title: "Bearer"
linkTitle: "Bearer"
description: "Use bearer middleware to secure HTTP endpoints by verifying bearer tokens"
type: docs
aliases:
- /developing-applications/middleware/supported-middleware/middleware-bearer/
---

The bearer [HTTP middleware]({{< ref middleware.md >}}) verifies a [Bearer Token](https://tools.ietf.org/html/rfc6750) using [OpenID Connect](https://openid.net/connect/) on a Web API, without modifying the application. This design separates authentication/authorization concerns from the application, so that application operators can adopt and configure authentication/authorization providers without impacting the application code.

## Component format

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: bearer-token
spec:
  type: middleware.http.bearer
  version: v1
  metadata:
    - name: audience
      value: "<your token audience; e.g. the application's client ID>"
    - name: issuer
      value: "<your token issuer, e.g. 'https://accounts.google.com'>"

    # Optional values
    - name: jwksURL
      value: "https://accounts.google.com/.well-known/openid-configuration"
```
## Spec metadata fields

| Field | Required | Details | Example |
|-------|:--------:|---------|---------|
| `audience` | Y | The audience expected in the tokens. Usually, this corresponds to the client ID of your application that is created as part of a credential hosted by a OpenID Connect platform. | 
| `issuer` | Y | The issuer authority, which is the value expected in the issuer claim in the tokens. | `"https://accounts.google.com"`, `"https://login.salesforce.com"`
| `jwksURL` | N | Address of the JWKS (JWK Set containing the public keys for verifying tokens). If empty, will try to fetch the URL set in the OpenID Configuration document `<issuer>/.well-known/openid-configuration`.  | `"https://accounts.google.com/.well-known/openid-configuration"`

## Dapr configuration

To be applied, the middleware must be referenced in [configuration]({{< ref configuration-concept.md >}}). See [middleware pipelines]({{< ref "middleware.md">}}).

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  httpPipeline:
    handlers:
    - name: bearer-token
      type: middleware.http.bearer
```

## Related links

- [Middleware]({{< ref middleware.md >}})
- [Configuration concept]({{< ref configuration-concept.md >}})
- [Configuration overview]({{< ref configuration-overview.md >}})
