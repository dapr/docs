---
type: docs
title: "How-To: Scope components to one or more applications"
linkTitle: "Scope access to components"
weight: 300
description: "Limit component access to particular Dapr instances"
---

Dapr components are namespaced (separate from the Kubernetes namespace concept), meaning a Dapr runtime instance can only access components that have been deployed to the same namespace.

When Dapr runs, it matches it's own configured namespace with the namespace of the components that it loads and initializes only the ones matching its namespaces. All other components in a different namespace are not loaded.

## Namespaces
Namespaces can be used to limit component access to particular Dapr instances.

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
In self hosted mode, a developer can specify the namespace to a Dapr instance by setting the `NAMESPACE` environment variable.
If the `NAMESPACE` environment variable is set, Dapr does not load any component that does not specify the same namespace in its metadata.

For example given this component in the `production` namespace
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: production
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: redis-master:6379
```

To tell Dapr which namespace it is deployed to, set the environment variable:

MacOS/Linux:

```bash
export NAMESPACE=production
# run Dapr as usual
```
Windows:

```powershell
setx NAMESPACE "production"
# run Dapr as usual
```
{{% /codetab %}}

{{% codetab %}}
Let's consider the following component in Kubernetes:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: production
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: redis-master:6379
```

In this example, the Redis component is only accessible to Dapr instances running inside the `production` namespace.
{{% /codetab %}}

{{< /tabs >}}

{{% alert title="Note" color="primary" %}}
The component YAML applied to namespace "A" can *reference* the implementation in namespace "B". For example, a component YAML for Redis in namespace "production-A" can point the Redis host address to the Redis instance deployed in namespace "production-B". 

See [Configure Pub/Sub components with multiple namespaces]({{< ref "pubsub-namespaces.md" >}}) for an example.
{{% /alert %}}

## Application access to components with scopes
Developers and operators might want to limit access to one database from a certain application, or a specific set of applications.
To achieve this, Dapr allows you to specify `scopes` on the component YAML. Application scopes added to a component limit only the applications with specific IDs from using the component.

The following example shows how to give access to two Dapr enabled apps, with the app IDs of `app1` and `app2` to the Redis component named `statestore` which itself is in the `production` namespace

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: production
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: redis-master:6379
scopes:
- app1
- app2
```
### Community call demo

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube.com/embed/8W-iBDNvCUM?start=1763" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## Using namespaces with service invocation
Read [Service invocation across namespaces]({{< ref "service-invocation-namespaces.md" >}}) for more information on using namespaces when calling between services.

## Using namespaces with pub/sub
Read [Configure Pub/Sub components with multiple namespaces]({{< ref "pubsub-namespaces.md" >}}) for more information on using namespaces with pub/sub.

## Related links

- [Configure Pub/Sub components with multiple namespaces]({{< ref "pubsub-namespaces.md" >}})
- [Use secret scoping]({{< ref "secrets-scopes.md" >}})
- [Limit the secrets that can be read from secret stores]({{< ref "secret-scope.md" >}})
