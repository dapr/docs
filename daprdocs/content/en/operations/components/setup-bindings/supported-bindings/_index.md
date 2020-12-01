---
type: docs
title: "Supported external bindings"
linkTitle: "Supported bindings"
weight: 200
description: List of all the supported external bindings that can interface with Dapr
---

Every binding has its own unique set of properties. Click the name link to see the component YAML for each binding.

### Generic

| Name | Input<br>Binding | Output<br>Binding | Status |
|------|:----------------:|:-----------------:|--------|
| [APNs]({{< ref apns.md >}}) |  | ✅ | Experimental |
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