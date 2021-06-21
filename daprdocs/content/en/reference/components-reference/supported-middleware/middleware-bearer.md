---
type: docs
title: "Bearer"
linkTitle: "Bearer"
description: "Use bearer middleware to secure HTTP endpoints by verifying bearer tokens"
type: docs
aliases:
- /developing-applications/middleware/supported-middleware/middleware-bearer/
---

The bearer [HTTP middleware]({{< ref middleware.md >}}) verifies a [Bearer Token](https://tools.ietf.org/html/rfc6750) using [OpenID Connect](https://openid.net/connect/) on a Web API without modifying the application. This design separates authentication/authorization concerns from the application, so that application operators can adopt and configure authentication/authorization providers without impacting the application code.

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
  - name: clientId
    value: "<your client ID>"
  - name: issuerURL
    value: "https://accounts.google.com"
```
## Spec metadata fields

| Field | Details | Example |
|-------|---------|---------|
| clientId | The client ID of your application that is created as part of a credential hosted by a OpenID Connect platform
| issuerURL | URL identifier for the service. | `"https://accounts.google.com"`, `"https://login.salesforce.com"`

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
