---
type: docs
title: "How-To: Reference secrets in components"
linkTitle: "Reference secrets in components"
weight: 400
description: "How to securly reference secrets from a component definition"
---

## Overview

Components can reference secrets for the `spec.metadata` section within the components definition.

In order to reference a secret, you need to set the `auth.secretStore` field to specify the name of the secret store that holds the secrets.

When running in Kubernetes, if the `auth.secretStore` is empty, the Kubernetes secret store is assumed.

### Supported secret stores

Go to [this]({{< ref "howto-secrets.md" >}}) link to see all the secret stores supported by Dapr, along with information on how to configure and use them.

## Referencing secrets

While you have the option to use plain text secrets (like MyPassword), as shown in the yaml below for the `value` of `redisPassword`, this is not recommended for production:

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

Instead create the secret in your secret store and reference it in the component definition.  There are two cases for this shown below -- the "Secret contains an embedded key" and the "Secret is a string".

The "Secret contains an embedded key" case applies when there is a key embedded within the secret, i.e. the secret is **not** an entire connection string. This is shown in the following component definition yaml.

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

`SECRET_STORE_NAME` is the name of the configured [secret store component]({{< ref supported-secret-stores >}}). When running in Kubernetes and using a Kubernetes secret store, the field `auth.SecretStore` defaults to `kubernetes` and can be left empty.

The above component definition tells Dapr to extract a secret named `redis-secret` from the defined `secretStore` and assign the value associated with the `redis-password` key embedded in the secret to the `redisPassword` field in the component. One use of this case is when your code is constructing a connection string, for example putting together a URL, a secret, plus other information as necessary, into a string.

On the other hand, the below "Secret is a string" case applies when there is NOT a key embedded in the secret. Rather, the secret is just a string. Therefore, in the `secretKeyRef` section both the secret `name` and the secret `key` will be identical. This is the case when the secret itself is an entire connection string with no embedded key whose value needs to be extracted. Typically a connection string consists of connection information, some sort of secret to allow connection, plus perhaps other information and does not require a separate "secret". This case is shown in the below component definition yaml.

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: servicec-inputq-azkvsecret-asbqueue
spec:
  type: bindings.azure.servicebusqueues
  version: v1
  metadata:
  -name: connectionString
  secretKeyRef:
      name: asbNsConnString
      key: asbNsConnString
  -name: queueName
   value: servicec-inputq
auth:
secretStore: <SECRET_STORE_NAME>

```
The above "Secret is a string" case yaml tells Dapr to extract a connection string named `asbNsConnstring` from the defined `secretStore` and assign the value to the `connectionString` field in the component since there is no key embedded in the "secret" from the `secretStore` because it is a plain string. This requires the secret `name` and secret `key` to be identical.

## Example

### Referencing a Kubernetes secret

The following example shows you how to create a Kubernetes secret to hold the connection string for an Event Hubs binding.

1. First, create the Kubernetes secret:
    ```bash
     kubectl create secret generic eventhubs-secret --from-literal=connectionString=*********
    ```

2. Next, reference the secret in your binding:
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

3. Finally, apply the component to the Kubernetes cluster:
    ```bash
    kubectl apply -f ./eventhubs.yaml
    ```

## Scoping access to secrets

Dapr can restrict access to secrets in a secret store using its configuration. Read [How To: Use secret scoping]({{< ref "secrets-scopes.md" >}}) and  [How-To: Limit the secrets that can be read from secret stores]({{< ref "secret-scope.md" >}}) for more information. This is the recommended way to limit access to secrets using Dapr.

## Kubernetes permissions

### Default namespace

When running in Kubernetes, Dapr, during installtion, defines default Role and RoleBinding for secrets access from Kubernetes secret store in the `default` namespace. For Dapr enabled apps that fetch secrets from `default` namespace, a secret can be defined and referenced in components as shown in the example above.

### Non-default namespaces

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
  verbs: ["get", "list"]
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

## Related links

- [Use secret scoping]({{< ref "secrets-scopes.md" >}})
- [Limit the secrets that can be read from secret stores]({{< ref "secret-scope.md" >}})
