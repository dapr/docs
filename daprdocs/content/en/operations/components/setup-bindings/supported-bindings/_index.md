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
| [Alibaba Cloud OSSs]({{< ref alicloudoss.md >}})           |    | ✅ | Alpha |
| [Apple Push Notifications (APN)]({{< ref apns.md >}}) |  | ✅ | Alpha |
| [Cron (Scheduler)]({{< ref cron.md >}}) | ✅ | ✅ | Alpha |
| [HTTP]({{< ref http.md >}})           |    | ✅ | Alpha |
| [InfluxDB]({{< ref influxdb.md >}})       |    | ✅ | Alpha |
| [Kafka]({{< ref kafka.md >}})         | ✅ | ✅ | Alpha |
| [Kubernetes Events]({{< ref "kubernetes-binding.md" >}}) | ✅ |    | Alpha |
| [MQTT]({{< ref mqtt.md >}})           | ✅ | ✅ | Alpha |
| [MySQL]({{< ref mysql.md >}})       |    | ✅ | Alpha |
| [PostgreSql]({{< ref postgres.md >}})       |    | ✅ | Alpha |
| [Postmark]({{< ref postmark.md >}})       |    | ✅ | Alpha |
| [RabbitMQ]({{< ref rabbitmq.md >}})   | ✅ | ✅ | Alpha |
| [Redis]({{< ref redis.md >}})         |    | ✅ | Alpha |
| [Twilio]({{< ref twilio.md >}})       |    | ✅ | Alpha |
| [Twitter]({{< ref twitter.md >}})       | ✅ | ✅ | Alpha |
| [SendGrid]({{< ref sendgrid.md >}})       |    | ✅ | Alpha |

### Amazon Web Services (AWS)

| Name | Input<br>Binding | Output<br>Binding | Status |
|------|:----------------:|:-----------------:|--------|
| [AWS DynamoDB]({{< ref dynamodb.md >}}) |    | ✅ | Alpha |
| [AWS S3]({{< ref s3.md >}})             |    | ✅ | Alpha |
| [AWS SNS]({{< ref sns.md >}})           |    | ✅ | Alpha |
| [AWS SQS]({{< ref sqs.md >}})           | ✅ | ✅ | Alpha |
| [AWS Kinesis]({{< ref kinesis.md >}})   | ✅ | ✅ | Alpha |

### Google Cloud Platform (GCP)

| Name | Input<br>Binding | Output<br>Binding | Status |
|------|:----------------:|:-----------------:|--------|
| [GCP Cloud Pub/Sub]({{< ref gcppubsub.md >}})  | ✅ | ✅ | Alpha |
| [GCP Storage Bucket]({{< ref gcpbucket.md >}}) |     | ✅ | Alpha |

### Microsoft Azure

| Name | Input<br>Binding | Output<br>Binding | Status |
|------|:----------------:|:-----------------:|--------|
| [Azure Blob Storage]({{< ref blobstorage.md >}})            |    | ✅ | Alpha |
| [Azure CosmosDB]({{< ref cosmosdb.md >}})                   |    | ✅ | Alpha |
| [Azure Event Grid]({{< ref eventgrid.md >}})                | ✅ | ✅ | Alpha |
| [Azure Event Hubs]({{< ref eventhubs.md >}})                 | ✅ | ✅ | Alpha |
| [Azure Service Bus Queues]({{< ref servicebusqueues.md >}}) | ✅ | ✅ | Alpha |
| [Azure SignalR]({{< ref signalr.md >}})                     |    | ✅ | Alpha |
| [Azure Storage Queues]({{< ref storagequeues.md >}})        | ✅ | ✅ | Alpha |
