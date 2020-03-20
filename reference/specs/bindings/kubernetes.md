# Kubernetes Events Binding Spec

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <name>
spec:
  type: bindings.kubernetes
  metadata:
  - name: namespace
    value: default
```

- `namespace` is the Kubernetes namespace to read events from. Default is `default`.
