---
type: docs
title: "How-To: Reference secret stores in components"
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

## Non default namespaces

If your Dapr enabled apps are using components that fetch secrets from non-default namespaces, apply the following resources to the namespace:

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

## Examples

Using plain text:

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: default
spec:
  type: state.redis
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: MyPassword
```

Using a Kubernetes secret:

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: default
spec:
  type: state.redis
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    secretKeyRef:
    	name: redis-secret
        key:  redis-password
auth:
  secretStore: kubernetes
```

The above example tells Dapr to use the `kubernetes` secret store, extract a secret named `redis-secret` and assign the value of the `redis-password` key in the secret to the `redisPassword` field in the Component.

### Creating a secret and referencing it in a Component

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

All done!
