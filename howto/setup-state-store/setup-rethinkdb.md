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
  - name: username
    value: # Optional
  - name: password
    value: # Optional
  - name: archive
    value: # Optional (whether or not store should keep archive table of all the state changes)
```

RethinkDB state store supports transactions so it can be used to persist Dapr Actor state. By default, the state will be stored in table name `daprstate` in the specified database. 

Additionally, if the optional `archive` metadata is set to `true`, on each state change, the RethinkDB state store will also log state changes with timestamp in the `daprstate_archive` table. This allows for time series analyses of the state managed by Dapr. 
