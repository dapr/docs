---
type: docs
title: "How-To: Enable the transactional outbox pattern"
linkTitle: "How-To: Enable the transactional outbox pattern"
weight: 400
description: "Commit a single transaction across a state store and pub/sub message broker"
---

The transactional outbox pattern is a well known design pattern for sending notifications regarding changes in an application's state. The transactional outbox pattern uses a single transaction that spans across the database and the message broker delivering the notification. 

Developers are faced with many difficult technical challenges when trying to implement this pattern on their own, which often involves writing error-prone central coordination managers that, at most, support a combination of one or two databases and message brokers.

For example, you can use the outbox pattern to:  
1. Write a new user record to an account database. 
1. Send a notification message that the account was successfully created. 

With Dapr's outbox support, you can notify subscribers when an application's state is created or updated when calling Dapr's [transactions API]({{% ref "state_api.md#state-transactions" %}}).

The diagram below is an overview of how the outbox feature works at a high level:

1) Service A saves/updates state to the state store using a transaction.
2) A message is written to the broker under the same transaction. When the message is successfully delivered to the message broker, the transaction completes, ensuring the state and message are transacted together.
3) The message broker delivers the message topic to any subscribers - in this case, Service B.

<img src="/images/state-management-outbox.png" width=800 alt="Diagram showing the overview of outbox pattern">

## How outbox works under the hood

Dapr outbox processes requests in two flows: the user request flow and the background message flow. Together, they guarantee that state and events stay consistent.

<img src="/images/state-management-outbox-steps.png" width=800 alt="Diagram showing the steps of the outbox pattern">

This is the sequence of interactions:

1. An application calls the Dapr State Management API to write state transactionally using the transactional methods.  
   This is the entry point where business data, such as an order or profile update, is submitted for persistence.

2. Dapr publishes an intent message with a unique transaction ID to an internal outbox topic.  
   This durable record ensures the event intent exists before any database commit happens.

3. The state and a transaction marker are written atomically in the same state store.  
   Both the business data and the marker are committed in the same transaction, preventing partial writes.

4. The application receives a success response after the transaction commits.  
   At this point, the application can continue, knowing state is saved and the event intent is guaranteed.

5. A background subscriber reads the intent message.  
   When outbox is enabled, Dapr starts consumers that process the internal outbox topic.

6. The subscriber verifies the transaction marker in the state store.  
   This check confirms that the database commit was successful before publishing externally.

7. Verified business event is published to the external pub/sub topic.  
   The event is sent to the configured broker (Kafka, RabbitMQ, etc.) where other services can consume it.

8. The marker is cleaned up (deleted) from the state store.  
   This prevents unbounded growth in the database once the event has been successfully delivered.

9. Message is acknowledged and removed from internal topic  
   If publishing or cleanup fails, Dapr retries, ensuring reliable at-least-once delivery.
  
## Requirements

1. The outbox feature requires a [transactional state store]({{% ref supported-state-stores %}}) supported by Dapr.  
   [Learn more about the transactional methods you can use.]({{% ref "howto-get-save-state.md#perform-state-transactions" %}})

2. Any [pub/sub broker]({{% ref supported-pubsub %}}) supported by Dapr can be used with the outbox feature.

   {{% alert title="Note" color="primary" %}}
   Message brokers that support the competing consumer pattern (for example, [Apache Kafka]({{% ref setup-apache-kafka%}})) are recommended to reduce the chance of duplicate events.
   {{% /alert %}}

3. Internal outbox topic  
   When outbox is enabled, Dapr creates an internal topic using the following naming convention: `{namespace}{appID}{topic}outbox`, where:

   - `namespace`: the Dapr application namespace (if configured)
   - `appID`: the Dapr application identifier
   - `topic`: the value specified in the `outboxPublishTopic` metadata

   This way each outbox topic is uniquely identified per application and external topic, preventing routing conflicts in multi-tenant environments.

   {{% alert title="Note" color="primary" %}}
   Ensure that the topic is created in advance, or Dapr has sufficient permissions to create the topic at startup time.
   {{% /alert %}}

## Enable the outbox pattern

To enable the outbox feature, add the following required and optional fields on a state store component:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mysql-outbox
spec:
  type: state.mysql
  version: v1
  metadata:
  - name: connectionString
    value: "<CONNECTION STRING>"
  - name: outboxPublishPubsub # Required
    value: "mypubsub"
  - name: outboxPublishTopic # Required
    value: "newOrder"
  - name: outboxPubsub # Optional
    value: "myOutboxPubsub"
  - name: outboxDiscardWhenMissingState #Optional. Defaults to false
    value: false
```

### Metadata fields

| Name                | Required    | Default Value | Description                                            |
| --------------------|-------------|---------------|------------------------------------------------------- |
| outboxPublishPubsub | Yes         | N/A           | Sets the name of the pub/sub component to deliver the notifications when publishing state changes
| outboxPublishTopic  | Yes         | N/A           | Sets the topic that receives the state changes on the pub/sub configured with `outboxPublishPubsub`. The message body will be a state transaction item for an `insert` or `update` operation
| outboxPubsub        | No          | `outboxPublishPubsub`           | Sets the pub/sub component used by Dapr to coordinate the state and pub/sub transactions. If not set, the pub/sub component configured with `outboxPublishPubsub` is used. This is useful if you want to separate the pub/sub component used to send the notification state changes from the one used to coordinate the transaction
| outboxDiscardWhenMissingState  | No         | `false`           | By setting `outboxDiscardWhenMissingState` to `true`, Dapr discards the transaction if it cannot find the state in the database and does not retry. This setting can be useful if the state store data has been deleted for any reason before Dapr was able to deliver the message and you would like Dapr to drop the items from the pub/sub and stop retrying to fetch the state

## Additional configurations

### Combining outbox and non-outbox messages on the same state store

If you want to use the same state store for sending both outbox and non-outbox messages, simply define two state store components that connect to the same state store, where one has the outbox feature and the other does not.

#### MySQL state store without outbox

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mysql
spec:
  type: state.mysql
  version: v1
  metadata:
  - name: connectionString
    value: "<CONNECTION STRING>"
```

#### MySQL state store with outbox

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mysql-outbox
spec:
  type: state.mysql
  version: v1
  metadata:
  - name: connectionString
    value: "<CONNECTION STRING>"
  - name: outboxPublishPubsub # Required
    value: "mypubsub"
  - name: outboxPublishTopic # Required
    value: "newOrder"
```

### Shape the outbox pattern message

You can override the outbox pattern message published to the pub/sub broker by setting another transaction that is not be saved to the database and is explicitly mentioned as a projection. This transaction is added a metadata key named `outbox.projection` with a value set to `true`. When added to the state array saved in a transaction, this payload is ignored when the state is written and the data is used as the payload sent to the upstream subscriber.

To use correctly, the `key` values must match between the operation on the state store and the message projection. If the keys do not match, the whole transaction fails.

If you have two or more `outbox.projection` enabled state items for the same key, the first one defined is used and the others are ignored. 

[Learn more about default and custom CloudEvent messages.]({{% ref pubsub-cloudevents.md %}})

{{< tabpane text=true >}}

{{% tab "Python" %}}

<!--python-->

In the following Python SDK example of a state transaction, the value of `"2"` is saved to the database, but the value of `"3"` is published to the end-user topic.

```python
DAPR_STORE_NAME = "statestore"

async def main():
    client = DaprClient()

    # Define the first state operation to save the value "2"
    op1 = StateItem(
        key="key1",
        value=b"2"
    )

    # Define the second state operation to publish the value "3" with metadata
    op2 = StateItem(
        key="key1",
        value=b"3",
        options=StateOptions(
            metadata={
                "outbox.projection": "true"
            }
        )
    )

    # Create the list of state operations
    ops = [op1, op2]

    # Execute the state transaction
    await client.state.transaction(DAPR_STORE_NAME, operations=ops)
    print("State transaction executed.")
```

By setting the metadata item `"outbox.projection"` to `"true"` and making sure the `key` values match (`key1`):
- The first operation is written to the state store and no message is written to the message broker.
- The second operation value is published to the configured pub/sub topic.   

{{% /tab %}}

{{% tab "JavaScript" %}}

<!--javascript-->

In the following JavaScript SDK example of a state transaction, the value of `"2"` is saved to the database, but the value of `"3"` is published to the end-user topic.

```javascript
const { DaprClient, StateOperationType } = require('@dapr/dapr');

const DAPR_STORE_NAME = "statestore";

async function main() {
  const client = new DaprClient();

  // Define the first state operation to save the value "2"
  const op1 = {
    operation: StateOperationType.UPSERT,
    request: {
      key: "key1",
      value: "2"
    }
  };

  // Define the second state operation to publish the value "3" with metadata
  const op2 = {
    operation: StateOperationType.UPSERT,
    request: {
      key: "key1",
      value: "3",
      metadata: {
        "outbox.projection": "true"
      }
    }
  };

  // Create the list of state operations
  const ops = [op1, op2];

  // Execute the state transaction
  await client.state.transaction(DAPR_STORE_NAME, ops);
  console.log("State transaction executed.");
}

main().catch(err => {
  console.error(err);
});
```

By setting the metadata item `"outbox.projection"` to `"true"` and making sure the `key` values match (`key1`):
- The first operation is written to the state store and no message is written to the message broker.
- The second operation value is published to the configured pub/sub topic.   


{{% /tab %}}

{{% tab ".NET" %}}

<!--dotnet-->

In the following .NET SDK example of a state transaction, the value of `"2"` is saved to the database, but the value of `"3"` is published to the end-user topic.

```csharp
public class Program
{
    private const string DAPR_STORE_NAME = "statestore";

    public static async Task Main(string[] args)
    {
        var client = new DaprClientBuilder().Build();

        // Define the first state operation to save the value "2"
        var op1 = new StateTransactionRequest(
            key: "key1",
            value: Encoding.UTF8.GetBytes("2"),
            operationType: StateOperationType.Upsert
        );

        // Define the second state operation to publish the value "3" with metadata
        var metadata = new Dictionary<string, string>
        {
            { "outbox.projection", "true" }
        };
        var op2 = new StateTransactionRequest(
            key: "key1",
            value: Encoding.UTF8.GetBytes("3"),
            operationType: StateOperationType.Upsert,
            metadata: metadata
        );

        // Create the list of state operations
        var ops = new List<StateTransactionRequest> { op1, op2 };

        // Execute the state transaction
        await client.ExecuteStateTransactionAsync(DAPR_STORE_NAME, ops);
        Console.WriteLine("State transaction executed.");
    }
}
```

By setting the metadata item `"outbox.projection"` to `"true"` and making sure the `key` values match (`key1`):
- The first operation is written to the state store and no message is written to the message broker.
- The second operation value is published to the configured pub/sub topic.    

{{% /tab %}}

{{% tab "Java" %}}

<!--java-->

In the following Java SDK example of a state transaction, the value of `"2"` is saved to the database, but the value of `"3"` is published to the end-user topic.

```java
public class Main {
    private static final String DAPR_STORE_NAME = "statestore";

    public static void main(String[] args) {
        try (DaprClient client = new DaprClientBuilder().build()) {
            // Define the first state operation to save the value "2"
            StateOperation<String> op1 = new StateOperation<>(
                    StateOperationType.UPSERT,
                    "key1",
                    "2"
            );

            // Define the second state operation to publish the value "3" with metadata
            Map<String, String> metadata = new HashMap<>();
            metadata.put("outbox.projection", "true");

            StateOperation<String> op2 = new StateOperation<>(
                    StateOperationType.UPSERT,
                    "key1",
                    "3",
                    metadata
            );

            // Create the list of state operations
            List<StateOperation<?>> ops = new ArrayList<>();
            ops.add(op1);
            ops.add(op2);

            // Execute the state transaction
            client.executeStateTransaction(DAPR_STORE_NAME, ops).block();
            System.out.println("State transaction executed.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

By setting the metadata item `"outbox.projection"` to `"true"` and making sure the `key` values match (`key1`):
- The first operation is written to the state store and no message is written to the message broker.
- The second operation value is published to the configured pub/sub topic.   


{{% /tab %}}

{{% tab "Go" %}}

<!--go-->

In the following Go SDK example of a state transaction, the value of `"2"` is saved to the database, but the value of `"3"` is published to the end-user topic.

```go
ops := make([]*dapr.StateOperation, 0)

op1 := &dapr.StateOperation{
    Type: dapr.StateOperationTypeUpsert,
    Item: &dapr.SetStateItem{
        Key:   "key1",
        Value: []byte("2"),
    },
}
op2 := &dapr.StateOperation{
    Type: dapr.StateOperationTypeUpsert,
    Item: &dapr.SetStateItem{
        Key:   "key1",
				Value: []byte("3"),
         // Override the data payload saved to the database 
				Metadata: map[string]string{
					"outbox.projection": "true",
        },
    },
}
ops = append(ops, op1, op2)
meta := map[string]string{}
err := testClient.ExecuteStateTransaction(ctx, store, meta, ops)
```

By setting the metadata item `"outbox.projection"` to `"true"` and making sure the `key` values match (`key1`):
- The first operation is written to the state store and no message is written to the message broker.
- The second operation value is published to the configured pub/sub topic.   

{{% /tab %}}

{{% tab "HTTP" %}}

<!--http-->

You can pass the message override using the following HTTP request:

```bash
curl -X POST http://localhost:3500/v1.0/state/starwars/transaction \
  -H "Content-Type: application/json" \
  -d '{
  "operations": [
    {
      "operation": "upsert",
      "request": {
        "key": "order1",
        "value": {
            "orderId": "7hf8374s",
            "type": "book",
            "name": "The name of the wind"
        }
      }
    },
    {
      "operation": "upsert",
      "request": {
        "key": "order1",
        "value": {
            "orderId": "7hf8374s"
        },
        "metadata": {
           "outbox.projection": "true"
        },
        "contentType": "application/json"
      }
    }
  ]
}'
```

By setting the metadata item `"outbox.projection"` to `"true"` and making sure the `key` values match (`key1`):
- The first operation is written to the state store and no message is written to the message broker.
- The second operation value is published to the configured pub/sub topic.   

{{% /tab %}}

{{< /tabpane >}}

### Override Dapr-generated CloudEvent fields

You can override the [Dapr-generated CloudEvent fields]({{% ref "pubsub-cloudevents.md#dapr-generated-cloudevents-example" %}}) on the published outbox event with custom CloudEvent metadata.

{{< tabpane text=true >}}

{{% tab "Python" %}}

<!--python-->

```python
async def execute_state_transaction():
    async with DaprClient() as client:
        # Define state operations
        ops = []

        op1 = {
            'operation': 'upsert',
            'request': {
                'key': 'key1',
                'value': b'2',  # Convert string to byte array
                'metadata': {
                    'cloudevent.id': 'unique-business-process-id',
                    'cloudevent.source': 'CustomersApp',
                    'cloudevent.type': 'CustomerCreated',
                    'cloudevent.subject': '123',
                    'my-custom-ce-field': 'abc'
                }
            }
        }

        ops.append(op1)

        # Execute state transaction
        store_name = 'your-state-store-name'
        try:
            await client.execute_state_transaction(store_name, ops)
            print('State transaction executed.')
        except Exception as e:
            print('Error executing state transaction:', e)

# Run the async function
if __name__ == "__main__":
    asyncio.run(execute_state_transaction())
```
{{% /tab %}}

{{% tab "JavaScript" %}}

<!--javascript-->

```javascript
const { DaprClient } = require('dapr-client');

async function executeStateTransaction() {
    // Initialize Dapr client
    const daprClient = new DaprClient();

    // Define state operations
    const ops = [];

    const op1 = {
        operationType: 'upsert',
        request: {
            key: 'key1',
            value: Buffer.from('2'),
            metadata: {
                'id': 'unique-business-process-id',
                'source': 'CustomersApp',
                'type': 'CustomerCreated',
                'subject': '123',
                'my-custom-ce-field': 'abc'
            }
        }
    };

    ops.push(op1);

    // Execute state transaction
    const storeName = 'your-state-store-name';
    const metadata = {};
}

executeStateTransaction();
```
{{% /tab %}}

{{% tab ".NET" %}}

<!--csharp-->

```csharp
public class StateOperationExample
{
    public async Task ExecuteStateTransactionAsync()
    {
        var daprClient = new DaprClientBuilder().Build();

        // Define the value "2" as a string and serialize it to a byte array
        var value = "2";
        var valueBytes = JsonSerializer.SerializeToUtf8Bytes(value);

        // Define the first state operation to save the value "2" with metadata
       // Override Cloudevent metadata
        var metadata = new Dictionary<string, string>
        {
            { "cloudevent.id", "unique-business-process-id" },
            { "cloudevent.source", "CustomersApp" },
            { "cloudevent.type", "CustomerCreated" },
            { "cloudevent.subject", "123" },
            { "my-custom-ce-field", "abc" }
        };

        var op1 = new StateTransactionRequest(
            key: "key1",
            value: valueBytes,
            operationType: StateOperationType.Upsert,
            metadata: metadata
        );

        // Create the list of state operations
        var ops = new List<StateTransactionRequest> { op1 };

        // Execute the state transaction
        var storeName = "your-state-store-name";
        await daprClient.ExecuteStateTransactionAsync(storeName, ops);
        Console.WriteLine("State transaction executed.");
    }

    public static async Task Main(string[] args)
    {
        var example = new StateOperationExample();
        await example.ExecuteStateTransactionAsync();
    }
}
```
{{% /tab %}}

{{% tab "Java" %}}

<!--java-->

```java
public class StateOperationExample {

    public static void main(String[] args) {
        executeStateTransaction();
    }

    public static void executeStateTransaction() {
        // Build Dapr client
        try (DaprClient daprClient = new DaprClientBuilder().build()) {

            // Define the value "2"
            String value = "2";

            // Override CloudEvent metadata
            Map<String, String> metadata = new HashMap<>();
            metadata.put("cloudevent.id", "unique-business-process-id");
            metadata.put("cloudevent.source", "CustomersApp");
            metadata.put("cloudevent.type", "CustomerCreated");
            metadata.put("cloudevent.subject", "123");
            metadata.put("my-custom-ce-field", "abc");

            // Define state operations
            List<StateOperation<?>> ops = new ArrayList<>();
            StateOperation<String> op1 = new StateOperation<>(
                    StateOperationType.UPSERT,
                    "key1",
                    value,
                    metadata
            );
            ops.add(op1);

            // Execute state transaction
            String storeName = "your-state-store-name";
            daprClient.executeStateTransaction(storeName, ops).block();
            System.out.println("State transaction executed.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```
{{% /tab %}}

{{% tab "Go" %}}

<!--go-->

```go
func main() {
	// Create a Dapr client
	client, err := dapr.NewClient()
	if err != nil {
		log.Fatalf("failed to create Dapr client: %v", err)
	}
	defer client.Close()

	ctx := context.Background()
	store := "your-state-store-name"

	// Define state operations
	ops := make([]*dapr.StateOperation, 0)
	op1 := &dapr.StateOperation{
		Type: dapr.StateOperationTypeUpsert,
		Item: &dapr.SetStateItem{
			Key:   "key1",
			Value: []byte("2"),
			// Override Cloudevent metadata
			Metadata: map[string]string{
				"cloudevent.id":                "unique-business-process-id",
				"cloudevent.source":            "CustomersApp",
				"cloudevent.type":              "CustomerCreated",
				"cloudevent.subject":           "123",
				"my-custom-ce-field":           "abc",
			},
		},
	}
	ops = append(ops, op1)

	// Metadata for the transaction (if any)
	meta := map[string]string{}

	// Execute state transaction
	err = client.ExecuteStateTransaction(ctx, store, meta, ops)
	if err != nil {
		log.Fatalf("failed to execute state transaction: %v", err)
	}

	log.Println("State transaction executed.")
}
```
{{% /tab %}}

{{% tab "HTTP" %}}

<!--http-->

```bash
curl -X POST http://localhost:3500/v1.0/state/starwars/transaction \
  -H "Content-Type: application/json" \
  -d '{
        "operations": [
          {
            "operation": "upsert",
            "request": {
              "key": "key1",
              "value": "2"
            }
          },
        ],
        "metadata": {
          "id": "unique-business-process-id",
          "source": "CustomersApp",
          "type": "CustomerCreated",
          "subject": "123",
          "my-custom-ce-field": "abc",
        }
      }'
```

{{% /tab %}}

{{< /tabpane >}}


{{% alert title="Note" color="primary" %}}
The `data` CloudEvent field is reserved for Dapr's use only, and is non-customizable.

{{% /alert %}}

## Demo

Watch [this video for an overview of the outbox pattern](https://youtu.be/rTovKpG0rhY?t=1338):

{{< youtube id=rTovKpG0rhY start=1338 >}}

## Next Steps

[How Dapr Outbox Eliminates Dual Writes in Distributed Applications](https://www.diagrid.io/blog/how-dapr-outbox-eliminates-dual-writes-in-distributed-applications)
