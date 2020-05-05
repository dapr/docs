# Setup SQL Server

## Creating an Azure SQL instance

[Follow the instructions](https://docs.microsoft.com/azure/sql-database/sql-database-single-database-get-started?tabs=azure-portal) from the Azure documentation on how to create a SQL database.  The database must be created before Dapr consumes it.

**Note: SQL Server state store also supports SQL Server running on  VMs.**

In order to setup SQL Server as a state store, you will need the following properties:

* **Connection String**: the SQL Server connection string. For example: server=localhost;user id=sa;password=your-password;port=1433;database=mydatabase;
* **Schema**: The database schema do use (default=dbo). Will be created if not exists
* **Table Name**: The database table name. Will be created if not exists
* **Indexed Properties**: Optional properties from json data which will be indexed and persisted as individual column

## Create a Dapr component

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

The Dapr CLI will automatically create a directory named `components` in your current working directory with a Redis component.
To use SQL Server, replace the redis.yaml file with sqlserver.yaml file above.
