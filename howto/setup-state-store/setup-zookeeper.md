# Setup Zookeeper 

## Locally

You can run Zookeeper locally using Docker:

```
docker run --name some-zookeeper --restart always -d zookeeper
```

You can then interact with the server using `localhost:2181`.

## Kubernetes

The easiest way to install Zookeeper on Kubernetes is by using the [Helm chart](https://github.com/helm/charts/tree/master/incubator/zookeeper):

```
helm repo add incubator http://storage.googleapis.com/kubernetes-charts-incubator
helm install zookeeper incubator/zookeeper
```

This will install Zookeeper into the `default` namespace.
To interact with Zookeeper, find the service with: `kubectl get svc zookeeper`.

For example, if installing using the example above, the Zookeeper host address would be:

`zookeeper.default.svc.cluster.local:2181`

## Create a Dapr component

The next step is to create a Dapr component for Zookeeper.

Create the following YAML file named `zookeeper.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.zookeeper
  metadata:
  - name: servers
    value: <REPLACE-WITH-COMMA-DELIMITED-SERVERS> # Required. Example: "zookeeper.default.svc.cluster.local:2181"
  - name: sessionTimeout
    value: <REPLACE-WITH-SESSION-TIMEOUT> # Required. Example: "5s"
  - name: maxBufferSize
    value: <REPLACE-WITH-MAX-BUFFER-SIZE> # Optional. default: "1048576"
  - name: maxConnBufferSize
    value: <REPLACE-WITH-MAX-CONN-BUFFER-SIZE> # Optional. default: "1048576"
  - name: keyPrefixPath
    value: <REPLACE-WITH-KEY-PREFIX-PATH> # Optional.
```

The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here](../../concepts/secrets/README.md)


## Apply the configuration

### In Kubernetes

To apply the Zookeeper state store to Kubernetes, use the `kubectl` CLI:

```
kubectl apply -f zookeeper.yaml
```

### Running locally

To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.
