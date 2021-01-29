---
type: docs
title: "MySQL"
linkTitle: "MySQL"
description: Detailed information on the MySQL state store component
---

## Create a MySQL Store

Dapr can use any MySQL instance - containerized, running on your local dev machine, or a managed cloud service. If you already have a MySQL store, move on to the [Create a Dapr component](#create-a-dapr-component) section.

{{< tabs "Self-Hosted" "Kubernetes" "Azure" "AWS" "GCP" >}}

{{% codetab %}}
<!-- Self-Hosted -->

Run an instance of MySQL. You can run a local instance of MySQL in Docker CE with the following command:

This example does not describe a production configuration because it sets the password in plain text and the user name is left as the MySQL default of "root".

```bash
docker run --name dapr_mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:latest
```

{{% /codetab %}}

{{% codetab %}}
<!-- Kubernetes -->

We can use [Helm](https://helm.sh/) to quickly create a MySQL instance in our Kubernetes cluster. This approach requires [Installing Helm](https://github.com/helm/helm#install).

1. Install MySQL into your cluster.

    ```bash
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm install dapr_mysql bitnami/mysql
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

## Create a Dapr component

### Non SSL connection

Create a file called `mysqlstate.yaml`, paste the following and replace the `<CONNECTION STRING>` value with your connection string. The connection string is a standard MySQL connection string. For example, `"<user>:<password>@tcp(<server>:3306)/?allowNativePasswords=true"`. Do not add the schema to the connection string. The component connects to the server first to check for the existence of the desired schema. If the schemaName is not provided the default value of **dapr_state_store** will be used. If the schema does not exist it will be created.

The tableName is also optional and if not provided will default to **state**. If the table does ont exist it will be created.

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
  - name: schemaName
    value: "<SCHEMA NAME>"
  - name: tableName
    value: "<TABLE NAME>"
  - name: actorStateStore
    value: "true"
```

### Enforced SSL connection

If your server requires SSL your connection string must end with `&tls=custom` for example, `"<user>:<password>@tcp(<server>:3306)/?allowNativePasswords=true&tls=custom"`. You must replace the `<PEM PATH>` with a full path to the PEM file. The connection to MySQL will require a minimum TLS version of 1.2.

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
  - name: schemaName
    value: "<SCHEMA NAME>"
  - name: tableName
    value: "<TABLE NAME>"
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
