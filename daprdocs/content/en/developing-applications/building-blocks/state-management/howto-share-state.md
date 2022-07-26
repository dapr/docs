---
type: docs
title: "How-To: Share state between applications"
linkTitle: "How-To: Share state between applications"
weight: 400
description: "Learn the strategies for sharing state between different applications"
---

Dapr provides different ways to share state between applications.

Different architectures might have different needs when it comes to sharing state. In one scenario, you may want to:

- Encapsulate all state within a given application 
- Have Dapr manage the access for you

In a different scenario, you may need two applications working on the same state to get and save the same keys.

To enable state sharing, Dapr supports the following key prefixes strategies:

| Key prefixes | Description |
| ------------ | ----------- |
| `appid` | The default strategy allowing you to manage state only by the app with the specified `appid`. All state keys will be prefixed with the `appid`, and are scoped for the application. |
| `name` | Uses the name of the state store component as the prefix. Multiple applications can share the same state for a given state store. |
| `namespace` |  If set, this setting prefixes the `appid` key with the configured namespace, resulting in a key that is scoped to a given namespace. This allows apps in different namespace with the same `appid` to reuse the same state store. If a namespace is not configured, the setting fallbacks to the `appid` strategy. For more information on namespaces in Dapr see [How-To: Scope components to one or more applications]({{< ref component-scopes.md >}}) |
| `none` | Uses no prefixing. Multiple applications share state across different state stores. |

## Specifying a state prefix strategy

To specify a prefix strategy, add a metadata key named `keyPrefix` on a state component:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: production
spec:
  type: state.redis
  version: v1
  metadata:
  - name: keyPrefix
    value: <key-prefix-strategy>
```

## Examples

The following examples demonstrate what state retrieval looks like with each of the supported prefix strategies.

### `appid` (default)

In the example below, a Dapr application with app id `myApp` is saving state into a state store named `redis`:

```shell
curl -X POST http://localhost:3500/v1.0/state/redis \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "darth",
          "value": "nihilus"
        }
      ]'
```

The key will be saved as `myApp||darth`.

### `namespace`

A Dapr application running in namespace `production` with app id `myApp` is saving state into a state store named `redis`:

```shell
curl -X POST http://localhost:3500/v1.0/state/redis \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "darth",
          "value": "nihilus"
        }
      ]'
```

The key will be saved as `production.myApp||darth`.

### `name`

In the example below, a Dapr application with app id `myApp` is saving state into a state store named `redis`:

```shell
curl -X POST http://localhost:3500/v1.0/state/redis \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "darth",
          "value": "nihilus"
        }
      ]'
```

The key will be saved as `redis||darth`.

### `none`

In the example below, a Dapr application with app id `myApp` is saving state into a state store named `redis`:

```shell
curl -X POST http://localhost:3500/v1.0/state/redis \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "darth",
          "value": "nihilus"
        }
      ]'
```

The key will be saved as `darth`.