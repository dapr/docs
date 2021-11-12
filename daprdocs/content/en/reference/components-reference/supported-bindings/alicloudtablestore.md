---
type: docs
title: "Alibaba Cloud Tablestore binding spec"
linkTitle: "Alibaba Cloud Tablestore"
description: "Detailed documentation on the Alibaba Tablestore binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/alicloudtablestore/"
---

## Component format

To setup an Alibaba Cloud Tablestore binding create a component of type `bindings.alicloud.tablestore`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mytablestore
  namespace: default
spec:
  type: bindings.alicloud.tablestore
  version: v1
  metadata:
  - name: endpoint
    value: "[endpoint]"
  - name: accessKeyID
    value: "[key-id]"
  - name: accessKey
    value: "[access-key]"
  - name: instanceName
    value: "[instance]"
  - name: tableName
    value: "[table]"
  - name: endpoint
    value: "[endpoint]"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field         | Required | Binding support  | Details | Example |
|---------------|----------|---------|---------|---------|
| `endpoint`    | Y | Output | Alicloud Tablestore endpoint. | https://tablestore-cn-hangzhou.aliyuncs.com
| `accessKeyID` | Y | Output | Access key ID credential. |
| `accessKey`   | Y | Output | Access key credential. |
| `instanceName`      | Y | Output | Name of the instance. |
| `tableName`      | Y | Output | Name of the table. |

## Binding support

This component supports **output binding** with the following operations:
- `create`: [Create object](#create-object)


### Create object

To perform a create object operation, invoke the binding with a `POST` method and the following JSON body:

```json
{
  "operation": "create",
  "data": "YOUR_CONTENT",
  "metadata": {
    "primaryKeys": "pk1"
  }
} 
```

{{% alert title="Note" color="primary" %}}
Note the `metadata.primaryKeys` field is mandatory.
{{% /alert %}}

### Delete object

To perform a delete object operation, invoke the binding with a `POST` method and the following JSON body:

```json
{
  "operation": "delete",
  "metadata": {
   "primaryKeys": "pk1",
   "columnToGet": "name,age,date"
  },
  "data": {
    "pk1": "data1"
  }
} 
```

{{% alert title="Note" color="primary" %}}
Note the `metadata.primaryKeys` field is mandatory.
{{% /alert %}}

### List objects

To perform a list objects operation, invoke the binding with a `POST` method and the following JSON body:

```json
{
  "operation": "delete",
  "metadata": {
    "primaryKeys": "pk1",
    "columnToGet": "name,age,date"
  },
  "data": {
    "pk1": "data1",
    "pk2": "data2"
  }
} 
```

{{% alert title="Note" color="primary" %}}
Note the `metadata.primaryKeys` field is mandatory.
{{% /alert %}}

### Get object

To perform a get object operation, invoke the binding with a `POST` method and the following JSON body:

```json
{
  "operation": "delete",
  "metadata": {
    "primaryKeys": "pk1"
  },
  "data": {
    "pk1": "data1"
  }
} 
```

{{% alert title="Note" color="primary" %}}
Note the `metadata.primaryKeys` field is mandatory.
{{% /alert %}}

## Related links

- [Bindings building block]({{< ref bindings >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
