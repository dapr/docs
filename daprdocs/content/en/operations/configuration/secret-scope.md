---
type: docs
title: "How-To: Limit the secrets that can be read from secret stores"
linkTitle: "Limit secret store access"
weight: 3000
description: "To limit the secrets to which the Dapr application has access, users can define secret scopes by augmenting existing configuration resource with restrictive permissions."
---

In addition to scoping which applications can access a given component, for example a secret store component (see [Scoping components]({{< ref "component-scopes.md">}})), a named secret store component itself can be scoped to one or more secrets for an application. By defining `allowedSecrets` and/or `deniedSecrets` list, applications can be restricted to access only specific secrets.

Follow [these instructions]({{< ref "configuration-overview.md" >}}) to define a configuration resource.

## Configure secrets access

The `secrets` section under the `Configuration` spec contains the following properties:

```yml
secrets:
  scopes:
    - storeName: kubernetes
      defaultAccess: allow
      allowedSecrets: ["redis-password"]
    - storeName: localstore
      defaultAccess: allow
      deniedSecrets: ["redis-password"]
```

The following table lists the properties for secret scopes:

| Property       | Type   | Description |
|----------------|--------|-------------|
| storeName      | string | Name of the secret store component. storeName must be unique within the list
| defaultAccess  | string | Access modifier. Accepted values "allow" (default) or "deny"
| allowedSecrets | list   | List of secret keys that can be accessed
| deniedSecrets  | list   | List of secret keys that cannot be accessed

When an `allowedSecrets` list is present with at least one element, only those secrets defined in the list can be accessed by the application.

## Permission priority

The `allowedSecrets` and `deniedSecrets` list values take priorty over the `defaultAccess`.

| Scenarios | defaultAccess | allowedSecrets | deniedSecrets | permission
|----- | ------- | -----------| ----------| ------------
| 1 - Only default access  | deny/allow | empty | empty | deny/allow
| 2 - Default deny with allowed list | deny | ["s1"] | empty | only "s1" can be accessed
| 3 - Default allow with denied list | allow | empty | ["s1"] | only "s1" cannot be accessed
| 4 - Default allow with allowed list  | allow | ["s1"] | empty | only "s1" can be accessed
| 5 - Default deny with denied list  | deny | empty | ["s1"] | deny
| 6 - Default deny/allow with both lists  | deny/allow | ["s1"] | ["s2"] | only "s1" can be accessed

## Examples

### Scenario 1 : Deny access to all secrets for a secret store

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

For applications that need to be denied access to the Kubernetes secret store, follow [these instructions]({{< ref kubernetes-overview >}}), and add the following annotation to the application pod.

```yaml
dapr.io/config: appconfig
```

With this defined, the application no longer has access to Kubernetes secret store.

### Scenario 2 : Allow access to only certain secrets in a secret store

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

This example defines configuration for secret store named vault. The default access to the secret store is `deny`, whereas some secrets are accessible by the application based on the `allowedSecrets` list. Follow [these instructions]({{< ref configuration-overview.md >}}) to apply configuration to the sidecar.

### Scenario 3: Deny access to certain sensitive secrets in a secret store

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

The above configuration explicitly denies access to `secret1` and `secret2` from the secret store named vault while allowing access to all other secrets. Follow [these instructions]({{< ref configuration-overview.md >}}) to apply configuration to the sidecar.
