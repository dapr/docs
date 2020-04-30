# Kubernetes Events Binding Spec

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <name>
spec:
  type: bindings.twitter
  metadata:
  - name: consumerKey
    value: ''
  - name: consumerSecret
    value: ''
  - name: accessToken
    value: ''
  - name: accessSecret
    value: ''
  - name: query
    value: ''
```


- `consumerKey` (required) is the Twitter API consumer key
- `consumerSecret` (required) is the Twitter API consumer secret
- `accessToken` (required) is the Twitter API access token
- `accessSecret` (required) is the Twitter API access secret
- `query` (required) is the Twitter search query (e.g. `dapr`)
