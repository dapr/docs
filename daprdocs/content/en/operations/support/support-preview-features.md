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
|---|---|---|---|---|
| **`--image-registry`** flag in Dapr CLI| In self hosted mode you can set this flag to specify any private registry to pull the container images required to install Dapr| N/A | [CLI init command reference]({{<ref "dapr-init.md#self-hosted-environment" >}}) | v1.7 |
| **App Middleware** | Allow middleware components to be executed when making service-to-service calls | N/A | [App Middleware]({{<ref "middleware.md#app-middleware" >}}) | v1.9 |
| **Streaming for HTTP service invocation** | Enables (partial) support for using streams in HTTP service invocation; see below for more details. | `ServiceInvocationStreaming` | &nbsp; | v1.10 |
| **App health checks** | Allows configuring app health checks | `AppHealthCheck` | [App health checks]({{<ref "app-health.md" >}}) | v1.9 |
| **Pluggable components** | Allows creating self-hosted gRPC-based components written in any language that supports gRPC. The following component APIs are supported: State stores, Pub/sub, Bindings | N/A | [Pluggable components concept]({{<ref "components-concept#pluggable-components" >}})| v1.9  |

### Streaming for HTTP service invocation

Running Dapr with the `ServiceInvocationStreaming` feature flag enables partial support for handling data as a stream in HTTP service invocation. This can offer improvements in performance and memory utilization when using Dapr to invoke another service using HTTP with large request or response bodies.

The table below summarizes the current state of support for streaming in HTTP service invocation in Dapr, including the impact of enabling `ServiceInvocationStreaming`, in the example where "app A" is invoking "app B" using Dapr. There are six steps in the data flow, with various levels of support for handling data as a stream:

| Step handles data as a stream | Dapr 1.10 | Dapr 1.10 with<br/>`ServiceInvocationStreaming` enabled |
|---|---|---|
| Request: "App A" to "Dapr sidecar A | <span role="img" aria-label="No">❌</span> | <span role="img" aria-label="No">❌</span> |
| Request: "Dapr sidecar A" to "Dapr sidecar B | <span role="img" aria-label="No">❌</span> | <span role="img" aria-label="Yes">✅</span> |
| Request: "Dapr sidecar B" to "App B" | <span role="img" aria-label="Yes">✅</span> | <span role="img" aria-label="Yes">✅</span> |
| Response: "App B" to "Dapr sidecar B" | <span role="img" aria-label="Yes">✅</span> | <span role="img" aria-label="Yes">✅</span> |
| Response: "Dapr sidecar B" to "Dapr sidecar A | <span role="img" aria-label="No">❌</span> | <span role="img" aria-label="Yes">✅</span> |
| Response: "Dapr sidecar A" to "App A | <span role="img" aria-label="No">❌</span> | <span role="img" aria-label="Yes">✅</span> |

Important notes:

- `ServiceInvocationStreaming` needs to be applied on caller sidecars only.  
  In the example above, streams are used for HTTP service invocation if `ServiceInvocationStreaming` is applied to the configuration of "app A" and its Dapr sidecar, regardless of whether the feature flag is enabled for "app B" and its sidecar.
- When `ServiceInvocationStreaming` is enabled, you should make sure that all services your app invokes using Dapr ("app B") are updated to Dapr 1.10, even if `ServiceInvocationStreaming` is not enabled for those sidecars.  
  Invoking an app using Dapr 1.9 or older is still possible, but those calls may fail if you have applied a Dapr Resiliency policy with retries enabled.

> Full support for streaming for HTTP service invocation will be completed in a future Dapr version.
