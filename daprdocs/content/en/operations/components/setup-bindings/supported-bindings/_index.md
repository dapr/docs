---
type: docs
title: "Supported external bindings"
linkTitle: "Supported bindings"
weight: 200
description: The supported external systems that interface with Dapr as input/output bindings
no_list: true
---

### Generic

| Name | Input<br>Binding | Output<br>Binding | Version | Status |
|------|:----------------:|:-----------------:|:--------:|--------|
| [Apple Push Notifications (APN)]({{< ref apns.md >}}) |  | ✅ | v1 | Alpha |
| [Cron (Scheduler)]({{< ref cron.md >}}) | ✅ | ✅ | v1 | Alpha |
| [HTTP]({{< ref http.md >}})           |    | ✅ | v1 | Alpha |
| [InfluxDB]({{< ref influxdb.md >}})       |    | ✅ | v1 | Alpha |
| [Kafka]({{< ref kafka.md >}})         | ✅ | ✅ | v1 | Alpha |
| [Kubernetes Events]({{< ref "kubernetes-binding.md" >}}) | ✅ |    | v1 | Alpha |
| [MQTT]({{< ref mqtt.md >}})           | ✅ | ✅ | v1 | Alpha |
| [MySQL]({{< ref mysql.md >}})       |    | ✅ | v1 | Alpha |
| [PostgreSql]({{< ref postgres.md >}})       |    | ✅ | v1 | Alpha |
| [Postmark]({{< ref postmark.md >}})       |    | ✅ | v1 | Alpha |
| [RabbitMQ]({{< ref rabbitmq.md >}})   | ✅ | ✅ | v1 | Alpha |
| [Redis]({{< ref redis.md >}})         |    | ✅ | v1 | Alpha |
| [SMTP]({{< ref smtp.md >}})         |    | ✅ | v1 | Alpha |
| [Twilio]({{< ref twilio.md >}})       |    | ✅ | v1 | Alpha |
| [Twitter]({{< ref twitter.md >}})       | ✅ | ✅ | v1 | Alpha |
| [SendGrid]({{< ref sendgrid.md >}})       |    | ✅ | v1 | Alpha |

### Alibaba Cloud

| Name | Input<br>Binding | Output<br>Binding | Status |
|------|:----------------:|:-----------------:|--------|
| [Alibaba Cloud OSS]({{< ref alicloudoss.md >}})           |    | ✅ | v1 | Alpha |

### Amazon Web Services (AWS)

| Name | Input<br>Binding | Output<br>Binding | Version | Status |
|------|:----------------:|:-----------------:|:--------:|--------|
| [AWS DynamoDB]({{< ref dynamodb.md >}}) |    | ✅ | v1 | Alpha |
| [AWS S3]({{< ref s3.md >}})             |    | ✅ | v1 | Alpha |
| [AWS SNS]({{< ref sns.md >}})           |    | ✅ | v1 | Alpha |
| [AWS SQS]({{< ref sqs.md >}})           | ✅ | ✅ | v1 | Alpha |
| [AWS Kinesis]({{< ref kinesis.md >}})   | ✅ | ✅ | v1 | Alpha |

### Google Cloud Platform (GCP)

| Name | Input<br>Binding | Output<br>Binding | Version | Status |
|------|:----------------:|:-----------------:|:--------:|--------|
| [GCP Cloud Pub/Sub]({{< ref gcppubsub.md >}})  | ✅ | ✅ | v1 | Alpha |
| [GCP Storage Bucket]({{< ref gcpbucket.md >}}) |     | ✅ | v1 | Alpha |

### Microsoft Azure

| Name | Input<br>Binding | Output<br>Binding | Version | Status |
|------|:----------------:|:-----------------:|:--------:|--------|
| [Azure Blob Storage]({{< ref blobstorage.md >}})            |    | ✅ | v1 | Alpha |
| [Azure CosmosDB]({{< ref cosmosdb.md >}})                   |    | ✅ | v1 | Alpha |
| [Azure Event Grid]({{< ref eventgrid.md >}})                | ✅ | ✅ | v1 | Alpha |
| [Azure Event Hubs]({{< ref eventhubs.md >}})                 | ✅ | ✅ | v1 | Alpha |
| [Azure Service Bus Queues]({{< ref servicebusqueues.md >}}) | ✅ | ✅ | v1 | Alpha |
| [Azure SignalR]({{< ref signalr.md >}})                     |    | ✅ | v1 | Alpha |
| [Azure Storage Queues]({{< ref storagequeues.md >}})        | ✅ | ✅ | v1 | Alpha |
