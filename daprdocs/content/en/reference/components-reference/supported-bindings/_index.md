---
type: docs
title: "Bindings component specs"
linkTitle: "Bindings"
weight: 3000
description: The supported external bindings that interface with Dapr
aliases:
  - "/operations/components/setup-bindings/supported-bindings/"
no_list: true
---

Every binding has its own unique set of properties. Click the name link to see the component YAML for each binding.


Table captions:

> `Status`: [Component certification]({{<ref "certification-lifecycle.md">}}) status
  - [Alpha]({{<ref "certification-lifecycle.md#alpha">}})
  - [Beta]({{<ref "certification-lifecycle.md#beta">}})
  - [GA]({{<ref "certification-lifecycle.md#general-availability-ga">}})
> `Since`: defines from which Dapr Runtime version, the component is in the current status

> `Component version`: defines the version of the component
### Generic

| Name | Input<br>Binding | Output<br>Binding | Status | Component version | Since runtime version |
|------|:----------------:|:-----------------:|--------|-------- | ---------|
| [Apple Push Notifications (APN)]({{< ref apns.md >}}) |  | ✅ | Alpha | v1 | 1.0 |
| [Cron (Scheduler)]({{< ref cron.md >}}) | ✅ | ✅ | Alpha | v1 | 1.0 |
| [GraphQL]({{< ref graghql.md >}})           |    | ✅ | Alpha | v1 | 1.0 |
| [HTTP]({{< ref http.md >}})           |    | ✅ | GA | v1 | 1.0 |
| [InfluxDB]({{< ref influxdb.md >}})       |    | ✅ | Alpha | v1 | 1.0 |
| [Kafka]({{< ref kafka.md >}})         | ✅ | ✅ | Alpha | v1 | 1.0 |
| [Kubernetes Events]({{< ref "kubernetes-binding.md" >}}) | ✅ |    | Alpha | v1 | 1.0 |
| [Local Storage]({{< ref localstorage.md >}})           |    | ✅ | Alpha | v1 | 1.1 |
| [MQTT]({{< ref mqtt.md >}})           | ✅ | ✅ | Alpha | v1 | 1.0 |
| [MySQL]({{< ref mysql.md >}})       |    | ✅ | Alpha | v1 | 1.0 |
| [PostgreSql]({{< ref postgres.md >}})       |    | ✅ | Alpha | v1 | 1.0 |
| [Postmark]({{< ref postmark.md >}})       |    | ✅ | Alpha | v1 | 1.0 |
| [RabbitMQ]({{< ref rabbitmq.md >}})   | ✅ | ✅ | Alpha | v1 | 1.0 |
| [Redis]({{< ref redis.md >}})         |    | ✅ | Alpha | v1 | 1.0 |
| [SMTP]({{< ref smtp.md >}})         |    | ✅ | Alpha | v1 | 1.0 |
| [Twilio]({{< ref twilio.md >}})       |    | ✅ | Alpha | v1 | 1.0 |
| [Twitter]({{< ref twitter.md >}})       | ✅ | ✅ | Alpha | v1 | 1.0 |
| [SendGrid]({{< ref sendgrid.md >}})       |    | ✅ | Alpha | v1 | 1.0 |

### Alibaba Cloud

| Name | Input<br>Binding | Output<br>Binding | Status | Component version | Since |
|------|:----------------:|:-----------------:|--------| ------ |----------|
| [Alibaba Cloud DingTalk]({{< ref alicloud-dingtalk.md >}})           |  ✅ | ✅ | Alpha | v1 | 1.2 |
| [Alibaba Cloud OSS]({{< ref alicloudoss.md >}})           |    | ✅ | Alpha | v1 | 1.0 |

### Amazon Web Services (AWS)

| Name | Input<br>Binding | Output<br>Binding | Status | Component version | Since |
|------|:----------------:|:-----------------:|--------| ------ |----------|
| [AWS DynamoDB]({{< ref dynamodb.md >}}) |    | ✅ | Alpha | v1 | 1.0 |
| [AWS S3]({{< ref s3.md >}})             |    | ✅ | Alpha | v1 | 1.0 |
| [AWS SNS]({{< ref sns.md >}})           |    | ✅ | Alpha | v1 | 1.0 |
| [AWS SQS]({{< ref sqs.md >}})           | ✅ | ✅ | Alpha | v1 | 1.0 |
| [AWS Kinesis]({{< ref kinesis.md >}})   | ✅ | ✅ | Alpha | v1 | 1.0 |

### Google Cloud Platform (GCP)

| Name | Input<br>Binding | Output<br>Binding | Status | Component version | Since |
|------|:----------------:|:-----------------:|--------| ------ | ---------- |
| [GCP Cloud Pub/Sub]({{< ref gcppubsub.md >}})  | ✅ | ✅ | Alpha | v1 | 1.0 |
| [GCP Storage Bucket]({{< ref gcpbucket.md >}}) |     | ✅ | Alpha | v1 | 1.0 |

### Microsoft Azure

| Name | Input<br>Binding | Output<br>Binding | Status | Component version | Since |
|------|:----------------:|:-----------------:|--------| --------- | ---------- |
| [Azure Blob Storage]({{< ref blobstorage.md >}})            |    | ✅ | Alpha | v1 | 1.0 |
| [Azure CosmosDB]({{< ref cosmosdb.md >}})                   |    | ✅ | Alpha | v1 | 1.0 |
| [Azure Event Grid]({{< ref eventgrid.md >}})                | ✅ | ✅ | Alpha | v1 | 1.0 |
| [Azure Event Hubs]({{< ref eventhubs.md >}})                 | ✅ | ✅ | Alpha | v1 | 1.0 |
| [Azure Service Bus Queues]({{< ref servicebusqueues.md >}}) | ✅ | ✅ | Alpha | v1 | 1.0 |
| [Azure SignalR]({{< ref signalr.md >}})                     |    | ✅ | Alpha | v1 | 1.0 |
| [Azure Storage Queues]({{< ref storagequeues.md >}})        | ✅ | ✅ | GA | v1 | 1.0 |

### Zeebe (Camunda Cloud)

| Name | Input<br>Binding | Output<br>Binding | Status | Component version | Since |
|------|:----------------:|:-----------------:|--------| --------- | ---------- |
| [Zeebe Command]({{< ref zeebe-command.md >}})            |    | ✅ | Alpha | v1 | 1.2 |
| [Zeebe Job Worker]({{< ref zeebe-jobworker.md >}})       | ✅ |    | Alpha | v1 | 1.2 |
