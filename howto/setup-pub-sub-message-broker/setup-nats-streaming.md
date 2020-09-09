# Setup NATS

## Locally

You can run a NATS server locally using Docker:

```bash
docker run -d -name nats-streaming -p 4222:4222 -p 8222:8222 nats-streaming
```

You can then interact with the server using the client port: `localhost:4222`.

## Kubernetes

Install NATS on Kubernetes by using the [kubectl](https://docs.nats.io/nats-on-kubernetes/minimal-setup):

```bash
# Single server NATS

kubectl apply -f https://raw.githubusercontent.com/nats-io/k8s/master/nats-server/single-server-nats.yml

kubectl apply -f https://raw.githubusercontent.com/nats-io/k8s/master/nats-streaming-server/single-server-stan.yml
```

This will install a single NATS-Streaming and Nats into the `default` namespace.
To interact with NATS, find the service with: `kubectl get svc stan`.

For example, if installing using the example above, the NATS Streaming address would be:

`<YOUR-HOST>:4222`

## Create a Dapr component

The next step is to create a Dapr component for NATS-Streaming.

Create the following YAML file named `nats-stan.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: pubsub.natsstreaming
  metadata:
  - name: natsURL
    value: <REPLACE-WITH-NATS-SERVER-ADDRESS> # Required. example nats://localhost:4222
  - name: natsStreamingClusterID
    value: <REPLACE-WITH-NATS-CLUSTERID> # Required.
    # blow are subscription configuration.
  - name: subscriptionType
    value: <REPLACE-WITH-SUBSCRIPTION-TYPE> # Required. Allowed values: topic, queue.

# following subscription options - only one can be used
  # - name: consumerID
    # value: queuename
  # - name: durableSubscriptionName
  #   value: ""
  # - name: startAtSequence
    # value: 1
  # - name: startWithLastReceived
    # value: false
  - name: deliverAll
    value: true
  # - name: deliverNew
  #   value: false
  # - name: startAtTimeDelta
  #   value: ""
  # - name: startAtTime
  #   value: ""
  # - name: startAtTimeFormat
  #   value: ""
```


The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here](../../concepts/secrets/README.md)

## Apply the configuration

### In Kubernetes

To apply the NATS pub/sub to Kubernetes, use the `kubectl` CLI:

```bash
kubectl apply -f nats-stan.yaml
```

### Running locally

To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.
