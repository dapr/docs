# Setup Azure Service Bus

Follow the instructions [here](https://docs.microsoft.com/en-us/azure/service-bus-messaging/service-bus-quickstart-topics-subscriptions-portal) on setting up Azure Service Bus Topics.

## Create a Dapr component

The next step is to create a Dapr component for Azure Service Bus.

Create the following YAML file named `azuresb.yaml`:

```
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <name>
spec:
  type: pubsub.azure.servicebus
  metadata:
  - name: connectionString
    value: <REPLACE-WITH-CONNECTION-STRING> # Required.
  - name: timeoutInSec
    value: <REPLACE-WITH-TIMEOUT-IN-SEC> # Optional. Default: "60".
  - name: disableEntityManagement
    value: <REPLACE-WITH-DISABLE-ENTITY-MANAGEMENT> # Optional. Default: false. When set to true, topics and subscriptions do not get created automatically.
  - name: maxDeliveryCount
    value: <REPLACE-WITH-MAX-DELIVERY-COUNT> # Optional.
  - name: lockDurationInSec
    value: <REPLACE-WITH-LOCK-DURATION-IN-SEC> # Optional.
  - name: defaultMessageTimeToLiveInSec
    value: <REPLACE-WITH-MESSAGE-TIME-TO-LIVE-IN-SEC> # Optional.
  - name: autoDeleteOnIdleInSec
    value: <REPLACE-WITH-AUTO-DELETE-ON-IDLE-IN-SEC> # Optional.
```

The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here](../../concepts/components/secrets.md)


## Apply the configuration

### In Kubernetes

To apply the Azure Service Bus pub/sub to Kubernetes, use the `kubectl` CLI:

```
kubectl apply -f azuresb.yaml
```

### Running locally

The Dapr CLI will automatically create a directory named `components` in your current working directory with a Redis component.
To use Azure Service Bus, replace the redis_messagebus.yaml file with azuresb.yaml above.
