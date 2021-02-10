---
type: docs
title: "Alibaba Cloud Object Storage Service binding spec"
linkTitle: "Alibaba Cloud Object Storage"
description: "Detailed documentation on the Alibaba Cloud Object Storage binding component"
---

## Setup Dapr component

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.alicloud.oss
  version: v1
  metadata:
  - name: endpoint
    value: <endpoint>
  - name: accessKeyID
    value: <key-id>
  - name: accessKey
    value: <access-key>
  - name: bucket
    value: <bucket>
```

- `endpoint` is the Alicloud OSS endpoint. Example: https://oss-cn-hangzhou.aliyuncs.com
- `accessKeyID` is the access key ID credential.
- `accessKey` is the access key credential.
- `bucket` is the name of the storage bucket.

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Output Binding Supported Operations

### Create Object

To perform a create object operation, invoke the binding with a `POST` method and the following JSON body:

> Note: by default, a random UUID is generated. See below for Metadata support to set the key for the object.

```json
{
  "operation": "create",
  "data": "YOUR_CONTENT"
}
```

#### Example:

> We escape since ' is not supported on Windows
> On Windows, utilize CMD (PowerShell has different escaping mechanism)

**Saving to a random generated UUID file**

```bash
curl -d "{ \"operation\": \"create\", \"data\": \"Hello World\" }" \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```

**Saving to a specific file**

```bash
curl -d "{ \"operation\": \"create\", \"data\": \"Hello World\", \"metadata\": { \"key\": \"my-key\" } }" \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```

## Metadata information

By default the Alicloud OSS output binding will auto generate a UUID as the object key.
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
