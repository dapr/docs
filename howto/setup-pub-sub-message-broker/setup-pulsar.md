# Setup-Pulsar

## Locally
```
docker run -it \
  -p 6650:6650 \
  -p 8080:8080 \
  --mount source=pulsardata,target=/pulsar/data \
  --mount source=pulsarconf,target=/pulsar/conf \
  apachepulsar/pulsar:2.5.1 \
  bin/pulsar standalone

```

## Kubernetes

Please refer to the following [Helm chart](https://pulsar.apache.org/docs/en/kubernetes-helm/) Documentation.

## Create a Dapr component

The next step is to create a Dapr component for Pulsar.

Create the following YAML file named pulsar.yaml:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: pubsub.pulsar
  metadata:
  - name: host
    value: <REPLACE WITH PULSAR URL> #default is localhost:6650
  - name: enableTLS
    value: <TRUE/FALSE>

```

## Apply the configuration

To apply the Pulsar pub/sub to Kubernetes, use the kubectl CLI:

`` kubectl apply -f pulsar.yaml ``

### Running locally ###

To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.
