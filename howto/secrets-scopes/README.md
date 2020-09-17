# Limit the secrets that can be read from secret stores 

Secret stores can be configured for an app following the instructions [here](../setup-secret-store). At the same time once a secret store is configured, any secret defined within the store can be accessed by the Dapr application. 

To limit the secrets that the Dapr application has access to, you can define scopes for secrets. For this the existing configuration CRD can by augmented with restrictive permissions for secret stores. 

The configuration CRD is defined following the instructions [here](../../concepts/configuration/README.md).

## Scenario 1 : Deny access to all secrets for a secret store

Kubernetes secret store is by default added to a Dapr application, when the application is run in a Kubernetes cluster. In the scenario where it would be preferrable to deny access to the secret store for the application, either because no secrets are going to be accessed or for other security reasons, the following steps can be taken. 

Define the following `appconfig.yaml` and apply it to the Kubernetes cluster using the command `kubectl apply -f appconfig.yaml`.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  secrets:
    scopes:
      - storeName: kubernetes
        defaultAcess: deny
```

Following the instructions [here](../configure-k8s/README.md), for the application that needs to be deined access to the Kubernetes secret store, add the following annotation. 

```yaml
dapr.io/config: appconfig
```

With this defined, the application no longer has access to Kubernetes secret store. 

## Scenario 2 : Allow access to only certain secrets in a secret store

Define the following `config.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  secrets:
    scopes:
      - storeName: vault
        defaultAcess: deny
        allowedSecrets: ["secret1", "secret2"]
```

Here the example configuration defines scope for a vault secret store. The default access to the secret store is "deny" whereas based on the `allowedSecrets` list, a couple of secrets can be accessed by the application. The configuration can be applied to the sidecar following the instructions [here](../../concepts/configuration/README.md). 

## Scenario 3: Deny access to certain senstive secrets in a secret store

Define the following `config.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  secrets:
    scopes:
      - storeName: vault
        defaultAcess: allow # this is the default value, line can be omitted
        deniedSecrets: ["secret1", "secret2"]
```

The configuration specifically denies access to `secret1` and `secret2` from the secret store named `vault`. All the other secrets can be queried from the secret store. The configuration can be applied to the sidecar following the instructions [here](../../concepts/configuration/README.md). 

## Permission priority

The `allowedSecrets` and `deniedSecrets` list values take priorty over the `defaultAccess`.

Scenarios | defaultAccess | allowedSecrets | deniedSecrets | permission
---- | ------- | -----------| ----------| ------------
1 - Only default access  | deny/allow | empty | empty | deny/allow
2 - Default deny with allowed list | deny | ["s1"] | empty | only "s1" can be accessed
3 - Default allow with deneied list | allow | empty | ["s1"] | only "s1" cannot be accessed
4 - Default allow with allowed list  | allow | ["s1"] | empty | only "s1" can be accessed
5 - Default deny with denied list  | deny | empty | ["s1"] | deny
6 - Default deny/allow with both lists  | deny/allow | ["s1"] | ["s2"] | only "s1" can be accessed




