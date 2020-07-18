# Setup SQL Server

## Creating an Azure SQL instance

[Follow the instructions](https://docs.microsoft.com/azure/sql-database/sql-database-single-database-get-started?tabs=azure-portal) from the Azure documentation on how to create a SQL database.  The database must be created before Dapr consumes it.

**Note: SQL Server state store also supports SQL Server running on VMs.**

In order to setup SQL Server as a state store, you will need the following properties:

* **Connection String**: the SQL Server connection string. For example: server=localhost;user id=sa;password=your-password;port=1433;database=mydatabase;
* **Schema**: The database schema do use (default=dbo). Will be created if not exists
* **Table Name**: The database table name. Will be created if not exists
* **Indexed Properties**: Optional properties from json data which will be indexed and persisted as individual column

### Create a dedicated user

When connecting with a dedicated user (not `sa`), these authorizations are required for the user - even when the user is owner of the desired database schema:

- `CREATE TABLE`
- `CREATE TYPE`

## Create a Dapr component

> currently this component does not support state management for actors

The next step is to create a Dapr component for SQL Server.

Create the following YAML file named `sqlserver.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.sqlserver
  metadata:
  - name: connectionString
    value: <REPLACE-WITH-CONNECTION-STRING>
  - name: tableName
    value: <REPLACE-WITH-TABLE-NAME>
```

The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here](../../concepts/secrets/README.md)

The following example uses the Kubernetes secret store to retrieve the secrets:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.sqlserver
  metadata:
  - name: connectionString
    secretKeyRef:
      name: <KUBERNETES-SECRET-NAME>
      key: <KUBERNETES-SECRET-KEY>
  - name: tableName
    value: <REPLACE-WITH-TABLE-NAME>
```

## Apply the configuration

### In Kubernetes

To apply the SQL Server state store to Kubernetes, use the `kubectl` CLI:

```yaml
kubectl apply -f sqlserver.yaml
```

### Running locally

To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.
