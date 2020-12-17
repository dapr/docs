---
type: docs
title: "How-To: Change a state sharing strategy"
linkTitle: "How-To: Change a state sharing strategy"
weight: 400
description: "Choose a strategy for sharing state between different applications"
---

## Introduction

Dapr offers developers differnet ways to share state between applications.

Different architectures might have different needs when it comes to sharing state. For example, in one scenario you many want to encapsulate all state within a given application and have Dapr manage the access for you. In a different scenario, you may need to have two applications working on the same state be able to get and save the same keys.

To enable state sharing, Dapr supports the following key prefixes settings, set on Dapr Component:

* `appid` - This is the default strategy. the `appid` prefix allows state to be managed only by the app with the specified `appid`. All state keys will be prefixed with the `appid`.

* `name` - This setting uses the name of the state store component as the prefix.

* `none` - This setting uses no prefixing.

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

The following examples will show you how state retrieval looks like with each of the supported prefix strategies:

### `appid` prefix strategy (Default)

A Dapr application with app id `myApp` is saving state into a state store named `redis`:

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

### `name` prefix strategy

A Dapr application with app id `myApp` is saving state into a state store named `redis`:

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

### `none` prefix strategy

A Dapr application with app id `myApp` is saving state into a state store named `redis`:

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

