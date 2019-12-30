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

## Supported Bindings and Specs

Every binding has its own unique set of properties. Click the name link to see the component YAML for each binding.

| Name  | Input Binding | Output Binding | Status
| ------------- | -------------- | -------------  | ------------- |
| [Kafka](./specs/kafka.md) | ✅ | ✅ | Experimental |
| [RabbitMQ](./specs/rabbitmq.md) | ✅  | ✅ | Experimental |
| [AWS SQS](./specs/sqs.md) | ✅ | ✅ | Experimental |
| [AWS SNS](./specs/sns.md) |  | ✅ | Experimental |
| [Azure EventHubs](./specs/eventhubs.md) | ✅ | ✅ | Experimental |
| [Azure CosmosDB](./specs/cosmosdb.md) | | ✅ | Experimental |
| [GCP Storage Bucket](./specs/gcpbucket.md)  | | ✅ | Experimental |
| [HTTP](./specs/http.md) |  | ✅ | Experimental |
| [MQTT](./specs/mqtt.md) | ✅ | ✅ | Experimental |
| [Redis](./specs/redis.md) |  | ✅ | Experimental |
| [AWS DynamoDB](./specs/dynamodb.md) | | ✅ | Experimental |
| [AWS S3](./specs/s3.md) | | ✅ | Experimental |
| [Azure Blob Storage](./specs/blobstorage.md) | | ✅ | Experimental |
| [Azure Service Bus Queues](./specs/servicebusqueues.md) | ✅ | ✅ | Experimental |
| [GCP Cloud Pub/Sub](./specs/gcppubsub.md) | ✅ | ✅ | Experimental |
| [Kubernetes Events](./specs/kubernetes.md) | ✅ |  | Experimental |

## Input Bindings

Input bindings are used to trigger your application when an event from an external resource has occurred.
An optional payload and metadata might be sent with the request.

In order to receive events from an input binding:

1. Define the component YAML that describes the type of binding and its metadata (connection info, etc.)
2. Listen on an HTTP endpoint for the incoming event, or use the gRPC proto library to get incoming events

> On startup Dapr sends a ```OPTIONS``` request for all defined input bindings to the application and expects a different status code as ```NOT FOUND (404)``` if this application wants to subscribe to the binding.

Read the [How To](../../howto) section to get started with input bindings.

## Output Bindings

Output bindings allow users to invoke external resources
An optional payload and metadata can be sent with the invocation request.

In order to invoke an output binding:

1. Define the component YAML that describes the type of binding and its metadata (connection info, etc.)
2. Use the HTTP endpoint or gRPC method to invoke the binding with an optional payload

 Read the [How To](../../howto) section to get started with output bindings.
