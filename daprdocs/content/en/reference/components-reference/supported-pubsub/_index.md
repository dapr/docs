---
type: docs
title: "Pub/sub brokers component specs"
linkTitle: "Pub/sub brokers"
weight: 1000
description: The supported pub/sub brokers that interface with Dapr
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/"
no_list: true
---

The following table lists publish and subscribe brokers supported by the Dapr pub/sub building block. [Learn how to set up different brokers for Dapr publish and subscribe.]({{< ref setup-pubsub.md >}})

{{% alert title="Pub/sub component retries vs inbound resiliency" color="warning" %}}
Each pub/sub component has its own built-in retry behaviors. Before explicity applying a [Dapr resiliency policy]({{< ref "policies.md" >}}), make sure you understand the implicit retry policy of the pub/sub component you're using. Instead of overriding these built-in retries, Dapr resiliency augments them, which can cause repetitive clustering of messages.
{{% /alert %}}


{{< partial "components/description.html" >}}

{{< partial "components/pubsub.html" >}}
