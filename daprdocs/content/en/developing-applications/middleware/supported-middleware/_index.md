---
type: docs
title: "Supported middleware"
linkTitle: "Supported middleware"
weight: 30000
description: List of all the supported middleware components that can be injected in Dapr's processing pipeline.
no_list: true
---

### HTTP

| Name                                                                           | Description        | Status                       |
|--------------------------------------------------------------------------------|--------------------|------------------------------|
| [Rate limit]({{< ref middleware-rate-limit.md >}})                             | Restricts the maximum number of allowed HTTP requests per second                                                                | GA (For local development) |
| [OAuth2]({{< ref middleware-oauth2.md >}})                                     | Enables the [OAuth2 Authorization Code flow](https://tools.ietf.org/html/rfc6749#section-1.3.1) on a Web API                    | GA (For local development) |
| [OAuth2 client credentials]({{< ref middleware-oauth2clientcredentials.md >}}) | Enables the [OAuth2 Client Credentials flow](https://tools.ietf.org/html/rfc6749#section-1.3.4) on a Web API                    | GA (For local development) |
| [Bearer]({{< ref middleware-bearer.md >}})                                     | Verifies a [Bearer Token](https://tools.ietf.org/html/rfc6750) using [OpenID Connect](https://openid.net/connect/) on a Web API | GA (For local development) |
| [Open Policy Agent]({{< ref middleware-opa.md >}})                             | Applies [Rego/OPA Policies](https://www.openpolicyagent.org/) to incoming Dapr HTTP requests                                    | GA (For local development) |
