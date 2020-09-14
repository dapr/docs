# Setup Memcached 

## Locally

You can run Memcached locally using Docker:

```
docker run --name my-memcache -d memcached
```

You can then interact with the server using `localhost:11211`.

## Kubernetes

The easiest way to install Memcached on Kubernetes is by using the [Helm chart](https://github.com/helm/charts/tree/master/stable/memcached):

```
helm install memcached stable/memcached
```

This will install Memcached into the `default` namespace.
To interact with Memcached, find the service with: `kubectl get svc memcached`.

For example, if installing using the example above, the Memcached host address would be:

`memcached.default.svc.cluster.local:11211`

## Create a Dapr component

The next step is to create a Dapr component for Memcached.

Create the following YAML file named `memcached.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.memcached
  metadata:
  - name: hosts
    value: <REPLACE-WITH-COMMA-DELIMITED-ENDPOINTS> # Required. Example: "memcached.default.svc.cluster.local:11211"
  - name: maxIdleConnections
    value: <REPLACE-WITH-MAX-IDLE-CONNECTIONS> # Optional. default: "2"
  - name: timeout
    value: <REPLACE-WITH-TIMEOUT> # Optional. default: "1000ms"
```

The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here](../../concepts/secrets/README.md)


## Apply the configuration

### In Kubernetes

To apply the Memcached state store to Kubernetes, use the `kubectl` CLI:

```
kubectl apply -f memcached.yaml
```

### Running locally

To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.
