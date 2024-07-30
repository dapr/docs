---
type: docs
title: "How To: Use secret scoping"
linkTitle: "How To: Use secret scoping"
weight: 3000
description: "Use scoping to limit the secrets that can be read by your application from secret stores"
---

Once you [configure a secret store for your application]({{< ref setup-secret-store >}}), *any* secret defined within that store is accessible by default from the Dapr application. 

You can limit the Dapr application's access to specific secrets by defining secret scopes. Simply add a secret scope policy [to the application configuration]({{< ref configuration-concept.md >}}) with restrictive permissions.

The secret scoping policy applies to any [secret store]({{< ref supported-secret-stores.md >}}), including:

- A local secret store
- A Kubernetes secret store
- A public cloud secret store

For details on how to set up a [secret store]({{< ref setup-secret-store.md >}}), read [How To: Retrieve a secret]({{< ref howto-secrets.md >}}).

Watch [this video](https://youtu.be/j99RN_nxExA?start=2272) for a demo on how to use secret scoping with your application.

<div class="embed-responsive embed-responsive-16by9">
<iframe width="688" height="430" src="https://www.youtube-nocookie.com/embed/j99RN_nxExA?start=2272" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## Scenario 1 : Deny access to all secrets for a secret store

In this example, all secret access is denied to an application running on a Kubernetes cluster, which has a configured [Kubernetes secret store]({{< ref kubernetes-secret-store >}}) named `mycustomsecretstore`. Aside from the user-defined custom store, the example also configures the Kubernetes default store (named `kubernetes`) to ensure all secrets are denied access. [Learn more about the Kubernetes default secret store]({{< ref "kubernetes-secret-store.md#default-kubernetes-secret-store-component" >}}).

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

For applications that need to be denied access to the Kubernetes secret store, follow [these instructions]({{< ref kubernetes-overview.md >}}), and add the following annotation to the application pod:

```yaml
dapr.io/config: appconfig
```

With this defined, the application no longer has access to any secrets in the Kubernetes secret store.

## Scenario 2 : Allow access to only certain secrets in a secret store

This example uses a secret store named `vault`. This could be a Hashicorp secret store component set on your application. To allow a Dapr application to have access to only `secret1` and `secret2` in the `vault` secret store, define the following `appconfig.yaml`:

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

The default access to the `vault` secret store is `deny`, while some secrets are accessible by the application, based on the `allowedSecrets` list. [Learn how to apply configuration to the sidecar]({{< ref configuration-concept.md >}}).

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

This example configuration explicitly denies access to `secret1` and `secret2` from the secret store named `vault` while allowing access to all other secrets. [Learn how to apply configuration to the sidecar]({{< ref configuration-concept.md >}}).

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

- List of [secret stores]({{< ref supported-secret-stores.md >}})
- Overview of [secret stores]({{< ref setup-secret-store.md >}})
