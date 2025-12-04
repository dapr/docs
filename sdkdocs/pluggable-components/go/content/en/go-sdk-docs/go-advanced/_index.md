---
type: docs
title: "Advanced uses of the Dapr pluggable components .Go SDK"
linkTitle: "Advanced"
weight: 2000
description: How to use advanced techniques with the Dapr pluggable components Go SDK
is_preview: true
---

While not typically needed by most, these guides show advanced ways you can configure your Go pluggable components.

## Component lifetime

Pluggable components are registered by passing a "factory method" that is called for each configured Dapr component of that type associated with that socket. The method returns the instance associated with that Dapr component (whether shared or not). This allows multiple Dapr components of the same type to be configured with different sets of metadata, when component operations need to be isolated from one another, etc.

## Registering multiple services

Each call to `Register()` binds a socket to a registered pluggable component. One of each component type (input/output binding, pub/sub, and state store) can be registered per socket.

```go
func main() {
	dapr.Register("service-a", dapr.WithStateStore(func() state.Store {
		return &components.MyDatabaseStoreComponent{}
	}))

	dapr.Register("service-a", dapr.WithOutputBinding(func() bindings.OutputBinding {
		return &components.MyDatabaseOutputBindingComponent{}
	}))

	dapr.Register("service-b", dapr.WithStateStore(func() state.Store {
		return &components.MyDatabaseStoreComponent{}
	}))

	dapr.MustRun()
}
```

In the example above, a state store and output binding is registered with the socket `service-a` while another state store is registered with the socket `service-b`.

## Configuring Multiple Components

Configuring Dapr to use the hosted components is the same as for any single component - the component YAML refers to the associated socket. For example, to configure Dapr state stores for the two components registered above (to sockets `service-a` and `service-b`), you create two configuration files, each referencing their respective socket. 

```yaml
#
# This component uses the state store associated with socket `service-a`
#
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: state-store-a
spec:
  type: state.service-a
  version: v1
  metadata: []
```

```yaml
#
# This component uses the state store associated with socket `service-b`
#
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: state-store-b
spec:
  type: state.service-b
  version: v1
  metadata: []
```

## Next steps
- Learn more about implementing:
  - [Bindings]({{% ref go-bindings %}})
  - [State]({{% ref go-state-store %}})
  - [Pub/sub]({{% ref go-pub-sub %}})
