---
type: docs
title: "How-To: Selectively enable Dapr APIs on the Dapr sidecar"
linkTitle: "Dapr APIs allow list"
weight: 4500
description: "Choose which Dapr sidecar APIs are available to the app"
---

In scenarios such as zero trust networks or when exposing the Dapr sidecar to external traffic through a frontend, it's recommended to only enable the Dapr sidecar APIs being used by the app. Doing so reduces the attack surface and helps keep the Dapr APIs scoped to the actual needs of the application.

Dapr allows you to control which APIs are accessible to the application by setting an API allowlist or denylist using a [Dapr Configuration]({{< ref "configuration-schema.md" >}}).

### Default behavior

If no API allowlist or denylist is specified, the default behavior is to allow access to all Dapr APIs.

- If you've only defined a denylist, all Dapr APIs are allowed except those defined in the denylist
- If you've only defined an allowlist, only the Dapr APIs listed in the allowlist are allowed
- If you've defined both an allowlist and a denylist, the denylist overrides the allowlist for APIs that are defined in both.
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

The following example enables the state `v1.0` HTTP API and blocks all other HTTP APIs:

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

The following example enables the state `v1` gRPC API and blocks all other gRPC APIs:

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

| API group | HTTP API | [gRPC API](https://github.com/dapr/dapr/tree/master/pkg/api/grpc) |
| ----- | ----- | ----- |
| [Service Invocation]({{< ref service_invocation_api.md >}}) | `invoke` (`v1.0`) | `invoke` (`v1`) |
| [State]({{< ref state_api.md>}})| `state` (`v1.0` and `v1.0-alpha1`) | `state` (`v1` and `v1alpha1`) |
| [Pub/Sub]({{< ref pubsub.md >}}) | `publish` (`v1.0` and `v1.0-alpha1`) | `publish` (`v1` and `v1alpha1`) |
| [Output Bindings]({{< ref bindings_api.md >}})  | `bindings` (`v1.0`) |`bindings` (`v1`) |
| Subscribe | n/a | `subscribe` (`v1alpha1`) |
| [Secrets]({{< ref secrets_api.md >}})| `secrets` (`v1.0`) | `secrets` (`v1`) |
| [Actors]({{< ref actors_api.md >}}) | `actors`  (`v1.0`) |`actors` (`v1`) |
| [Metadata]({{< ref metadata_api.md >}}) | `metadata` (`v1.0`) |`metadata` (`v1`) |
| [Configuration]({{< ref configuration_api.md >}}) | `configuration` (`v1.0` and `v1.0-alpha1`) | `configuration` (`v1` and `v1alpha1`) |
| [Distributed Lock]({{< ref distributed_lock_api.md >}}) | `lock` (`v1.0-alpha1`)<br/>`unlock` (`v1.0-alpha1`) | `lock` (`v1alpha1`)<br/>`unlock` (`v1alpha1`) |
| [Cryptography]({{< ref cryptography_api.md >}}) | `crypto` (`v1.0-alpha1`) | `crypto` (`v1alpha1`) |
| [Workflow]({{< ref workflow_api.md >}}) | `workflows` (`v1.0`) |`workflows` (`v1`) |
| [Health]({{< ref health_api.md >}}) | `healthz`  (`v1.0`) | n/a |
| Shutdown | `shutdown` (`v1.0`) | `shutdown` (`v1`) |

## Next steps

{{< button text="Configure Dapr to use gRPC" page="grpc" >}}