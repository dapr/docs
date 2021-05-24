---
type: docs
title: "Alibaba Cloud Object Storage Service binding spec"
linkTitle: "Alibaba Cloud Object Storage"
description: "Detailed documentation on the Alibaba Cloud Object Storage binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/alicloudoss/"
---

## Component format

To setup an Alibaba Cloud Object Storage binding create a component of type `bindings.alicloud.oss`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: alicloudobjectstorage
  namespace: default
spec:
  type: bindings.alicloud.oss
  version: v1
  metadata:
  - name: endpoint
    value: "[endpoint]"
  - name: accessKeyID
    value: "[key-id]"
  - name: accessKey
    value: "[access-key]"
  - name: bucket
    value: "[bucket]"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field         | Required | Binding support  | Details | Example |
|---------------|----------|---------|---------|---------|
| `endpoint`    | Y | Output | Alicloud OSS endpoint. | https://oss-cn-hangzhou.aliyuncs.com
| `accessKeyID` | Y | Output | Access key ID credential. |
| `accessKey`   | Y | Output | Access key credential. |
| `bucket`      | Y | Output | Name of the storage bucket. |

## Binding support

This component supports **output binding** with the following operations:
- `create`: [Create object](#create-object)


### Create object

To perform a create object operation, invoke the binding with a `POST` method and the following JSON body:

```json
{
  "operation": "create",
  "data": "YOUR_CONTENT"
}
```

{{% alert title="Note" color="primary" %}}
By default, a random UUID is auto-generated as the object key. See below for Metadata support to set the key for the object.
{{% /alert %}}

#### Example

**Saving to a random generated UUID file**

{{< tabs "Windows" "Linux/MacOS" >}}

{{% codetab %}}

```bash
curl -d "{ \"operation\": \"create\", \"data\": \"Hello World\" }" http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```

{{% /codetab %}}

{{% codetab %}}

```bash
curl -d '{ "operation": "create", "data": "Hello World" }' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```

{{% /codetab %}}

{{< /tabs >}}

<br />

**Saving to a specific file**
{{< tabs "Windows" "Linux/MacOS" >}}

{{% codetab %}}

```bash
curl -d "{ \"operation\": \"create\", \"data\": \"Hello World\", \"metadata\": { \"key\": \"my-key\" } }" http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```

{{% /codetab %}}

{{% codetab %}}

```bash
curl -d '{ "operation": "create", "data": "Hello World", "metadata": { "key": "my-key" } }' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```

{{% /codetab %}}

{{< /tabs >}}

{{% alert title="Note" color="primary" %}}
Windows CMD requires escaping the `"` character.
{{% /alert %}}

## Metadata information

### Object key

By default, the Alicloud OSS output binding will auto-generate a UUID as the object key.
You can set the key with the following metadata:

```json
{
    "data": "file content",
    "metadata": {
        "key": "my-key"
    },
    "operation": "create"
}
```

## Related links

- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
