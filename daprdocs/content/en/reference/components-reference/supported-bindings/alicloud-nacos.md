---
type: docs
title: "Alibaba Cloud Nacos binding spec"
linkTitle: "Alibaba Cloud Nacos"
description: "Detailed documentation on the Alibaba Cloud Nacos binding component"
---

## Setup Dapr component
To setup an Alibaba Cloud Nacos binding create a component of type `bindings.nacos`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.nacos
  version: v1
  metadata:
  - name: endpoint
    value: "******.mse.aliyuncs.com:8848"
  - name: region
    value: "cn-shanghai"
  - name: namespace
    value: "e525eafa-f7d7-4029-83d9-************"
  - name: accessKey
    value: "****************"
  - name: secretKey
    value: "****************"
  - name: watches
    value: "key1:group1,key2:group2"
```
{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}
## Spec metadata fields
| Field              | Required | Binding support | Details | Example |
|--------------------|:--------:|--------|--------|---------|
| endpoint                | Y        | Input/Output |the endpoint to get Nacos server addresses | `"******.mse.aliyuncs.com:8848"`
| region                | Y        | Input/Output |the regionId for kms | `"cn-shanghai"`
| namespace                | Y        | Input/Output |the namespaceId of Nacos | `"e525eafa-f7d7-4029-83d9-************"`
| config                | Y        | Output |A comma separated string of key | `"key1:group1"`
| accessKey                | N        | Input/Output |the AccessKey for kms| `"****************"`
| secretKey                | N        | Input/Output |the SecretKey for kms | `"****************"`
| timeout                | N        | Input/Output |timeout for requesting Nacos server, default value is 10000 ms | `1000`
| cacheDir                | N        | Input/Output |the directory for persist Nacos service info,default value is current path | `"/tmp/nacos/cache"`
| updateThreadNum                | N        | Input/Output |the number of gorutine for update Nacos service info,default value is 20 | `20`
| notLoadCacheAtStart                | N       | Input/Output |not to load persistent Nacos service info in CacheDir at start time | `"false"`
| updateCacheWhenEmpty                | N        | Input/Output |update cache when get empty service instance from server | `"false"`
| username                | N        | Input/Output |the password for Nacos auth | `"username"`
| password                | N        | Input/Output |the password for Nacos auth | `"password"`
| logDir                | N        | Input/Output |the directory for log, default is current path | `"/tmp/nacos/log"`
| rotateTime                | N        | Input/Output |the rotate time for log, eg: 30m, 1h, 24h, default is 24h| `"1h"`
| maxAge                | N        | Input/Output |the max age of a log file, default value is 3 | `3`
| logLevel                | N        | Input/Output |the level of log, it's must be debug,info,warn,error, default value is info | `"info"`
| watches                | N        | Input |A comma separated string of watch keys | `"key1:group1,key2:group2"`

## Binding support

This component supports both **input and output** binding interfaces.

This component supports **output binding** with the following operations:
- `create`
- `get`

## Create an AliCloud Nacos
Follow the instructions [here](https://www.alibabacloud.com/help/doc-detail/59963.htm) on setting up AliCloud nacos.
Follow the instructions [here](https://help.aliyun.com/document_detail/85466.html) on setting up AliCloud nacos.

## Specifying a partition key

When invoking the nacos binding, its possible to provide an optional partition key by using the `metadata` section in the request body.
You can specifie`config-id` and `config-group` in `metadata`

Example:

```shell
curl -X POST http://localhost:3500/v1.0/bindings/myNacos \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        },
        "metadata": {
          "config-id": "key1",
          "config-group": "group1"
        },
        "operation": "create"
      }'
```

```shell
curl -X POST http://localhost:3500/v1.0/bindings/myNacos \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        },
        "metadata": {
          "config-id": "key1",
          "config-group": "group1"
        },
        "operation": "get"
      }'
```
## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
