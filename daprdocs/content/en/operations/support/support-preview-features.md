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
| **Actor reentrancy** | Enables actors to be called multiple times in the same call chain allowing call backs between actors. | `Actor.Reentrancy` | [Actor reentrancy]({{<ref actor-reentrancy>}}) |
| **Partition actor reminders** | Allows actor reminders to be partitioned across multiple keys in the underlying statestore in order to improve scale and performance. | `Actor.TypeMetadata` | [How-To: Partition Actor Reminders]({{< ref "howto-actors.md#partitioning-reminders" >}}) |
| **State store encryption** | Enables automatic client side encryption for state stores | `State.Encryption` | [How-To: Encrypt application state]({{<ref howto-encrypt-state>}}) |
| **Pub/Sub routing** | Allow the use of expressions to route cloud events to different URIs/paths and event handlers in your application. | `PubSub.Routing` | [How-To: Publish a message and subscribe to a topic]({{<ref howto-route-messages>}}) |
| **ARM64 Mac Support** | Dapr CLI, sidecar, and Dashboard are now natively compiled for ARM64 Macs, along with Dapr CLI installation via Homebrew. | N/A | [Install the Dapr CLI]({{<ref install-dapr-cli>}}) |