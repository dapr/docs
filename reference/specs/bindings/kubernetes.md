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
    value: <NAMESPACE>
  - name: resyncPeriodInSec
    vale: "<seconds>"
```

- `namespace` (required) is the Kubernetes namespace to read events from.
- `resyncPeriodInSec` (option, default `10`) the period of time to refresh event list from Kubernetes API server.

Output received from the binding is of format `bindings.ReadResponse` with the `Data` field populated with the following structure: 

```go
type EventResponse struct {
	Event  string   `json:"event"`
	OldVal v1.Event `json:"oldVal"`
	NewVal v1.Event `json:"newVal"`
}
```
Three different event types are available: 
- Add : Only the NewVal field is populated, OldVal field is an empty `v1.Event`, Event is `add`
- Delete : Only the OldVal field is populated, NewVal field is an empty `v1.Event`, Event is `delete`
- Update : Both the OldVal and NewVal fields are populated,  Event is `update`

## Required permisiions

For consuming `events` from Kubernetes, permissions need to be assigned to a User/Group/ServiceAccount using [RBAC Auth] mechanism of Kubernetes.

### For Role

One of the rules need to be of the form as below to give permissions to `get, watch` and `list` `events`. API Groups can be as restritive as needed.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: <NAMESPACE>
  name: <ROLENAME>
rules:
- apiGroups: [""]
  resources: ["events"]
  verbs: ["get", "watch", "list"]
```

### For RoleBinding

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: <BINDINGNAME>
  namespace: <NAMESPACE> # same as above
subjects:
- kind: ServiceAccount
  name: default # or as need be, can be changed
  namespace: <NAMESPACE> # same as above
roleRef:
  kind: Role
  name: <ROLENAME> # same as the one above
  apiGroup: ""
```
