---
type: docs
title: "How To: Use secret scoping"
linkTitle: "How To: Use secret scoping"
weight: 3000
description: "Use scoping to limit the secrets that can be read by your application from secret stores"
type: docs
---

You can read [guidance on setting up secret store components]({{< ref setup-secret-store >}}) to configure a secret store for an application. Once configured, by default *any* secret defined within that store is accessible from the Dapr application.

To limit the secrets to which the Dapr application has access to, you can define secret scopes by adding a secret scope policy to the application configuration with restrictive permissions. Follow [these instructions]({{< ref configuration-concept.md >}}) to define an application configuration.

The secret scoping policy applies to any [secret store]({{< ref supported-secret-stores.md >}}), whether that is a local secret store, a Kubernetes secret store or a public cloud secret store. For details on how to set up a [secret stores]({{< ref setup-secret-store.md >}}) read [How To: Retrieve a secret]({{< ref howto-secrets.md >}})

Watch this [video](https://youtu.be/j99RN_nxExA?start=2272) for a demo on how to use secret scoping with your application.

<div class="embed-responsive embed-responsive-16by9">
<iframe width="688" height="430" src="https://www.youtube.com/embed/j99RN_nxExA?start=2272" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## Scenario 1 : Deny access to all secrets for a secret store

In this example all secret access is denied to an application running on a Kubernetes cluster which has a configured [Kubernetes secret store]({{<ref kubernetes-secret-store>}}) named `mycustomsecretstore`. In the case of Kubernetes, aside from the user defined custom store, the default store named `kubernetes` is also addressed to ensure all secrets are denied access (See [here]({{<ref "kubernetes-secret-store.md#default-kubernetes-secret-store-component">}}) to learn more about the Kubernetes default secret store).

To add this configuration follow the steps below:

Define the following `appconfig.yaml` configuration and apply it to the Kubernetes cluster using the command `kubectl apply -f appconfig.yaml`.

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
      - storeName: mycustomsecreststore
        defaultAccess: deny
```

For applications that need to be denied access to the Kubernetes secret store, follow [these instructions]({{< ref kubernetes-overview.md >}}), and add the following annotation to the application pod.

```yaml
dapr.io/config: appconfig
```

With this defined, the application no longer has access to any secrets in the Kubernetes secret store.

## Scenario 2 : Allow access to only certain secrets in a secret store

This example uses a secret store that is named `vault`. For example this could be a Hashicorp secret store component that has been set on your application. To allow a Dapr application to have access to only certain secrets `secret1` and `secret2` in the `vault` secret store, define the following `appconfig.yaml`:

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

This example defines configuration for secret store named `vault`. The default access to the secret store is `deny`, whereas some secrets are accessible by the application based on the `allowedSecrets` list. Follow [these instructions]({{< ref configuration-concept.md >}}) to apply configuration to the sidecar.

## Scenario 3: Deny access to certain sensitive secrets in a secret store

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

This example uses a secret store that is named `vault`. The above configuration explicitly denies access to `secret1` and `secret2` from the secret store named vault while allowing access to all other secrets. Follow [these instructions]({{< ref configuration-concept.md >}}) to apply configuration to the sidecar.

## Permission priority

The `allowedSecrets` and `deniedSecrets` list values take priority over the `defaultAccess` policy.

Scenarios | defaultAccess | allowedSecrets | deniedSecrets | permission
---- | ------- | -----------| ----------| ------------
1 - Only default access  | deny/allow | empty | empty | deny/allow
2 - Default deny with allowed list | deny | ["s1"] | empty | only "s1" can be accessed
3 - Default allow with deneied list | allow | empty | ["s1"] | only "s1" cannot be accessed
4 - Default allow with allowed list  | allow | ["s1"] | empty | only "s1" can be accessed
5 - Default deny with denied list  | deny | empty | ["s1"] | deny
6 - Default deny/allow with both lists  | deny/allow | ["s1"] | ["s2"] | only "s1" can be accessed

## Related links
* List of [secret stores]({{< ref supported-secret-stores.md >}})
* Overview of [secret stores]({{< ref setup-secret-store.md >}})

howto-secrets/