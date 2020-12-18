---
type: docs
title: "How To: Use secret scoping"
linkTitle: "Secret scoping"
weight: 3000
description: "Use scoping to limit the secrets that can be read from secret stores"
type: docs
---

Follow [these instructions]({{< ref setup-secret-store >}}) to configure secret store for an application. Once configured, any secret defined within that store will be accessible from the Dapr application.

To limit the secrets to which the Dapr application has access, users can define secret scopes by augmenting existing configuration CRD with restrictive permissions.

Follow [these instructions]({{< ref configuration-concept.md >}}) to define a configuration CRD.

## Scenario 1 : Deny access to all secrets for a secret store

In Kubernetes cluster, the native Kubernetes secret store is added to Dapr application by default. In some scenarios it may be necessary to deny access to Dapr secrets for a given application. To add this configuration follow the steps below:

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
        defaultAccess: deny
```

For applications that need to be denied access to the Kubernetes secret store, follow [these instructions]({{< ref kubernetes-overview.md >}}), and add the following annotation to the application pod. 

```yaml
dapr.io/config: appconfig
```

With this defined, the application no longer has access to Kubernetes secret store. 

## Scenario 2 : Allow access to only certain secrets in a secret store

To allow a Dapr application to have access to only certain secrets, define the following `config.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  secrets:
    scopes:
      - storeName: vault
        defaultAccess: deny
        allowedSecrets: ["secret1", "secret2"]
```

This example defines configuration for secret store named vault. The default access to the secret store is `deny`, whereas some secrets are accessible by the application based on the `allowedSecrets` list. Follow [these instructions]({{< ref configuration-concept.md >}}) to apply configuration to the sidecar.

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
        defaultAccess: allow # this is the default value, line can be omitted
        deniedSecrets: ["secret1", "secret2"]
```

The above configuration explicitly denies access to `secret1` and `secret2` from the secret store named vault while allowing access to all other secrets. Follow [these instructions]({{< ref configuration-concept.md >}}) to apply configuration to the sidecar.

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




