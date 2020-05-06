# Using PubSub across multiple namespaces

In some scenarios, applications can be spread across namespaces and share a queue or topic via PubSub. In this case, the PubSub component must be provisioned on each namespace.

In this example, we will use the [PubSub sample](https://github.com/dapr/samples/tree/master/4.pub-sub). Redis installation and the subscribers will be in `namespace-a` while the publisher UI will be on `namespace-b`. This solution should also work if Redis was installed on another namespace or if we used a managed cloud service like Azure ServiceBus.

The table below shows which resources are deployed to which namespaces:
| Resource | namespace-a | namespace-b |
|-|-|-|
| Redis master | X ||
| Redis slave | X ||
| Dapr's PubSub component | X | X |
| Node subscriber | X ||
| Python subscriber | X ||
| React UI publisher | | X|

## Pre-requisites

* [Dapr installed](https://github.com/dapr/docs/blob/master/getting-started/environment-setup.md.) on any namespace since Dapr works at the cluster level.
* Checkout and cd into directory for [PubSub sample](https://github.com/dapr/samples/tree/master/4.pub-sub).

## Setup `namespace-a`

Create namespace and switch kubectl to use it.
```
kubectl create namespace namespace-a
kubectl config set-context --current --namespace=namespace-a
```

Install Redis (master and slave) on `namespace-a`, following [these instructions](https://github.com/dapr/docs/blob/master/howto/setup-pub-sub-message-broker/setup-redis.md).

Now, configure `deploy/redis.yaml`, paying attention to the hostname containing `namespace-a`.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: messagebus
  namespace: default
spec:
  type: pubsub.redis
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