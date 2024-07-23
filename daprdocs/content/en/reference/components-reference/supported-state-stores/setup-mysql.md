---
type: docs
title: "MySQL & MariaDB"
linkTitle: "MySQL & MariaDB"
description: Detailed information on the MySQL state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-mysql/"
---

## Component format

The MySQL state store components allows connecting to both MySQL and MariaDB databases. In this document, we refer to "MySQL" to indicate both databases.

To setup MySQL state store create a component of type `state.mysql`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.mysql
  version: v1
  metadata:
  - name: connectionString
    value: "<CONNECTION STRING>"
  - name: schemaName
    value: "<SCHEMA NAME>"
  - name: tableName
    value: "<TABLE NAME>"
  - name: timeoutInSeconds
    value: "30"
  - name: pemPath # Required if pemContents not provided. Path to pem file.
    value: "<PEM PATH>"
  - name: pemContents # Required if pemPath not provided. Pem value.
    value: "<PEM CONTENTS>"    
# Uncomment this if you wish to use MySQL & MariaDB as a state store for actors (optional)
  #- name: actorStateStore
  #  value: "true"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

If you wish to use MySQL as an actor store, append the following to the yaml.

```yaml
  - name: actorStateStore
    value: "true"
```

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `connectionString`   | Y        | The connection string to connect to MySQL. Do not add the schema to the connection string | [Non SSL connection](#non-ssl-connection): `"<user>:<password>@tcp(<server>:3306)/?allowNativePasswords=true"`, [Enforced SSL Connection](#enforced-ssl-connection):  `"<user>:<password>@tcp(<server>:3306)/?allowNativePasswords=true&tls=custom"`|
| `schemaName`         | N        | The schema name to use. Will be created if schema does not exist. Defaults to `"dapr_state_store"`  | `"custom_schema"`, `"dapr_schema"` |
| `tableName`          | N        | The table name to use. Will be created if table does not exist. Defaults to `"state"` | `"table_name"`, `"dapr_state"` |
| `timeoutInSeconds`   | N        | Timeout for all database operations. Defaults to `20` | `30` |
| `pemPath`            | N        | Full path to the PEM file to use for [enforced SSL Connection](#enforced-ssl-connection) required if pemContents is not provided. Cannot be used in K8s environment | `"/path/to/file.pem"`, `"C:\path\to\file.pem"` |
| `pemContents`        | N        | Contents of PEM file to use for [enforced SSL Connection](#enforced-ssl-connection) required if pemPath is not provided. Can be used in K8s environment | `"pem value"` |
| `cleanupIntervalInSeconds` | N | Interval, in seconds, to clean up rows with an expired TTL. Default: `3600` (that is 1 hour). Setting this to values <=0 disables the periodic cleanup. | `1800`, `-1`
| `actorStateStore`    | N        | Consider this state store for actors. Defaults to `"false"` | `"true"`, `"false"`

## Setup MySQL

Dapr can use any MySQL instance - containerized, running on your local dev machine, or a managed cloud service.

{{< tabs "Self-Hosted" "Kubernetes" "Azure" "AWS" "GCP" >}}

{{% codetab %}}
<!-- Self-Hosted -->

Run an instance of MySQL. You can run a local instance of MySQL in Docker CE with the following command:

This example does not describe a production configuration because it sets the password in plain text and the user name is left as the MySQL default of "root".

```bash
docker run --name dapr-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:latest
```

{{% /codetab %}}

{{% codetab %}}
<!-- Kubernetes -->

We can use [Helm](https://helm.sh/) to quickly create a MySQL instance in our Kubernetes cluster. This approach requires [Installing Helm](https://github.com/helm/helm#install).

1. Install MySQL into your cluster.

    ```bash
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm install dapr-mysql bitnami/mysql
    ```

1. Run `kubectl get pods` to see the MySQL containers now running in your cluster.

1. Next, we'll get our password, which is slightly different depending on the OS we're using:
    - **Windows**: Run `[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($(kubectl get secret --namespace default dapr-mysql -o jsonpath="{.data.mysql-root-password}")))` and copy the outputted password.

    - **Linux/MacOS**: Run `kubectl get secret --namespace default dapr-mysql -o jsonpath="{.data.mysql-root-password}" | base64 --decode` and copy the outputted password.

1. With the password you can construct your connection string.

{{% /codetab %}}

{{% codetab %}}
<!-- Azure -->

[Azure MySQL](http://bit.ly/AzureMySQL)

If you are using [MySQL on Azure](http://bit.ly/AzureMySQLSSL) see the Azure [documentation on SSL database connections](http://bit.ly/MySQLSSL), for information on how to download the required certificate.

{{% /codetab %}}

{{% codetab %}}
<!-- AWS -->

[AWS MySQL](https://aws.amazon.com/rds/mysql/)

{{% /codetab %}}

{{% codetab %}}
<!-- GCP -->

[GCP MySQL](https://cloud.google.com/sql/docs/mysql/features)

{{% /codetab %}}

{{< /tabs >}}

### Non SSL connection

Replace the `<CONNECTION STRING>` value with your connection string. The connection string is a standard MySQL connection string. For example, `"<user>:<password>@tcp(<server>:3306)/?allowNativePasswords=true"`.

### Enforced SSL connection

If your server requires SSL your connection string must end with `&tls=custom` for example, `"<user>:<password>@tcp(<server>:3306)/?allowNativePasswords=true&tls=custom"`. You must replace the `<PEM PATH>` with a full path to the PEM file. The connection to MySQL will require a minimum TLS version of 1.2.

### TTLs and cleanups

This state store supports [Time-To-Live (TTL)]({{< ref state-store-ttl.md >}}) for records stored with Dapr. When storing data using Dapr, you can set the `ttlInSeconds` metadata property to indicate when the data should be considered "expired".

Because MySQL doesn't have built-in support for TTLs, this is implemented in Dapr by adding a column in the state table indicating when the data is to be considered "expired". Records that are "expired" are not returned to the caller, even if they're still physically stored in the database. A background "garbage collector" periodically scans the state table for expired rows and deletes them.

The interval at which the deletion of expired records happens is set with the `cleanupIntervalInSeconds` metadata property, which defaults to 3600 seconds (that is, 1 hour).

- Longer intervals require less frequent scans for expired rows, but can require storing expired records for longer, potentially requiring more storage space. If you plan to store many records in your state table, with short TTLs, consider setting `cleanupIntervalInSeconds` to a smaller value, for example `300` (300 seconds, or 5 minutes).
- If you do not plan to use TTLs with Dapr and the MySQL state store, you should consider setting `cleanupIntervalInSeconds` to a value <= 0 (e.g. `0` or `-1`) to disable the periodic cleanup and reduce the load on the database.

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
