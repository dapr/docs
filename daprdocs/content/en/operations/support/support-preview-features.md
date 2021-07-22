---
type: docs
title: "Supported preview features"
linkTitle: "Supported preview features"
weight: 4000
description: "Dapr's supported preview features"
---

## Currently supported preview features
| Description | Setting | Documentation |
|-------------|---------|---------------|
| Preview feature that allows Actors to be called multiple times in the same call chain. | Actor.Reentrancy | [Actor reentrancy]({{<ref actor-reentrancy>}}) |
| Preview feature that allows Actor reminders to be partitioned across multiple keys in the underlying statestore. | Actor.TypeMetadata | TODO: Real link |
| Preview feature that allows you to connect existing gRPC services through Dapr via gRPC proxying. | proxy.grpc | [How-To: Invoke services using gRPC]({{<ref howto-invoke-services-grpc>}}) |
