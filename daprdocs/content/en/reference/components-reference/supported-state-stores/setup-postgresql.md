---
type: docs
title: "PostgreSQL"
linkTitle: "PostgreSQL"
description: Detailed information on the PostgreSQL state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-postgresql/"
---

## Create a Dapr component

Create a file called `postgres.yaml`, paste the following and replace the `<CONNECTION STRING>` value with your connection string. The connection string is a standard PostgreSQL connection string. For example, `"host=localhost user=postgres password=example port=5432 connect_timeout=10 database=dapr_test"`. See the PostgreSQL [documentation on database connections](https://www.postgresql.org/docs/current/libpq-connect.html), specifically Keyword/Value Connection Strings, for information on how to define a connection string.

If you want to also configure PostgreSQL to store actors, add the `actorStateStore` configuration element shown below.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.postgresql
  version: v1
  metadata:
  - name: connectionString
    value: "<CONNECTION STRING>"
```
{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| connectionString   | Y        | The connection string for PostgreSQL | `"host=localhost user=postgres password=example port=5432 connect_timeout=10 database=dapr_test"`
| actorStateStore    | N         | Consider this state store for actors. Defaults to `"false"` | `"true"`, `"false"`


If you wish to use PostgreSQL as an actor store, append the following to the yaml.

```yaml
  - name: actorStateStore
    value: "true"
```


## Create PostgreSQL

{{< tabs "Self-Hosted" >}}

{{% codetab %}}

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
{{% /codetab %}}

{{% /tabs %}}

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
