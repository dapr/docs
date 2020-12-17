---
type: docs
title: "How-To: Reference secrets in components"
linkTitle: "How-To: Reference secrets"
weight: 200
description: "How to securly reference secrets from a component definition"
---

## Overview

Components can reference secrets for the `spec.metadata` section within the components definition.

In order to reference a secret, you need to set the `auth.secretStore` field to specify the name of the secret store that holds the secrets.

When running in Kubernetes, if the `auth.secretStore` is empty, the Kubernetes secret store is assumed.

### Supported secret stores

Go to [this]({{< ref "howto-secrets.md" >}}) link to see all the secret stores supported by Dapr, along with information on how to configure and use them.

## Examples

Using plain text secrets (not recommended for production):

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: default
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: MyPassword
```

Referencing secret from a secret store:

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: default
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    secretKeyRef:
    	name: redis-secret
        key:  redis-password
auth:
  secretStore: <SECRET_STORE_NAME>
```

When running in Kubernetes and using a Kubernetes secret store, either the field `auth.SecretStore` can be empty (as it is assumed to be Kubernetes secret store) or it needs to be `kubernetes`. For all other secret store, the `SECRET_STORE_NAME` is the name of the configured secret store component.

The above example tells Dapr to extract a secret named `redis-secret` from the defined secret store and assign the value of the `redis-password` key in the secret to the `redisPassword` field in the Component.

### Creating a Kubernetes secret and referencing it in a Component

The following example shows you how to create a Kubernetes secret to hold the connection string for an Event Hubs binding.

First, create the Kubernetes secret:

```bash
kubectl create secret generic eventhubs-secret --from-literal=connectionString=*********
```

Next, reference the secret in your binding:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: eventhubs
  namespace: default
spec:
  type: bindings.azure.eventhubs
  version: v1
  metadata:
  - name: connectionString
    secretKeyRef:
      name: eventhubs-secret
      key: connectionString
```

Finally, apply the component to the Kubernetes cluster:

```bash
kubectl apply -f ./eventhubs.yaml
```
## Kubernetes

### Default namespace 

When running in Kubernetes, Dapr, during installtion, defines default Role and RoleBinding for secrets access from Kubernetes secret store in the `default` namespace. For Dapr enabled apps that fetch secrets from `default` namespace, a secret can be defined and referenced in components as shown in the example above.

### Non default namespaces

If your Dapr enabled apps are using components that fetch secrets from non-default namespaces, apply the following resources to that namespace:

```yaml
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: secret-reader
  namespace: <NAMESPACE>
rules:
- apiGroups: [""]
  resources: ["secrets"]
  verbs: ["get"]
---

kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: dapr-secret-reader
  namespace: <NAMESPACE>
subjects:
- kind: ServiceAccount
  name: default
roleRef:
  kind: Role
  name: secret-reader
  apiGroup: rbac.authorization.k8s.io
```

These resources grant Dapr permissions to get secrets from the Kubernetes secret store for the namespace defined in the Role and RoleBinding.

{{% alert title="Note" color="warning" %}}
In production scenario to limit Dapr's access to certain secret resources alone, you can use the `resourceNames` field. See this [link](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#referring-to-resources) for further explanation.
{{% /alert %}}
