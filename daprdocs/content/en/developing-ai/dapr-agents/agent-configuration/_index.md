---
type: docs
title: "Agent Configuration"
linkTitle: "Agent Configuration"
weight: 45
description: "Configure Dapr Agents execution, observability, and runtime behavior"
---

Dapr Agents provides configuration options for controlling agent execution, integrating with Dapr components, and exporting observability data.

Configure a `DurableAgent` through one or more of the following methods:

1. **In code:** Configure options via typed Python configuration objects.
2. **From external configuration:** For supported options, Dapr Agents can automatically resolve values from environment variables or state store runtime configuration. With runtime configuration subscriptions enabled, changes to hot-reloadable options can also be applied without restarting the agent.

The pages in this section describe the available options, defaults, supported configuration sources, precedence rules, and hot-reload behavior for development and production deployments.
