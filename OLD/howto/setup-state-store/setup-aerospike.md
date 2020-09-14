# Setup Aerospike 

## Locally

You can run Aerospike locally using Docker:

```
docker run -d --name aerospike -p 3000:3000 -p 3001:3001 -p 3002:3002 -p 3003:3003 aerospike
```

You can then interact with the server using `localhost:3000`.

## Kubernetes

The easiest way to install Aerospike on Kubernetes is by using the [Helm chart](https://github.com/helm/charts/tree/master/stable/aerospike):

```
helm repo add incubator http://storage.googleapis.com/kubernetes-charts-incubator
helm install --name my-aerospike --namespace aerospike stable/aerospike
```

This will install Aerospike into the `aerospike` namespace.
To interact with Aerospike, find the service with: `kubectl get svc aerospike -n aerospike`.

For example, if installing using the example above, the Aerospike host address would be:

`aerospike-my-aerospike.aerospike.svc.cluster.local:3000`

## Create a Dapr component

The next step is to create a Dapr component for Aerospike.

Create the following YAML file named `aerospike.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.Aerospike
  metadata:
  - name: hosts
    value: <REPLACE-WITH-HOSTS> # Required. A comma delimited string of hosts. Example: "aerospike:3000,aerospike2:3000"
  - name: namespace
    value: <REPLACE-WITH-NAMESPACE> # Required. The aerospike namespace.
  - name: set
    value: <REPLACE-WITH-SET> # Optional.
```

The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here](../../concepts/secrets/README.md).


## Apply the configuration

### In Kubernetes

To apply the Aerospike state store to Kubernetes, use the `kubectl` CLI:

```
kubectl apply -f aerospike.yaml
```

### Running locally

To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.
