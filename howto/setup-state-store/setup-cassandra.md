# Setup Cassandra 

## Locally

You can run Cassandra locally with the Datastax Docker image:

```
docker run -e DS_LICENSE=accept --memory 4g --name my-dse -d datastax/dse-server -g -s -k
```

You can then interact with the server using `localhost:9042`.

## Kubernetes

The easiest way to install Cassandra on Kubernetes is by using the [Helm chart](https://github.com/helm/charts/tree/master/incubator/cassandra):

```
kubectl create namespace cassandra
helm install cassandra incubator/cassandra --namespace cassandra
```

This will install Cassandra into the `cassandra` namespace by default.
To interact with Cassandra, find the service with: `kubectl get svc -n cassandra`.

For example, if installing using the example above, the Cassandra DNS would be:

`cassandra.cassandra.svc.cluster.local`

## Create a Dapr component

The next step is to create a Dapr component for Cassandra.

Create the following YAML file named `cassandra.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.cassandra
  metadata:
  - name: hosts
    value: <REPLACE-WITH-COMMA-DELIMITED-HOSTS> # Required. Example: cassandra.cassandra.svc.cluster.local
  - name: username
    value: <REPLACE-WITH-PASSWORD> # Optional. default: ""
  - name: password
    value: <REPLACE-WITH-PASSWORD> # Optional. default: ""
  - name: consistency
    value: <REPLACE-WITH-CONSISTENCY> # Optional. default: "All"
  - name: table
    value: <REPLACE-WITH-TABLE> # Optional. default: "items"
  - name: keyspace
    value: <REPLACE-WITH-KEYSPACE> # Optional. default: "dapr"
  - name: protoVersion
    value: <REPLACE-WITH-PROTO-VERSION> # Optional. default: "4"
  - name: replicationFactor
    value: <REPLACE-WITH-REPLICATION-FACTOR> #  Optional. default: "1"
```

The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here](../../concepts/secrets/README.md)

The following example uses the Kubernetes secret store to retrieve the username and password:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.cassandra
  metadata:
  - name: hosts
    value: <REPLACE-WITH-HOSTS>
  - name: username
    secretKeyRef:
      name: <KUBERNETES-SECRET-NAME>
      key: <KUBERNETES-SECRET-KEY>
  - name: password
    secretKeyRef:
      name: <KUBERNETES-SECRET-NAME>
      key: <KUBERNETES-SECRET-KEY>
  ...
```

## Apply the configuration

### In Kubernetes

To apply the Cassandra state store to Kubernetes, use the `kubectl` CLI:

```
kubectl apply -f cassandra.yaml
```

### Running locally

To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.
