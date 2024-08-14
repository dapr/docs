---
type: docs
title: "PostgreSQL"
linkTitle: "PostgreSQL"
description: Detailed information on the PostgreSQL configuration store component
aliases:
  - "/operations/components/setup-configuration-store/supported-configuration-stores/setup-postgresql/"
  - "/operations/components/setup-configuration-store/supported-configuration-stores/setup-postgres/"
---

## Component format

To set up an PostgreSQL configuration store, create a component of type `configuration.postgresql`

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: configuration.postgresql
  version: v1
  metadata:
    # Connection string
    - name: connectionString
      value: "host=localhost user=postgres password=example port=5432 connect_timeout=10 database=config"
    # Name of the table which holds configuration information
    - name: table
      value: "[your_configuration_table_name]" 
    # Timeout for database operations, in seconds (optional)
    #- name: timeoutInSeconds
    #  value: 20
    # Name of the table where to store the state (optional)
    #- name: tableName
    #  value: "state"
    # Name of the table where to store metadata used by Dapr (optional)
    #- name: metadataTableName
    #  value: "dapr_metadata"
    # Cleanup interval in seconds, to remove expired rows (optional)
    #- name: cleanupIntervalInSeconds
    #  value: 3600
    # Maximum number of connections pooled by this component (optional)
    #- name: maxConns
    #  value: 0
    # Max idle time for connections before they're closed (optional)
    #- name: connectionMaxIdleTime
    #  value: 0
    # Controls the default mode for executing queries. (optional)
    #- name: queryExecMode
    #  value: ""
    # Uncomment this if you wish to use PostgreSQL as a state store for actors (optional)
    #- name: actorStateStore
    #  value: "true"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

### Authenticate using a connection string

The following metadata options are **required** to authenticate using a PostgreSQL connection string.

| Field  | Required | Details | Example |
|--------|:--------:|---------|---------|
| `connectionString` | Y | The connection string for the PostgreSQL database. See the PostgreSQL [documentation on database connections](https://www.postgresql.org/docs/current/libpq-connect.html) for information on how to define a connection string. | `"host=localhost user=postgres password=example port=5432 connect_timeout=10 database=my_db"`

### Authenticate using Microsoft Entra ID

Authenticating with Microsoft Entra ID is supported with Azure Database for PostgreSQL. All authentication methods supported by Dapr can be used, including client credentials ("service principal") and Managed Identity.

| Field  | Required | Details | Example |
|--------|:--------:|---------|---------|
| `useAzureAD` | Y | Must be set to `true` to enable the component to retrieve access tokens from Microsoft Entra ID. | `"true"` |
| `connectionString` | Y | The connection string for the PostgreSQL database.<br>This must contain the user, which corresponds to the name of the user created inside PostgreSQL that maps to the Microsoft Entra ID identity; this is often the name of the corresponding principal (e.g. the name of the Microsoft Entra ID application). This connection string should not contain any password.  | `"host=mydb.postgres.database.azure.com user=myapplication port=5432 database=my_db sslmode=require"` |
| `azureTenantId` | N | ID of the Microsoft Entra ID tenant | `"cd4b2887-304c-…"` |
| `azureClientId` | N | Client ID (application ID) | `"c7dd251f-811f-…"` |
| `azureClientSecret` | N | Client secret (application password) | `"Ecy3X…"` |

### Authenticate using AWS IAM

Authenticating with AWS IAM is supported with all versions of PostgreSQL type components.
The user specified in the connection string must be an AWS IAM enabled user granted the `rds_iam` database role.
Authentication is based on the AWS authentication configuration file, or the AccessKey/SecretKey provided.
The AWS authentication token will be dynamically rotated before it's expiration time with AWS.

| Field  | Required | Details | Example |
|--------|:--------:|---------|---------|
| `useAWSIAM` | Y | Must be set to `true` to enable the component to retrieve access tokens from AWS IAM. This authentication method only works with AWS Relational Database Service for PostgreSQL databases. | `"true"` |
| `connectionString` | Y | The connection string for the PostgreSQL database.<br>This must contain the user, which corresponds to the name of the user created inside PostgreSQL that maps to the AWS IAM policy. This connection string should not contain any password. Note that the database name field is denoted by dbname with AWS. | `"host=mydb.postgres.database.aws.com user=myapplication port=5432 dbname=dapr_test sslmode=require"`|
| `awsRegion` | Y | The AWS Region where the AWS Relational Database Service is deployed to. | `"us-east-1"` |
| `awsAccessKey` | Y | AWS access key associated with an IAM account | `"AKIAIOSFODNN7EXAMPLE"` |
| `awsSecretKey` | Y | The secret key associated with the access key | `"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"` |
| `awsSessionToken` | N | AWS session token to use. A session token is only required if you are using temporary security credentials. | `"TOKEN"` |

### Other metadata options

| Field | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `table` | Y | Table name for configuration information, must be lowercased. | `configtable`
| `timeout` | N | Timeout for operations on the database, as a [Go duration](https://pkg.go.dev/time#ParseDuration). Integers are interpreted as number of seconds. Defaults to `20s` | `"30s"`, `30` |
| `maxConns` | N | Maximum number of connections pooled by this component. Set to 0 or lower to use the default value, which is the greater of 4 or the number of CPUs. | `"4"`
| `connectionMaxIdleTime` | N | Max idle time before unused connections are automatically closed in the connection pool. By default, there's no value and this is left to the database driver to choose. | `"5m"`
| `queryExecMode` | N | Controls the default mode for executing queries. By default Dapr uses the extended protocol and automatically prepares and caches prepared statements. However, this may be incompatible with proxies such as PGBouncer. In this case it may be preferrable to use `exec` or `simple_protocol`. | `"simple_protocol"`

## Set up PostgreSQL as Configuration Store

1. Start the PostgreSQL Database
1. Connect to the PostgreSQL database and setup a configuration table with following schema:

    | Field              | Datatype | Nullable |Details |
    |--------------------|:--------:|---------|---------|
    | KEY | VARCHAR | N |Holds `"Key"` of the configuration attribute |
    | VALUE | VARCHAR | N |Holds Value of the configuration attribute |
    | VERSION | VARCHAR | N | Holds version of the configuration attribute |
    | METADATA | JSON | Y | Holds Metadata as JSON |

    ```sql
    CREATE TABLE IF NOT EXISTS table_name (
      KEY VARCHAR NOT NULL,
      VALUE VARCHAR NOT NULL,
      VERSION VARCHAR NOT NULL,
      METADATA JSON
    );
    ```

3. Create a TRIGGER on configuration table. An example function to create a TRIGGER is as follows:

   ```sh
   CREATE OR REPLACE FUNCTION notify_event() RETURNS TRIGGER AS $$
       DECLARE 
           data json;
           notification json;

       BEGIN

           IF (TG_OP = 'DELETE') THEN
               data = row_to_json(OLD);
           ELSE
               data = row_to_json(NEW);
           END IF;

           notification = json_build_object(
                             'table',TG_TABLE_NAME,
                             'action', TG_OP,
                             'data', data);
           PERFORM pg_notify('config',notification::text);
           RETURN NULL; 
       END;
   $$ LANGUAGE plpgsql;
   ```

4. Create the trigger with data encapsulated in the field labeled as `data`:

   ```sql
   notification = json_build_object(
     'table',TG_TABLE_NAME,
     'action', TG_OP,
     'data', data
   );
   ```

5. The channel mentioned as attribute to `pg_notify` should be used when subscribing for configuration notifications
6. Since this is a generic created trigger, map this trigger to `configuration table`

   ```sql
   CREATE TRIGGER config
   AFTER INSERT OR UPDATE OR DELETE ON configtable
       FOR EACH ROW EXECUTE PROCEDURE notify_event();
   ```

7. In the subscribe request add an additional metadata field with key as `pgNotifyChannel` and value should be set to same `channel name` mentioned in `pg_notify`. From the above example, it should be set to `config`

{{% alert title="Note" color="primary" %}}
When calling `subscribe` API, `metadata.pgNotifyChannel` should be used to specify the name of the channel to listen for notifications from PostgreSQL configuration store. 

Any number of keys can be added to a subscription request. Each subscription uses an exclusive database connection. It is strongly recommended to subscribe to multiple keys within a single subscription. This helps optimize the number of connections to the database.

Example of subscribe HTTP API:

```sh
curl -l 'http://<host>:<dapr-http-port>/configuration/mypostgresql/subscribe?key=<keyname1>&key=<keyname2>&metadata.pgNotifyChannel=<channel name>'
```
{{% /alert %}}

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Configuration building block]({{< ref configuration-api-overview >}})
