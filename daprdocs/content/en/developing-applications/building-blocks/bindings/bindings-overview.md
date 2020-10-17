---
type: docs
title: "Bindings overview"
linkTitle: "Overview"
weight: 100
description: Overview of the Dapr bindings building block
---

## Introduction

Using bindings, you can trigger your app with events coming in from external systems, or interface with external systems. This building block provides several benefits for you and your code:

- Remove the complexities of connecting to, and polling from, messaging systems such as queues and message buses
- Focus on business logic and not implementation details of how to interact with a system
- Keep your code free from SDKs or libraries
- Handle retries and failure recovery
- Switch between bindings at run time
- Build portable applications where environment-specific bindings are set-up and no code changes are required

For a specific example, bindings would allow your microservice to respond to incoming Twilio/SMS messages without adding or configuring a third-party Twilio SDK, worrying about polling from Twilio (or using websockets, etc.).

Bindings are developed independently of Dapr runtime. You can view and contribute to the bindings [here](https://github.com/dapr/components-contrib/tree/master/bindings).

## Input bindings

Input bindings are used to trigger your application when an event from an external resource has occurred.
An optional payload and metadata may be sent with the request.

In order to receive events from an input binding:

1. Define the component YAML that describes the type of binding and its metadata (connection info, etc.)
2. Listen on an HTTP endpoint for the incoming event, or use the gRPC proto library to get incoming events

> On startup Dapr sends a `OPTIONS` request for all defined input bindings to the application and expects a status code other than `NOT FOUND (404)` if this application wants to subscribe to the binding.

Read the [Create an event-driven app using input bindings]({{< ref howto-triggers.md >}}) page to get started with input bindings.

## Output bindings

Output bindings allow users to invoke external resources.
An optional payload and metadata can be sent with the invocation request.

In order to invoke an output binding:

1. Define the component YAML that describes the type of binding and its metadata (connection info, etc.)
2. Use the HTTP endpoint or gRPC method to invoke the binding with an optional payload

Read the [Send events to external systems using output bindings]({{< ref howto-bindings.md >}}) page to get started with output bindings.

## Supported bindings

Every binding has its own unique set of properties. Click the name link to see the component YAML for each binding.

### Generic

| Name | Input<br>Binding | Output<br>Binding | Status |
|------|:----------------:|:-----------------:|--------|
| [Cron (Scheduler)]({{< ref cron.md >}}) | ✅ | ✅ | Experimental |
| [HTTP]({{< ref http.md >}})           |    | ✅ | Experimental |
| [InfluxDB]({{< ref influxdb.md >}})       |    | ✅ | Experimental |
| [Kafka]({{< ref kafka.md >}})         | ✅ | ✅ | Experimental |
| [Kubernetes Events]({{< ref "kubernetes-binding.md" >}}) | ✅ |    | Experimental |
| [MQTT]({{< ref mqtt.md >}})           | ✅ | ✅ | Experimental |
| [PostgreSql]({{< ref postgres.md >}})       |    | ✅ | Experimental |
| [RabbitMQ]({{< ref rabbitmq.md >}})   | ✅ | ✅ | Experimental |
| [Redis]({{< ref redis.md >}})         |    | ✅ | Experimental |
| [Twilio]({{< ref twilio.md >}})       |    | ✅ | Experimental |
| [Twitter]({{< ref twitter.md >}})       | ✅ | ✅ | Experimental |
| [SendGrid]({{< ref sendgrid.md >}})       |    | ✅ | Experimental |


### Amazon Web Service (AWS)

| Name | Input<br>Binding | Output<br>Binding | Status |
|------|:----------------:|:-----------------:|--------|
| [AWS DynamoDB]({{< ref dynamodb.md >}}) |    | ✅ | Experimental |
| [AWS S3]({{< ref s3.md >}})             |    | ✅ | Experimental |
| [AWS SNS]({{< ref sns.md >}})           |    | ✅ | Experimental |
| [AWS SQS]({{< ref sqs.md >}})           | ✅ | ✅ | Experimental |
| [AWS Kinesis]({{< ref kinesis.md >}})   | ✅ | ✅ | Experimental |


### Google Cloud Platform (GCP)

| Name | Input<br>Binding | Output<br>Binding | Status |
|------|:----------------:|:-----------------:|--------|
| [GCP Cloud Pub/Sub]({{< ref gcppubsub.md >}})  | ✅ | ✅ | Experimental |
| [GCP Storage Bucket]({{< ref gcpbucket.md >}}) |     | ✅ | Experimental |

### Microsoft Azure

| Name | Input<br>Binding | Output<br>Binding | Status |
|------|:----------------:|:-----------------:|--------|
| [Azure Blob Storage]({{< ref blobstorage.md >}})            |    | ✅ | Experimental |
| [Azure EventHubs]({{< ref eventhubs.md >}})                 | ✅ | ✅ | Experimental |
| [Azure CosmosDB]({{< ref cosmosdb.md >}})                   |    | ✅ | Experimental |
| [Azure Service Bus Queues]({{< ref servicebusqueues.md >}}) | ✅ | ✅ | Experimental |
| [Azure SignalR]({{< ref signalr.md >}})                     |    | ✅ | Experimental |
| [Azure Storage Queues]({{< ref storagequeues.md >}})        | ✅ | ✅ | Experimental |
| [Azure Event Grid]({{< ref eventgrid.md >}})                | ✅ | ✅ | Experimental |

 ## Related Topics
- [Implementing a new binding]({{< ref binding-specs >}})
- [Trigger a service from different resources with input bindings]({{< ref howto-triggers.md >}})
- [Invoke different resources using output bindings]({{< ref howto-bindings.md >}})

