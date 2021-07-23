---
type: docs
title: "Preview features"
linkTitle: "Preview features"
weight: 4000
description: "List of current preview features"
---
Preview features in Dapr are considered experimental when they are first released. These preview features require explicit opt-in in order to be used. The opt-in is specified in Dapr's configuration. See [How-To: Enable preview features]({{<ref preview-features>}}) for information more information.


## Current preview features
| Description | Setting | Documentation |
|-------------|---------|---------------|
| Preview feature that enables Actors to be called multiple times in the same call chain allowing call backs between actors. | Actor.Reentrancy | [Actor reentrancy]({{<ref actor-reentrancy>}}) |
| Preview feature that allows Actor reminders to be partitioned across multiple keys in the underlying statestore in order to improve scale and performance. | Actor.TypeMetadata | [How-To: Partition Actor Reminders]({{< ref "howto-actors.md#partitioning-reminders" >}}) |
| Preview feature that enables you to call endpoints using service invocation on gRPC services through Dapr via gRPC proxying, without requiring the use of Dapr SDKs. | proxy.grpc | [How-To: Invoke services using gRPC]({{<ref howto-invoke-services-grpc>}}) |
