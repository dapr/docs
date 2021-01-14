---
type: docs
title: "Message Time-To-Live"
linkTitle: "Message TTL"
weight: 6000
description: "Use time-to-live in Pub/Sub messages." 
---

## Introduction

Dapr enables per message time-to-live for all Pub/Sub components. It means that applications can set time-to-live per message and subscribers will not receive those messages after expiration.

In Kafka, time-to-live is configured in the topic via `retention.ms` as per [documentation](https://kafka.apache.org/documentation/#topicconfigs_retention.ms). With message time-to-live in Dapr, applications using Kafka can now set time-to-live per message too, since Dapr will handle the expiration.

On the other hand, Azure Service Bus supports [entity level time-to-live]((https://docs.microsoft.com/en-us/azure/service-bus-messaging/message-expiration)). It means that messages have a default time-to-live but can also be set with a shorter timespan at publishing time. Dapr will propagate the time-to-live metadata for the message and let Azure Service Bus handle expiration directly. This is referred as "native support" for message TTL.

### Pub/Sub components with message TTL

* All, some are implemented natively.

### Subscribers outside Dapr

If messages are consumed by subscribers without Dapr, expired messages are not automatically dropped. Still, subscribers can programatically drop expired messages by adding logic to handle the `expiration` attribute in the cloud event.

> The `expiration` attribute follows the [RFC3339](https://tools.ietf.org/html/rfc3339) format.

## Native support for message TTL

When Message Time-To-Live has native support in the component, Dapr will simply forward the time-to-live configuration without adding extra logic, keeping predictable behavior. This is helpful when the expired messages are handled differently by the component - like in Azure Service Bus, where expired messages are stored in the dead letter queue and not simply deleted.

### Pub/Sub components with native support for message TTL

* Azure Service Bus

### Subscribers outside Dapr

In this case, subscribers via Dapr or outside Dapr will not receive expired messages. No extra logic is needed.