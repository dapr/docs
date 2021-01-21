---
type: docs
title: "MySQL"
linkTitle: "MySQL"
description: Detailed information on the MySQL state store component
---

## Create a MySQL Store

Dapr can use any MySQL instance. If you already have a running instance of MySQL, move on to the [Create a Dapr component](#create-a-dapr-component) section.

1. Run an instance of MySQL. You can run a local instance of MySQL in Docker CE with the following command:

     This example does not describe a production configuration because it sets the password in plain text and the user name is left as the MySQL default of "root".

     ```bash
     docker run --name dapr_mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:latest
     ```

2. Create a database for state data.

    To create a new database in MySQL, run the following SQL command:

    ```SQL
    create database dapr_state_store;
    ```

## Create a Dapr component

### Non SSL connection

Create a file called `mysqlstate.yaml`, paste the following and replace the `<CONNECTION STRING>` value with your connection string. The connection string is a standard MySQL connection string. For example, `"<user>:<password>@tcp(<server>:3306)/<database>?allowNativePasswords=true"`.

If you want to also configure MySQL to store actors, add the `actorStateStore` configuration element shown below.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.mysql
  version: v1
  metadata:
  - name: connectionString
    value: "<CONNECTION STRING>"
  - name: actorStateStore
    value: "true"
```

### Enforced SSL connection

If your server requires SSL your connection string must end of `&tls=custom` for example, `"<user>:<password>@tcp(<server>:3306)/<database>?allowNativePasswords=true&tls=custom"`. You must replace the `<PEM PATH>` with a full path to the PEM file. If you are using [MySQL on Azure](http://bit.ly/AzureMySQLSSL) see the Azure [documentation on SSL database connections](http://bit.ly/MySQLSSL), for information on how to download the required certificate. The connection to MySQL will require a minimum TLS version of 1.2.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.mysql
  version: v1
  metadata:
  - name: connectionString
    value: "<CONNECTION STRING>"
  - name: pemPath
    value: "<PEM PATH>"
  - name: actorStateStore
    value: "true"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Apply the configuration

### In Kubernetes

To apply the MySQL state store to Kubernetes, use the `kubectl` CLI:

```yaml
kubectl apply -f mysqlstate.yaml
```

### Running locally

To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.
