# Setup NATS

## Locally

You can run a NATS server locally using Docker:

```bash
docker run -d --name nats-main -p 4222:4222 -p 6222:6222 -p 8222:8222 nats
```

You can then interact with the server using the client port: `localhost:4222`.

## Kubernetes

The easiest way to install NATS on Kubernetes is by using the [Helm chart](https://github.com/helm/charts/tree/master/stable/nats):

```bash
helm install nats stable/nats
```

This will install NATS into the `default` namespace.
To interact with NATS, find the service with: `kubectl get svc nats-client`.

For example, if installing using the example above, the NATS server client address would be:

`nats-client.default.svc.cluster.local:4222`

## Create a Dapr component

The next step is to create a Dapr component for NATS.

Create the following YAML file named `nats.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: pubsub.nats
  metadata:
  - name: natsURL
    value: <REPLACE-WITH-NATS-SERVER-ADDRESS> # Required. Example: "nats-client.default.svc.cluster.local:4222"
```

The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here](../../concepts/secrets/README.md)

## Apply the configuration

### In Kubernetes

To apply the NATS pub/sub to Kubernetes, use the `kubectl` CLI:

```bash
kubectl apply -f nats.yaml
```

### Running locally

To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.
