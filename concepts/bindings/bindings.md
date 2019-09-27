# Bindings

Using bindings, you can trigger your app with events coming in from external systems, or invoke external systems.
Bindings allow for on-demand, event-driven compute scenarios, and Actions Bindings help developers with the following:

* Remove the complexities of connecting to and polling from messaging systems such as queues, message buses etc
* Allows focusing on business logic and not worry about implementation details
* Keep the code free from any special SDKs or libraries
* Handles retries and failure recovery so that the developer code can remain worry free
* Switch between bindings in real time
* Enable portable, multi-cloud applications where environment-specific bindings are set-up and no code change is required

Bindings are developed independently of Actions. You can view and contribute to bindings [here](https://github.com/actionscore/components-contrib/tree/master/bindings). 

## Supported Bindings and Specs

Every binding has its own unique set of properties. click the name link to see the component YAML for each binding.

| Name  | Input Binding | Output Binding | Status
| ------------- | -------------- | -------------  | ------------- |
| [Kafka](./specs/kafka.md) | V | V | Experimental |
| [RabbitMQ](./specs/rabbitmq.md) | V  | V | Experimental |
| [AWS SQS](./specs/sqs.md) | V | V | Experimental |
| [AWS SNS](./specs/sns.md) |  | V | Experimental |
| [Azure EventHubs](./specs/eventhubs.md) | V | V | Experimental |
| [Azure CosmosDB](./specs/cosmosdb.md) |  V | | Experimental |
| [GCP Storage Bucket](./specs/gcpbucket.md)  | | V | Experimental |
| [HTTP](./specs/http.md) |  | V | Experimental |
| [MQTT](./specs/mqtt.md) | V | V | Experimental |
| [Redis](./specs/redis.md) |  | V | Experimental |
| [AWS DynamoDB](./specs/dynamodb.md) | | V | Experimental |
| [AWS S3](./specs/s3.md) | | V | Experimental |
| [Azure Blob Storage](./specs/blobstorage.md) | | V | Experimental |

## Input Bindings

Input bindings are used to trigger your app when a message from an external system has occured.
An optional payload and metadata might be sent with the request.

In order to receive events from an input binding:

1. Define the component YAML that describes the type of bindings and its metadata (connection info, etc.)
2. Listen on an HTTP endpoint for the incoming event, or use the gRPC proto library get incoming events

Plesae visit the [How To](../../howto) section to get started with input bindings.

## Output Bindings

Output bindings allow users to invoke external systems
An optional payload and metadata can be sent with the invocation request.

In order to invoke an output binding:

1. Define the component YAML that describes the type of bindings and its metadata (connection info, etc.)
2. Use the HTTP endpoint or gRPC method to invoke the binding with an optional payload

Plesae visit the [How To](../../howto) section to get started with output bindings.
