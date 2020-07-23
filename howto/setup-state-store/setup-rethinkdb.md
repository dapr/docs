# Setup RethinkDB  

## Locally 

You can run [RethinkDB](https://rethinkdb.com/) locally using Docker:

```
docker run --name rethinkdb -v "$PWD:/rethinkdb-data" -d rethinkdb:latest
```

To connect to the admin UI:

```shell
open "http://$(docker inspect --format '{{ .NetworkSettings.IPAddress }}' rethinkdb):8080"
```

## Kubernetes 

> TODO: provide instructions on setting up secured RethinkDB cluster (e.g. https://github.com/jmckind/rethinkdb-operator) 

## Create a Dapr component

The next step is to create a Dapr component for RethinkDB.

Create the following YAML file named `rethinkdb.yaml`

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.rethinkdb
  metadata:
  - name: address
    value: <REPLACE-RETHINKDB-ADDRESS> # Required, e.g. 127.0.0.1:28015 or rethinkdb.default.svc.cluster.local:28015).
  - name: database
    value: <REPLACE-RETHINKDB-DB-NAME> # Required, e.g. dapr (alpha-numerics only)
```


Additionally, the RethinkDB state component supports optional connection parameters [here](https://godoc.org/gopkg.in/gorethink/gorethink.v3#ConnectOpts) (note, use the `gorethink` names, e.g. `authkey` for `AuthKey`)

## Apply the configuration

### In Kubernetes

To apply the RethinkDB state store to Kubernetes, use the `kubectl` CLI:

```
kubectl apply -f rethinkdb.yaml
```

### Running locally

To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.
