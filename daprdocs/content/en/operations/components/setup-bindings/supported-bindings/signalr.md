---
type: docs
title: "Azure SignalR binding spec"
linkTitle: "Azure SignalR"
description: "Detailed documentation on the Azure SignalR binding component"
---

## Setup Dapr component

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.azure.signalr
  metadata:
  - name: connectionString
    value: Endpoint=https://<your-azure-signalr>.service.signalr.net;AccessKey=<your-access-key>;Version=1.0;
  - name: hub  # Optional
    value: <hub name>
```

- The metadata `connectionString` contains the Azure SignalR connection string.
- The optional `hub` metadata value defines the hub in which the message will be send. The hub can be dynamically defined as a metadata value when publishing to an output binding (key is "hub").

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}


## Additional information

By default the Azure SignalR output binding will broadcast messages to all connected users. To narrow the audience there are two options, both configurable in the Metadata property of the message:

- group: will send the message to a specific Azure SignalR group
- user: will send the message to a specific Azure SignalR user

Applications publishing to an Azure SignalR output binding should send a message with the following contract:

```json
{
    "data": {
        "Target": "<enter message name>",
        "Arguments": [
            {
                "sender": "dapr",
                "text": "Message from dapr output binding"
            }
        ]
    },
    "metadata": {
        "group": "chat123"
    },
    "operation": "create"
}
```

For more information on integration Azure SignalR into a solution check the [documentation](https://docs.microsoft.com/en-us/azure/azure-signalr/)

## Output Binding Supported Operations

* create

## Related links
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})