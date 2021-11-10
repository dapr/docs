---
type: docs
title: "Azure Table Storage "
linkTitle: "Azure Table Storage "
description: Detailed information on the Azure Table Storage state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-azure-tablestorage/"
---

## Component format

To setup Azure Tablestorage state store create a component of type `state.azure.tablestorage`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.azure.tablestorage
  version: v1
  metadata:
  - name: accountName
    value: <REPLACE-WITH-ACCOUNT-NAME>
  - name: accountKey
    value: <REPLACE-WITH-ACCOUNT-KEY>
  - name: tableName
    value: <REPLACE-WITH-TABLE-NAME>
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| accountName        | Y        | The storage account name | `"mystorageaccount"`.
| accountKey         | Y        | Primary or secondary storage key | `"key"`
| tableName         | Y         | The name of the table to be used for Dapr state. The table will be created for you if it doesn't exist  | `"table"`

## Setup Azure Table Storage

[Follow the instructions](https://docs.microsoft.com/azure/storage/common/storage-account-create?tabs=azure-portal) from the Azure documentation on how to create an Azure Storage Account.

If you wish to create a table for Dapr to use, you can do so beforehand. However, Table Storage state provider will create one for you automatically if it doesn't exist.

In order to setup Azure Table Storage as a state store, you will need the following properties:
- **AccountName**: The storage account name. For example: **mystorageaccount**.
- **AccountKey**: Primary or secondary storage key.
- **TableName**: The name of the table to be used for Dapr state. The table will be created for you if it doesn't exist.

## Partitioning

The Azure Table Storage state store uses the `key` property provided in the requests to the Dapr API to determine the `row key`. Service Name is used for `partition key`. This provides best performance, as each service type stores state in it's own table partition.

This state store creates a column called `Value` in the table storage and puts raw state inside it.

For example, the following operation coming from service called `myservice`

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

will create the following record in a table:

| PartitionKey | RowKey  | Value |
| ------------ | ------- | ----- |
| myservice    | nihilus | darth |

## Concurrency

Azure Table Storage state concurrency is achieved by using `ETag`s according to [the official documentation]( https://docs.microsoft.com/azure/storage/common/storage-concurrency#managing-concurrency-in-table-storage).


## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
