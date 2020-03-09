# Redis Binding Spec

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <name>
spec:
  type: bindings.redis
  metadata:
  - name: redisHost
    value: <address>:6379
  - name: redisPassword
    value: **************
```

- `redisHost` is the Redis host address.
- `redisPassword` is the Redis password.

> **Note:** In production never place passwords or secrets within Dapr components. For information on securly storing and retrieving secrets refer to [Setup Secret Store](../../../howto/setup-secret-store)
