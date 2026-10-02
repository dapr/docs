---
type: docs
title: "Dapr concepts"
linkTitle: "Concepts"
weight: 10
description: "Learn about Dapr including its main features and capabilities"
---

Welcome to the Dapr concepts guide!

Dapr is built around **durable execution**: the guarantee that your code runs to completion despite crashes, restarts, and outages. At its core is a durable, verifiable [workflow engine]({{% ref workflow-overview.md %}}) that orchestrates long-running business processes and powers [durable AI agents]({{% ref "developing-ai" %}}), backed by a set of modular [building blocks]({{% ref building-blocks-concept.md %}}) and pluggable [components]({{% ref components-concept.md %}}) that solve the common challenges of building distributed systems.

This section explains the core ideas behind Dapr, from durable workflows, building blocks, and components to its security model, resiliency, and observability.

{{% alert title="Getting started with Dapr" color="primary" %}}
If you are ready to jump in and start developing with Dapr, please
visit the [getting started section]({{%ref getting-started%}}).
{{< button text="Install Dapr" page="getting-started.md" >}}
{{% /alert %}}