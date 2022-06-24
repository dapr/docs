---
type: docs
title: "Middleware component specs"
linkTitle: "Middleware"
weight: 6000
description: List of all the supported middleware components that can be injected in Dapr's processing pipeline.
no_list: true
aliases:
- /developing-applications/middleware/supported-middleware/
---
{{< partial "components/description.html" >}}

Table captions:

> `Status`: [Component certification]({{<ref "certification-lifecycle.md">}}) status
  - [Alpha]({{<ref "certification-lifecycle.md#alpha">}})
  - [Beta]({{<ref "certification-lifecycle.md#beta">}})
  - [Stable]({{<ref "certification-lifecycle.md#stable">}})
> `Since`: defines from which Dapr Runtime version, the component is in the current status

> `Component version`: defines the version of the component

### HTTP

| Name       | Description    | Status    |  Component version |
|------------|----------------|-----------|--------------------|
| [Rate limit]({{< ref middleware-rate-limit.md >}})                             | Restricts the maximum number of allowed HTTP requests per second                                                                | Alpha                      | v1|
| [OAuth2]({{< ref middleware-oauth2.md >}})                                     | Enables the [OAuth2 Authorization Grant flow](https://tools.ietf.org/html/rfc6749#section-4.1) on a Web API                     | Alpha                      | v1|
| [OAuth2 client credentials]({{< ref middleware-oauth2clientcredentials.md >}}) | Enables the [OAuth2 Client Credentials Grant flow](https://tools.ietf.org/html/rfc6749#section-4.4) on a Web API                | Alpha                      | v1|
| [Bearer]({{< ref middleware-bearer.md >}})                                     | Verifies a [Bearer Token](https://tools.ietf.org/html/rfc6750) using [OpenID Connect](https://openid.net/connect/) on a Web API | Alpha                      | v1|
| [Open Policy Agent]({{< ref middleware-opa.md >}})                             | Applies [Rego/OPA Policies](https://www.openpolicyagent.org/) to incoming Dapr HTTP requests                                    | Alpha                      | v1|
| [Uppercase]({{< ref middleware-uppercase.md >}})                               | Converts the body of the request to uppercase letters                                                                           | Stable(For local development) | v1|
| [Wasm]({{< ref middleware-wasm.md >}})                                     | Run a WASM file | Alpha                      | v1|

{{< partial "components/middleware.html" >}}

