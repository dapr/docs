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

`redisHost` is the Redis host address.
`redisPassword` is the Redis password.
