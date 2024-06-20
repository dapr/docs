---
type: docs
title: "Namespaced actors"
linkTitle: "Namespaced actors"
weight: 40
description: "Learn about namespaced actors"
---


Namespacing in Dapr provides isolation, and thus multi-tenancy. With actor namespacing, the same actor type can be deployed into different namespaces. You can call instances of these actors in the same namespace. 

{{% alert title="Note" color="primary" %}}
Each namespaced actor deployment must use its own separate state store, especially if the same actor type is used across namespaces. In other words, no namespace information is written as part of the actor record, and hence separate state stores are required for each namespace. See [Configuring actor state stores for namespacing]({{< ref "#configuring-actor-state-stores-for-namespacing" >}}) section for examples.
{{% /alert %}}

## Creating and configuring namespaces

You can use namespaces either in self-hosted mode or on Kubernetes.

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
In self-hosted mode, you can specify the namespace for a Dapr instance by setting [the `NAMESPACE` environment variable]({{< ref environment.md >}}).

{{% /codetab %}}

{{% codetab %}}
On Kubernetes, you can create and configure namepaces when deploying actor applications. For example, start with the following `kubectl` commands:

```bash
kubectl create namespace namespace-actorA
kubectl config set-context --current --namespace=namespace-actorA
```

Then, deploy your actor applications into this namespace (in the example, `namespace-actorA`).

{{% /codetab %}}

{{< /tabs >}}

## Configuring actor state stores for namespacing

Each namespaced actor deployment **must** use its own separate state store. While you could use different physical databases for each actor namespace, some state store components provide a way to logically separate data by table, prefix, collection, and more. This allows you to use the same physical database for multiple namespaces, as long as you provide the logical separation in the Dapr component definition.

Some examples are provided below.

### Example 1: By a prefix in etcd

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.etcd
  version: v2
  metadata:
  - name: endpoints
    value: localhost:2379
  - name: keyPrefixPath
    value: namespace-actorA
  - name: actorStateStore
    value: "true"
```

### Example 2: By table name in SQLite

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.sqlite
  version: v1
  metadata:
  - name: connectionString
    value: "data.db"
  - name: tableName
    value: "namespace-actorA"
  - name: actorStateStore
    value: "true"
```

### Example 3: By logical database number in Redis

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
  - name: actorStateStore
    value: "true"
  - name: redisDB
    value: "1"
  - name: redisPassword
    secretKeyRef:
      name: redis-secret
      key:  redis-password
  - name: actorStateStore
    value: "true"
  - name: redisDB
    value: "1"
auth:
  secretStore: <SECRET_STORE_NAME>
```

Check your [state store component specs]({{< ref supported-state-stores.md >}}) to see what it provides.

{{% alert title="Note" color="primary" %}}
Namespaced actors use the multi-tenant Placement service. With this control plane service where each application deployment has its own namespace, sidecars belonging to an application in namespace "ActorA" won't receive placement information for an application in namespace "ActorB".
{{% /alert %}}

## Next steps
- [Learn more about the Dapr Placement service]({{< ref placement.md >}})
- [Placement API reference guide]({{< ref placement_api.md >}})