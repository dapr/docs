# Azure SignalR Binding Spec

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

> **Note:** In production never place passwords or secrets within Dapr components. For information on securely storing and retrieving secrets refer to [Setup Secret Store](../../../howto/setup-secret-store)

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
