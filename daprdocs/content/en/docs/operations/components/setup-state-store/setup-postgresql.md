# Setup PostgreSQL

This article provides guidance on configuring a PostgreSQL state store.

## Create a PostgreSQL Store
Dapr can use any PostgreSQL instance. If you already have a running instance of PostgreSQL, move on to the [Create a Dapr component](#create-a-dapr-component) section.

1. Run an instance of PostgreSQL. You can run a local instance of PostgreSQL in Docker CE with the following command:

     This example does not describe a production configuration because it sets the password in plain text and the user name is left as the PostgreSQL default of "postgres".  

     ```bash
     docker run -p 5432:5432 -e POSTGRES_PASSWORD=example postgres
     ```

2. Create a database for state data.
Either the default "postgres" database can be used, or create a new database for storing state data.

    To create a new database in PostgreSQL, run the following SQL command:

    ```SQL
    create database dapr_test
    ```

## Create a Dapr component

Create a file called `postgres.yaml`, paste the following and replace the `<CONNECTION STRING>` value with your connection string. The connection string is a standard PostgreSQL connection string. For example, `"host=localhost user=postgres password=example port=5432 connect_timeout=10 database=dapr_test"`. See the PostgreSQL [documentation on database connections](https://www.postgresql.org/docs/current/libpq-connect.html), specifically Keyword/Value Connection Strings, for information on how to define a connection string.

If you want to also configure PostgreSQL to store actors, add the `actorStateStore` configuration element shown below.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.postgresql
  metadata:
  - name: connectionString
    value: "<CONNECTION STRING>"
  - name: actorStateStore
    value: "true"
```
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here](../../concepts/secrets/README.md).

## Apply the configuration

### In Kubernetes

To apply the PostgreSQL state store to Kubernetes, use the `kubectl` CLI:

```yaml
kubectl apply -f postgres.yaml
```

### Running locally

To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.
