---
type: docs
title: "Message Time-To-Live"
linkTitle: "Message TTL"
weight: 6000
description: "Use time-to-live in Pub/Sub messages." 
---

## Introduction

Dapr enables per-message time-to-live (TTL). This means that applications can set time-to-live per message, and subscribers will not receive those messages after expiration.

All Dapr [pub/sub components]({{< ref supported-pubsub >}}) are compatible with message TTL, as Dapr handles the TTL logic within the runtime. Simply set the `ttlInSeconds` metadata when publishing a message.

In some components, such as Kafka, time-to-live can be configured in the topic via `retention.ms` as per [documentation](https://kafka.apache.org/documentation/#topicconfigs_retention.ms). With message TTL in Dapr, applications using Kafka can now set time-to-live per message in addition to per topic.

## Native message TTL support

When message time-to-live has native support in the component, Dapr will simply forward the time-to-live configuration without adding extra logic, keeping predictable behavior. This is helpful when the expired messages are handled differently by the component - like in Azure Service Bus, where expired messages are stored in the dead letter queue and not simply deleted.

### Components with native message TTL support

#### Azure Service Bus

Azure Service Bus supports [entity level time-to-live]((https://docs.microsoft.com/en-us/azure/service-bus-messaging/message-expiration)). It means that messages have a default time-to-live but can also be set with a shorter timespan at publishing time. Dapr will propagate the time-to-live metadata for the message and let Azure Service Bus handle expiration directly.

## Non-Dapr subscribers

If messages are consumed by subscribers without Dapr, expired messages are not automatically dropped, as expiration is handled by the Dapr runtime when a Dapr application receives a message. However, subscribers can programmatically drop expired messages by adding logic to handle the `expiration` attribute in the cloud event, which follows the [RFC3339](https://tools.ietf.org/html/rfc3339) format.

When non-Dapr subscribers use components such as Azure Service Bus, which natively handle message TTL, they will not receive expired messages. No extra logic is needed.