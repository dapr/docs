---
type: docs
title: "Preview features"
linkTitle: "Preview features"
weight: 4000
description: "List of current preview features"
---
Preview features in Dapr are considered experimental when they are first released. These preview features require explicit opt-in in order to be used. The opt-in is specified in Dapr's configuration. See [How-To: Enable preview features]({{<ref preview-features>}}) for information more information.


## Current preview features
| Feature | Description | Setting | Documentation |
| ---------- |-------------|---------|---------------|
| **Partition actor reminders** | Allows actor reminders to be partitioned across multiple keys in the underlying statestore in order to improve scale and performance. | `Actor.TypeMetadata` | [How-To: Partition Actor Reminders]({{< ref "howto-actors.md#partitioning-reminders" >}}) |
| **Pub/Sub routing** | Allow the use of expressions to route cloud events to different URIs/paths and event handlers in your application. | `PubSub.Routing` | [How-To: Publish a message and subscribe to a topic]({{<ref howto-route-messages>}}) |
| **ARM64 Mac Support** | Dapr CLI, sidecar, and Dashboard are now natively compiled for ARM64 Macs, along with Dapr CLI installation via Homebrew. | N/A | [Install the Dapr CLI]({{<ref install-dapr-cli>}}) |
| **Resiliency** | Allows configuring of fine-grained policies for retries, timeouts and circuitbreaking. | `Resiliency` | [Configure Resiliency Policies]({{<ref "resiliency-overview">}}) | 