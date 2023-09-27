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
| --- | --- | --- | --- | --- |
| **Streaming for HTTP service invocation** | Enables (partial) support for using streams in HTTP service invocation; see below for more details. | `ServiceInvocationStreaming` | [Details]({{< ref "support-preview-features.md#streaming-for-http-service-invocation" >}}) | v1.10 |
| **Pluggable components** | Allows creating self-hosted gRPC-based components written in any language that supports gRPC. The following component APIs are supported: State stores, Pub/sub, Bindings | N/A | [Pluggable components concept]({{<ref "components-concept#pluggable-components" >}})| v1.9  |
| **Multi-App Run for Kubernetes** | Configure multiple Dapr applications from a single configuration file and run from a single command on Kubernetes | `dapr run -k -f` | [Multi-App Run]({{< ref multi-app-dapr-run.md >}}) | v1.10 |
| **Workflows** | Author workflows as code to automate and orchestrate tasks within your application, like messaging, state management, and failure handling | N/A | [Workflows concept]({{< ref "components-concept#workflows" >}})| v1.10  |
| **Cryptography** | Encrypt or decrypt data without having to manage secrets keys  | N/A | [Cryptography concept]({{< ref "components-concept#cryptography" >}})| v1.11  |
| **Service invocation for non-Dapr endpoints** | Allow the invocation of non-Dapr endpoints by Dapr using the [Service invocation API]({{< ref service_invocation_api.md >}}). Read ["How-To: Invoke Non-Dapr Endpoints using HTTP"]({{< ref howto-invoke-non-dapr-endpoints.md >}}) for more information. | N/A | [Service invocation API]({{< ref service_invocation_api.md >}}) | v1.11  |
| **Actor State TTL** | Allow actors to save records to state stores with Time To Live (TTL) set to automatically clean up old data. In its current implementation, actor state with TTL may not be reflected correctly by clients, read [Actor State Transactions]({{< ref actors_api.md >}}) for more information. | `ActorStateTTL` | [Actor State Transactions]({{< ref actors_api.md >}}) | v1.11  |

### Streaming for HTTP service invocation

Running Dapr with the `ServiceInvocationStreaming` feature flag enables partial support for handling data as a stream in HTTP service invocation. This can offer improvements in performance and memory utilization when using Dapr to invoke another service using HTTP with large request or response bodies.

The table below summarizes the current state of support for streaming in HTTP service invocation in Dapr, including the impact of enabling `ServiceInvocationStreaming`, in the example where "app A" is invoking "app B" using Dapr. There are six steps in the data flow, with various levels of support for handling data as a stream:

<img src="/images/service-invocation-simple.webp" width=600 alt="Diagram showing the steps of service invocation described in the table below" />

| Step | Handles data as a stream | Dapr 1.11 | Dapr 1.11 with<br/>`ServiceInvocationStreaming` |
|:---:|---|:---:|:---:|
| 1 |  Request: "App A" to "Dapr sidecar A | <span role="img" aria-label="No">❌</span> | <span role="img" aria-label="No">❌</span> |
| 2 |  Request: "Dapr sidecar A" to "Dapr sidecar B | <span role="img" aria-label="No">❌</span> | <span role="img" aria-label="Yes">✅</span> |
| 3 |  Request: "Dapr sidecar B" to "App B" | <span role="img" aria-label="Yes">✅</span> | <span role="img" aria-label="Yes">✅</span> |
| 4 |  Response: "App B" to "Dapr sidecar B" | <span role="img" aria-label="Yes">✅</span> | <span role="img" aria-label="Yes">✅</span> |
| 5 |  Response: "Dapr sidecar B" to "Dapr sidecar A | <span role="img" aria-label="No">❌</span> | <span role="img" aria-label="Yes">✅</span> |
| 6 |  Response: "Dapr sidecar A" to "App A | <span role="img" aria-label="No">❌</span> | <span role="img" aria-label="No">❌</span> |

Important notes:

- `ServiceInvocationStreaming` needs to be applied on caller sidecars only.  
  In the example above, streams are used for HTTP service invocation if `ServiceInvocationStreaming` is applied to the configuration of "app A" and its Dapr sidecar, regardless of whether the feature flag is enabled for "app B" and its sidecar.
- When `ServiceInvocationStreaming` is enabled, you should make sure that all services your app invokes using Dapr ("app B") are updated to Dapr 1.10 or higher, even if `ServiceInvocationStreaming` is not enabled for those sidecars.  
  Invoking an app using Dapr 1.9 or older is still possible, but those calls may fail unless you have applied a Dapr Resiliency policy with retries enabled.

> Full support for streaming for HTTP service invocation will be completed in a future Dapr version.
