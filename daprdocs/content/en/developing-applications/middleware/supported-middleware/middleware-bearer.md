---
type: docs
title: "Bearer"
linkTitle: "Bearer"
weight: 4000
description: "Use Dapr Bearer middleware to secure HTTP endpoints by verifying bearer tokens"
type: docs
---

The Dapr Bearer [HTTP middleware]({{< ref middleware-concept.md >}}) verifies a [Bearer Token](https://tools.ietf.org/html/rfc6750) using [OpenID Connect](https://openid.net/connect/) on a Web API without modifying the application. This design separates authentication/authorization concerns from the application, so that application operators can adopt and configure authentication/authorization providers without impacting the application code.

## Middleware component definition

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: oauth2
spec:
  type: middleware.http.bearer
  version: v1
  metadata:
  - name: clientId
    value: "<your client ID>"
  - name: issuerURL
    value: "https://accounts.google.com"
```

| Metadata field | Description                                                                                                   | Example                                                           |
|----------------|---------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| clientId       | The client ID of your application that is created as part of a credential hosted by a OpenID Connect platform |                                                                   |
| issuerURL      | URL identifier for the service.                                                                               | `"https://accounts.google.com"`, `"https://login.salesforce.com"` |

## Related links

- [Middleware concept]({{< ref middleware-concept.md >}})
- [Dapr configuration]({{< ref configuration-concept.md >}})