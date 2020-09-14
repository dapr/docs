# Setup Kafka

## Locally

You can run Kafka locally using [this](https://github.com/wurstmeister/kafka-docker) Docker image.
To run without Docker, see the getting started guide [here](https://kafka.apache.org/quickstart).

## Kubernetes

To run Kafka on Kubernetes, you can use the [Helm Chart](https://github.com/helm/charts/tree/master/incubator/kafka#installing-the-chart).

## Create a Dapr component

The next step is to create a Dapr component for Kafka.

Create the following YAML file named `kafka.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: pubsub.kafka
  metadata:
      # Kafka broker connection setting
    - name: brokers
      # Comma separated list of kafka brokers
      value: "dapr-kafka.dapr-tests.svc.cluster.local:9092"
      # Enable auth. Default is "false"
    - name: authRequired
      value: "false"
      # Only available is authRequired is set to true
    - name: saslUsername
      value: <username>
      # Only available is authRequired is set to true
    - name: saslPassword
      value: <password>
```

The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here](../../concepts/secrets/README.md).

## Apply the configuration

### In Kubernetes

To apply the Kafka component to Kubernetes, use the `kubectl`:

```
kubectl apply -f kafka.yaml
```

### Running locally

To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.
