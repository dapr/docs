---
type: docs
title: "Azure Storage Queues binding spec"
linkTitle: "Azure Storage Queues"
description: "Detailed documentation on the Azure Storage Queues binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/storagequeues/"
---

## Component format

To setup Azure Storage Queues binding create a component of type `bindings.azure.storagequeues`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.azure.storagequeues
  version: v1
  metadata:
  - name: accountName
    value: "account1"
  - name: accountKey
    value: "***********"
  - name: queueName
    value: "myqueue"
# - name: pollingInterval
#   value: "30s"
# - name: ttlInSeconds
#   value: "60"
# - name: decodeBase64
#   value: "false"
# - name: encodeBase64
#   value: "false"
# - name: endpoint
#   value: "http://127.0.0.1:10001"
# - name: visibilityTimeout
#   value: "30s"
# - name: direction 
#   value: "input, output"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support |  Details | Example |
|--------------------|:--------:|------------|-----|---------|
| `accountName` | Y | Input/Output | The name of the Azure Storage account | `"account1"` |
| `accountKey` | Y* | Input/Output | The access key of the Azure Storage account. Only required when not using Azure AD authentication. | `"access-key"` |
| `queueName` | Y | Input/Output | The name of the Azure Storage queue | `"myqueue"` |
| `pollingInterval` | N | Output | Set the interval to poll Azure Storage Queues for new messages, as a Go duration value. Default: `"10s"` | `"30s"` |
| `ttlInSeconds` | N | Output | Parameter to set the default message time to live. If this parameter is omitted, messages will expire after 10 minutes. See [also](#specifying-a-ttl-per-message) | `"60"` |
| `decodeBase64` | N | Input | Configuration to decode base64 content received from the Storage Queue into a string. Defaults to `false` | `true`, `false` |
| `encodeBase64` | N | Output | If enabled base64 encodes the data payload before uploading to Azure storage queues. Default `false`. | `true`, `false` |
| `endpoint` | N | Input/Output | Optional custom endpoint URL. This is useful when using the [Azurite emulator](https://github.com/Azure/azurite) or when using custom domains for Azure Storage (although this is not officially supported). The endpoint must be the full base URL, including the protocol (`http://` or `https://`), the IP or FQDN, and optional port. | `"http://127.0.0.1:10001"` or `"https://accountName.queue.example.com"` |
| `visibilityTimeout` | N | Input | Allows setting a custom queue visibility timeout to avoid immediate retrying of recently failed messages. Defaults to 30 seconds. | `"100s"` |
| `direction` | N | Input/Output | Direction of the binding. | `"input"`, `"output"`, `"input, output"` |

### Azure Active Directory (Azure AD) authentication

The Azure Storage Queue binding component supports authentication using all Azure Active Directory mechanisms. See the [docs for authenticating to Azure]({{< ref authenticating-azure.md >}}) to learn more about the relevant component metadata fields based on your choice of Azure AD authentication mechanism.

## Binding support

This component supports both **input and output** binding interfaces.

This component supports **output binding** with the following operations:

- `create`

## Specifying a TTL per message

Time to live can be defined on queue level (as illustrated above) or at the message level. The value defined at message level overwrites any value set at queue level.

To set time to live at message level use the `metadata` section in the request body during the binding invocation.

The field name is `ttlInSeconds`.

Example:

```shell
curl -X POST http://localhost:3500/v1.0/bindings/myStorageQueue \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        },
        "metadata": {
          "ttlInSeconds": "60"
        },
        "operation": "create"
      }'
```

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
