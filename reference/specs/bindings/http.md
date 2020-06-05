# HTTP Binding Spec

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.http
  metadata:
  - name: url
    value: http://something.com
  - name: method
    value: GET
```

- `url` is the HTTP url to invoke.
- `method` is the HTTP verb to use for the request.

## Output Binding Supported Operations

* create
