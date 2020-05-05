# Bindings

Using bindings, you can trigger your app with events coming in from external systems, or invoke external systems.
Bindings allow for on-demand, event-driven compute scenarios, and dapr bindings help developers with the following:

* Remove the complexities of connecting to, and polling from, messaging systems such as queues, message buses, etc.
* Focus on business logic and not the implementation details of how interact with a system
* Keep the code free from SDKs or libraries
* Handles retries and failure recovery
* Switch between bindings at runtime time
* Enable portable applications where environment-specific bindings are set-up and no code changes are required

Bindings are developed independently of Dapr runtime. You can view and contribute to the bindings [here](https://github.com/dapr/components-contrib/tree/master/bindings).

## Supported bindings and specs

Every binding has its own unique set of properties. Click the name link to see the component YAML for each binding.

### Generic

| Name | Input<br>Binding | Output<br>Binding | Status |
|------|:----------------:|:-----------------:|--------|
| [HTTP](../../reference/specs/bindings/http.md)           |    | ✅ | Experimental |
| [Kafka](../../reference/specs/bindings/kafka.md)         | ✅ | ✅ | Experimental |
| [Kubernetes Events](../../reference/specs/bindings/kubernetes.md) | ✅ |    | Experimental |
| [MQTT](../../reference/specs/bindings/mqtt.md)           | ✅ | ✅ | Experimental |
| [RabbitMQ](../../reference/specs/bindings/rabbitmq.md)   | ✅ | ✅ | Experimental |
| [Redis](../../reference/specs/bindings/redis.md)         |    | ✅ | Experimental |
| [Twilio](../../reference/specs/bindings/twilio.md)       |    | ✅ | Experimental |
| [SendGrid](../../reference/specs/bindings/sendgrid.md)       |    | ✅ | Experimental |

### Amazon Web Service (AWS)

| Name | Input<br>Binding | Output<br>Binding | Status |
|------|:----------------:|:-----------------:|--------|
| [AWS DynamoDB](../../reference/specs/bindings/dynamodb.md) |    | ✅ | Experimental |
| [AWS S3](../../reference/specs/bindings/s3.md)             |    | ✅ | Experimental |
| [AWS SNS](../../reference/specs/bindings/sns.md)           |    | ✅ | Experimental |
| [AWS SQS](../../reference/specs/bindings/sqs.md)           | ✅ | ✅ | Experimental |
| [AWS Kinesis](../../reference/specs/bindings/kinesis.md)   | ✅ | ✅ | Experimental |


### Google Cloud Platform (GCP)

| Name | Input<br>Binding | Output<br>Binding | Status |
|------|:----------------:|:-----------------:|--------|
| [GCP Cloud Pub/Sub](../../reference/specs/bindings/gcppubsub.md)  | ✅ | ✅ | Experimental |
| [GCP Storage Bucket](../../reference/specs/bindings/gcpbucket.md) |     | ✅ | Experimental |

### Microsoft Azure

| Name | Input<br>Binding | Output<br>Binding | Status |
|------|:----------------:|:-----------------:|--------|
| [Azure Blob Storage](../../reference/specs/bindings/blobstorage.md)            |    | ✅ | Experimental |
| [Azure EventHubs](../../reference/specs/bindings/eventhubs.md)                 | ✅ | ✅ | Experimental |
| [Azure CosmosDB](../../reference/specs/bindings/cosmosdb.md)                   |    | ✅ | Experimental |
| [Azure Service Bus Queues](../../reference/specs/bindings/servicebusqueues.md) | ✅ | ✅ | Experimental |
| [Azure SignalR](../../reference/specs/bindings/signalr.md)                     |    | ✅ | Experimental |
| [Azure Storage Queues](../../reference/specs/bindings/storagequeues.md)        | ✅ | ✅ | Experimental |
| [Azure Event Grid](../../reference/specs/bindings/eventgrid.md)                | ✅ | ✅ | Experimental |

## Input bindings

Input bindings are used to trigger your application when an event from an external resource has occurred.
An optional payload and metadata might be sent with the request.

In order to receive events from an input binding:

1. Define the component YAML that describes the type of binding and its metadata (connection info, etc.)
2. Listen on an HTTP endpoint for the incoming event, or use the gRPC proto library to get incoming events

> On startup Dapr sends a ```OPTIONS``` request for all defined input bindings to the application and expects a different status code as ```NOT FOUND (404)``` if this application wants to subscribe to the binding.

Read the [Create an event-driven app using input bindings](../../howto/trigger-app-with-input-binding) section to get started with input bindings.

## Output bindings

Output bindings allow users to invoke external resources
An optional payload and metadata can be sent with the invocation request.

In order to invoke an output binding:

1. Define the component YAML that describes the type of binding and its metadata (connection info, etc.)
2. Use the HTTP endpoint or gRPC method to invoke the binding with an optional payload

 Read the [Send events to external systems using Output Bindings](../../howto/send-events-with-output-bindings) section to get started with output bindings.

 ## Related Topics
* [Implementing a new binding](https://github.com/dapr/docs/tree/master/reference/specs/bindings)
* [Trigger a service from different resources with input bindings](./trigger-app-with-input-binding)
* [Invoke different resources using output bindings](./send-events-with-output-bindings)

