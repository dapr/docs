---
type: docs
title: "How-To: Selectively enable Dapr APIs on the Dapr sidecar"
linkTitle: "Dapr APIs allow list"
weight: 4500
description: "Choose which Dapr sidecar APIs are available to the app"
---

In certain scenarios such as zero trust networks or when exposing the Dapr sidecar to external traffic through a frontend, it's recommended to only enable the Dapr sidecar APIs that are being used by the app. Doing so reduces the attack surface and helps keep the Dapr APIs scoped to the actual needs of the application.

Dapr allows developers to control which APIs are accessible to the application by setting an API allow list using a [Dapr Configuration]({{<ref "configuration-overview.md">}}).

### Default behavior

If an API allow list section is not specified, the default behavior is to allow access to all Dapr APIs.
Once an allow list is set, only the specified APIs are accessible.

For example, the following configuration enables all APIs for both HTTP and gRPC:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: myappconfig
  namespace: default
spec:
  tracing:
    samplingRate: "1"
```

### Enabling specific HTTP APIs

The following example enables the state `v1.0` HTTP API and block all the rest:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: myappconfig
  namespace: default
spec:
  api:
    allowed:
    - name: state
      version: v1.0
      protocol: http
```

### Enabling specific gRPC APIs

The following example enables the state `v1` gRPC API and block all the rest:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: myappconfig
  namespace: default
spec:
  api:
    allowed:
    - name: state
      version: v1
      protocol: grpc
```

### List of Dapr APIs

The `name` field takes the name of the Dapr API you would like to enable.

See this list of values corresponding to the different Dapr APIs:

| Name  | Dapr API |
| ------------- | ------------- |
| state  | [State]({{< ref state_api.md>}})|
| invoke  | [Service Invocation]({{< ref service_invocation_api.md >}})  |
| secrets  | [Secrets]({{< ref secrets_api.md >}})|
| bindings  | [Output Bindings]({{< ref bindings_api.md >}})  |
| publish | [Pub/Sub]({{< ref pubsub.md >}}) |
| actors | [Actors]({{< ref actors_api.md >}}) |
| metadata | [Metadata]({{< ref metadata_api.md >}}) |
