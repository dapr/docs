---
type: docs
title: "How-To: Selectively enable Dapr APIs on the Dapr sidecar"
linkTitle: "Dapr APIs allow list"
weight: 4500
description: "Choose which Dapr sidecar APIs are available to the app"
---

In certain scenarios, such as zero trust networks or when exposing the Dapr sidecar to external traffic through a frontend, it's recommended to only enable the Dapr sidecar APIs that are being used by the app. Doing so reduces the attack surface and helps keep the Dapr APIs scoped to the actual needs of the application.

Dapr allows developers to control which APIs are accessible to the application by setting an API allowlist or denylist using a [Dapr Configuration]({{<ref "configuration-overview.md">}}).

### Default behavior

If no API allowlist or denylist is specified, the default behavior is to allow access to all Dapr APIs.

- If only a denylist is defined, all Dapr APIs are allowed except those defined in the denylist
- If only an allowlist is defined, only the Dapr APIs listed in the allowlist are allowed
- If both an allowlist and a denylist are defined, the allowed APIs are those defined in the allowlist, unless they are also included in the denylist. In other terms, the denylist overrides the allowlist for APIs that are defined in both places.
- If neither is defined, all APIs are allowed.

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

### Using an allowlist

#### Enabling specific HTTP APIs

The following example enables the state `v1.0` HTTP API and block all other HTTP APIs:

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

#### Enabling specific gRPC APIs

The following example enables the state `v1` gRPC API and block all other gRPC APIs:

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

### Using a denylist

#### Disabling specific HTTP APIs

The following example disables the state `v1.0` HTTP API, allowing all other HTTP APIs:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: myappconfig
  namespace: default
spec:
  api:
    denied:
      - name: state
        version: v1.0
        protocol: http
```

#### Disabling specific gRPC APIs

The following example disables the state `v1` gRPC API, allowing all other gRPC APIs:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: myappconfig
  namespace: default
spec:
  api:
    denied:
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
