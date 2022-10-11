---
type: docs
title: "Preview features"
linkTitle: "Preview features"
weight: 4000
description: "List of current preview features"
---
Preview features in Dapr are considered experimental when they are first released. 

Runtime preview features require explicit opt-in in order to be used. The runtime opt-in is specified in a preview setting feature in Dapr's application configuration. See [How-To: Enable preview features]({{<ref preview-features>}}) for more information.

For CLI there is no explicit opt-in, just the version that this was first made available.


## Current preview features
| Feature | Description | Setting | Documentation | Version introduced |
| ---------- |-------------|---------|---------------|-----------------|
| **--image-registry** flag in Dapr CLI| In self hosted mode you can set this flag to specify any private registry to pull the container images required to install Dapr| N/A | [CLI init command reference]({{<ref "dapr-init.md#self-hosted-environment" >}}) | v1.7 |
| **Resiliency** | Allows configuring of fine-grained policies for retries, timeouts and circuitbreaking. | `Resiliency` | [Configure Resiliency Policies]({{<ref "resiliency-overview">}}) | v1.7|
| **Service invocation without default `content-type`** | When enabled removes the default service invocation content-type header value `application/json` when no content-type is provided. This will become the default behavior in release v1.9.0. This requires you to explicitly set content-type headers where required for your apps. | `ServiceInvocation.NoDefaultContentType` | [Service Invocation]({{<ref "service_invocation_api.md#request-contents" >}}) | v1.7 |
| **App Middleware** | Allow middleware components to be executed when making service-to-service calls | N/A | [App Middleware]({{<ref "middleware.md#app-middleware" >}}) | v1.9 |
