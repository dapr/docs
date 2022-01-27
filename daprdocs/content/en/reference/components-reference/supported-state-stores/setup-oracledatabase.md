---
type: docs
title: "Oracle Database"
linkTitle: "Oracle Database"
description: Detailed information on the Oracle Database state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-oracledatabase/"
---

## Create a Dapr component

Create a component properties yaml file, for example called `oracle.yaml` (but it could be named anything ), paste the following and replace the `<CONNECTION STRING>` value with your connection string. The connection string is a standard Oracle Database connection string, composed as: `"oracle://user/password@host:port/servicename"` for example `"oracle://demo:demo@localhost:1521/xe"`. In case you connect to the database using an Oracle Wallet, you should specify a value for the `oracleWalletLocation` property, for example: `"/home/app/state/Wallet_daprDB/"`; this should refer to the local file system directory that contains the file `cwallet.sso` that is extracted from the Oracle Wallet archive file.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.oracledatabase
  version: v1
  metadata:
  - name: connectionString
    value: "<CONNECTION STRING>"
  - name: oracleWalletLocation
    value: "<FULL PATH TO DIRECTORY WITH ORACLE WALLET CONTENTS >"  # Optional, no default
  - name: tableName
    value: "<NAME OF DATABASE TABLE TO STORE STATE IN >" # Optional, defaults to STATE
```
{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| connectionString   | Y        | The connection string for Oracle Database | `"oracle://user/password@host:port/servicename"` for example `"oracle://demo:demo@localhost:1521/xe"` or for Autonomous Database `"oracle://states_schema:State12345pw@adb.us-ashburn-1.oraclecloud.com:1522/k8j2agsqjsw_daprdb_low.adb.oraclecloud.com"`
| oracleWalletLocation    | N         | Location of the contents of an Oracle Wallet file (required to connect to Autonomous Database on OCI)| `"/home/app/state/Wallet_daprDB/"`
| tableName    | N         | Name of the database table in which this instance of the state store records the data default `"STATE"`| `"MY_APP_STATE_STORE"`

## What Happens at Runtime?
When the state store component initializes, it connects to the Oracle Database and it checks if a table with the name specified with `tableName` already exists. If it does not, it will create this table (with columns Key, Value, Binary_YN, ETag, Creation_Time, Update_Time, Expiration_time). 

Every state entry is represented by a record in the database table. The `key` property provided in the requests to the Dapr API to determine the name of the object is stored literally in the KEY column. The `value` is stored as the (literal) content of the object. Binary content is stored as Base64 encoded text. Each object is assigned a unique ETag value - whenever it is created or updated (aka overwritten). 

For example, the following operation 

```shell
curl -X POST http://localhost:3500/v1.0/state \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "nihilus",
          "value": "darth"
        }
      ]'
```

creates the following records in table STATE:

| KEY | VALUE | CREATION_TIME  | BINARY_YN | ETAG |
| ------------ | ------- | ----- | ----- | ---- |
| nihilus | darth | 2022-02-14T22:11:00 | N | 79dfb504-5b27-43f6-950f-d55d5ae0894f |


Dapr uses a fixed key scheme with *composite keys* to partition state across applications. For general states, the key format is:
`App-ID||state key`. The Oracle Database state store maps this key in its entirety to the KEY column. 

You can easily inspect all state stored with SQL queries against the STATE table. 


## Time To Live and State Expiration
The state store components supports Dapr's Time To Live logic that ensures that state cannot be retrieved after it has expired. See [this How To on Setting State Time To Live]({{< ref "state-store-ttl.md" >}}) for details.

The Oracle Database does not have native support for a Time To Live setting. The implementation in this component uses a column called `EXPIRATION_TIME` to hold the time after which the record is considered *expired*. The values in this column is set only when a TTL was specified in Set request. It is calculated as the current UTC timestamp with the TTL period added to it. When state is retrieved through a call to Get, this component checks if it has the `EXPIRATION_TIME` set and if so it checks whether it is in the past. In that case, no state is returned. 

The following operation therefore: 

```shell
curl -X POST http://localhost:3500/v1.0/state \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "temporary",
          "value": "ephemeral",
          "metadata": {"ttlInSeconds": "120"}}
        }
      ]'
```

creates the following object:

| KEY | VALUE | CREATION_TIME  |EXPIRATION_TIME  | BINARY_YN | ETAG |
| ------------ | ------- | ----- | ----- | ---- |---- |
| temporary | ephemeral | 2022-03-31T22:11:00 |2022-03-31T22:13:00 | N | 79dfb504-5b27-43f6-950f-d55d5ae0894f |

with the EXPIRATION_TIME set to a timestamp 2 minutes (120 seconds) (later than the CREATION_TIME) 

Note that expired state is not removed from the state store by this component. An application operator may decide to run a periodic job that does a form of garbage collection in order to explicitly remove all state records with an EXPIRATION_TIME in the past.

## Concurrency

Concurrency in the Oracle Database state store is achieved by using `ETag`s. Each piece of state recorded in the Oracle Database State Store is assigned a unique ETag - a generated, unique string stored in the column ETag - when it is created or updated (aka replaced). Note: the column UPDATE_TIME is also updated whenever a Set operation is performed on an existing record. When the `Set` and `Delete` requests for this state store specify the FirstWrite concurrency policy, then the request need to provide the actual ETag value for the state to be written or removed for the request to be successful. 

## Consistency

Oracle Database state store supports Transactions. Multiple Set and Delete commands can be combined a single request that is processed as a single, atomic transaction. Note: simple Set and Delete operations are a transaction on their own; when a Set or Delete requests returns an HTTP-20X result, the database transaction has been committed successfully. 

## Query

Oracle Database state store does not currently support the Query API.



## Create Oracle Database and User Schema

{{< tabs "Self-Hosted" "Autonomous Database on OCI">}}

{{% codetab %}}

1. Run an instance of Oracle Database. You can run a local instance of Oracle Database in Docker CE with the following command:

     This example does not describe a production configuration because it sets the password for users `SYS` and `SYSTEM` in plain text.

     ```bash
     docker run -d -p 1521:1521 -e ORACLE_PASSWORD=TheSuperSecret1509! gvenzl/oracle-xe
     ```

2. Create a schema for state data.
Create a new user schema for storing state data. Grant this user (schema) privileges for creating a table and storing data in the associated tablespace.

    To create a new user schema in Oracle Database, run the following SQL command:

    ```SQL
    create user dapr_state identified by DaprState4239 default tablespace users quota unlimited on users;
    grant create session, create table to dapr_state;
    ```
{{% /codetab %}}

{{% codetab %}}

1. Create a free (or paid for) Autonomous Transaction Processing (ATP) or ADW (Autonomous Data Warehouse) instance on Oracle Cloud Infrastructure, as described in the [OCI documentation for the always free autonomous database](https://docs.oracle.com/en/cloud/paas/autonomous-database/adbsa/autonomous-always-free.html#GUID-03F9F3E8-8A98-4792-AB9C-F0BACF02DC3E).

You need to provide the password for user ADMIN. You use this account (initially at least) for database administration activities. You can work both in the web based SQL Developer tool, from its desktop counterpart or from any of a plethora of database development tools.  

2. Create a schema for state data.
Create a new user schema for storing state data - for example using the ADMIN account. Grant this new user (schema) privileges for creating a table and storing data in the associated tablespace.

    To create a new user schema in Oracle Database, run the following SQL command:

    ```SQL
    create user dapr_state identified by DaprState4239 default tablespace users quota unlimited on users;
    grant create session, create table to dapr_state;
    ```
{{% /codetab %}}


{{% /tabs %}}

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
