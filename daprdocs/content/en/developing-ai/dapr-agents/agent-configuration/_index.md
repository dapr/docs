---
type: docs
title: "Agent Configuration"
linkTitle: "Agent Configuration"
weight: 45
description: "Configure Dapr Agents behavior, runtime, and infrastructure"
---

Dapr Agents provides configuration options for controlling agent execution, integrating with Dapr components, and exporting observability data.

Configure Dapr Agents through one or more of the following methods:

1. **In code:** Configure options with typed Python objects when creating a `DurableAgent`.
2. **From external configuration:** For supported options, Dapr Agents can automatically resolve values from environment variables or runtime values stored in a Dapr Configuration Store. When runtime configuration is enabled, changes to these fields can be applied without restarting the agent.

The pages in this section describe the available options, defaults, supported configuration sources, precedence rules, and hot reload behavior for local development and production deployments.
