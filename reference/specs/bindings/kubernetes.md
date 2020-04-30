# Kubernetes Events Binding Spec

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.kubernetes
  metadata:
  - name: namespace
    value: default
```

- `namespace` is the Kubernetes namespace to read events from. Default is `default`.
