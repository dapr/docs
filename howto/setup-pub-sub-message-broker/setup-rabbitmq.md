# Setup RabbitMQ 

## Locally

You can run a RabbitMQ server locally using Docker:

```
docker run -d --hostname my-rabbit --name some-rabbit rabbitmq:3
```

You can then interact with the server using the client port: `localhost:5672`.

## Kubernetes

The easiest way to install RabbitMQ on Kubernetes is by using the [Helm chart](https://github.com/helm/charts/tree/master/stable/rabbitmq):

```
helm install rabbitmq stable/rabbitmq
```

Look at the chart output and get the username and password.

This will install RabbitMQ into the `default` namespace.
To interact with RabbitMQ, find the service with: `kubectl get svc rabbitmq`.

For example, if installing using the example above, the RabbitMQ server client address would be:

`rabbitmq.default.svc.cluster.local:5672`

## Create a Dapr component

The next step is to create a Dapr component for RabbitMQ.

Create the following YAML file named `rabbitmq.yaml`:

```
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <name>
spec:
  type: pubsub.rabbitmq
  metadata:
  - name: host
    value: <REPLACE-WITH-HOST> # Required. Example: "rabbitmq.default.svc.cluster.local:5672"
  metadata:
  - name: consumerID
    value: <REPLACE-WITH-CONSUMER-ID> # Required. Any unique ID. Example: "myConsumerID"
  metadata:
  - name: durable
    value: <REPLACE-WITH-DURABLE> # Optional. Default: "false"
  metadata:
  - name: deletedWhenUnused
    value: <REPLACE-WITH-DELETE-WHEN-UNUSED> # Optional. Default: "false"
  metadata:
  - name: autoAck
    value: <REPLACE-WITH-AUTO-ACK> # Optional. Default: "false"
  metadata:
  - name: deliveryMode
    value: <REPLACE-WITH-DELIVERY-MODE> # Optional. Default: "0". Values between 0 - 2.
  metadata:
  - name: requeueInFailure
    value: <REPLACE-WITH-REQUEUE-IN-FAILURE> # Optional. Default: "false".
```

The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here](../../concepts/components/secrets.md)


## Apply the configuration

### In Kubernetes

To apply the RabbitMQ pub/sub to Kubernetes, use the `kubectl` CLI:

```
kubectl apply -f rabbitmq.yaml
```

### Running locally

The Dapr CLI will automatically create a directory named `components` in your current working directory with a Redis component.
To use RabbitMQ, replace the contents of `messagebus.yaml` file with the contents of `rabbitmq.yaml` above (Don't change the filename).