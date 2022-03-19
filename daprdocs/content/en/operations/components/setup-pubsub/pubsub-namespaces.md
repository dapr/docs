---
type: docs
title: "HowTo: Configure Pub/Sub components with multiple namespaces"
linkTitle: "Multiple namespaces"
weight: 20000
description: "Use Dapr Pub/Sub with multiple namespaces"
---

In some scenarios, applications can be spread across namespaces and share a queue or topic via PubSub. In this case, the PubSub component must be provisioned on each namespace.

{{% alert title="Note" color="primary" %}}
Namespaces are a Dapr concept used for scoping applications and components. This example uses Kubernetes namespaces, however the Dapr component namespace scoping can be used on any supported platform. Read [How-To: Scope components to one or more applications]({{< ref "component-scopes.md" >}}) for more information on scoping components.
{{% /alert %}}

This example uses the [PubSub sample](https://github.com/dapr/quickstarts/tree/master/pub_sub). The Redis installation and the subscribers are in `namespace-a` while the publisher UI is in `namespace-b`. This solution will also work if Redis is installed on another namespace or if you use a managed cloud service like Azure ServiceBus, AWS SNS/SQS or GCP PubSub.

This is a diagram of the example using namespaces.

<img src="/images/pubsub-multiple-namespaces.png" width=1000>
<br></br>

The table below shows which resources are deployed to which namespaces:

| Resource                | namespace-a | namespace-b |
|------------------------ |-------------|-------------|
| Redis master            | X           |             |
| Redis replicas          | X           |             |
| Dapr's PubSub component | X           | X           |
| Node subscriber         | X           |             |
| Python subscriber       | X           |             |
| React UI publisher      |             | X           |

## Pre-requisites

* [Dapr installed on Kubernetes]({{< ref "kubernetes-deploy.md" >}}) in any namespace since Dapr works at the cluster level.
* Checkout and cd into the directory for [PubSub quickstart](https://github.com/dapr/quickstarts/tree/master/pub_sub).

## Setup `namespace-a`

Create namespace and switch kubectl to use it.
```
kubectl create namespace namespace-a
kubectl config set-context --current --namespace=namespace-a
```

Install Redis (master and slave) on `namespace-a`, following [these instructions]({{< ref "getting-started/tutorials/configure-state-pubsub.md" >}}).

Now, configure `deploy/redis.yaml`, paying attention to the hostname containing `namespace-a`.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: "redisHost"
    value: "redis-master.namespace-a.svc:6379"
  - name: "redisPassword"
    value: "YOUR_PASSWORD"
```

Deploy resources to `namespace-a`:
```
kubectl apply -f deploy/redis.yaml
kubectl apply -f deploy/node-subscriber.yaml
kubectl apply -f deploy/python-subscriber.yaml
```

## Setup `namespace-b`

Create namespace and switch kubectl to use it.
```
kubectl create namespace namespace-b
kubectl config set-context --current --namespace=namespace-b
```

Deploy resources to `namespace-b`, including the Redis component:
```
kubectl apply -f deploy/redis.yaml
kubectl apply -f deploy/react-form.yaml
```

Now, find the IP address for react-form, open it on your browser and publish messages to each topic (A, B and C).
```
kubectl get service -A
```

## Confirm subscribers received the messages.

Switch back to `namespace-a`:
```
kubectl config set-context --current --namespace=namespace-a
```

Find the POD names:
```
kubectl get pod # Copy POD names and use in the next commands.
```

Display logs:
```
kubectl logs node-subscriber-XYZ node-subscriber
kubectl logs python-subscriber-XYZ python-subscriber
```

The messages published on the browser should show in the corresponding subscriber's logs. The Node.js subscriber receives messages of type "A" and "B", while the Python subscriber receives messages of type "A" and "C".

## Clean up

```
kubectl delete -f deploy/redis.yaml  --namespace namespace-a
kubectl delete -f deploy/node-subscriber.yaml  --namespace namespace-a
kubectl delete -f deploy/python-subscriber.yaml  --namespace namespace-a
kubectl delete -f deploy/react-form.yaml  --namespace namespace-b
kubectl delete -f deploy/redis.yaml  --namespace namespace-b
kubectl config set-context --current --namespace=default
kubectl delete namespace namespace-a
kubectl delete namespace namespace-b
```

## Related links

- [Scope components to one or more applications]({{< ref "component-scopes.md" >}})
- [Use secret scoping]({{< ref "secrets-scopes.md" >}})
- [Limit the secrets that can be read from secret stores]({{< ref "secret-scope.md" >}})
