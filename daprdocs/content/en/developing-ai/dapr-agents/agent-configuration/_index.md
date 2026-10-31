---
type: docs
title: "Agent Configuration"
linkTitle: "Agent Configuration"
weight: 45
description: "Configure Dapr Agents execution, observability, and runtime behavior"
---

Dapr Agents provides configuration options for controlling agent execution, integrating with Dapr components, and exporting observability data.

Dapr Agents supports multiple ways to configure a `DurableAgent`:

1. **In code:** Configure options via typed Python configuration objects.
2. **From external configuration:** For supported options, Dapr Agents can automatically resolve values from environment variables or runtime configuration stored in a Dapr state store. With runtime configuration subscriptions enabled, hot-reloadable options can be updated without restarting the agent, enabling zero-downtime configuration changes.

The pages in this section describe the available options, defaults, supported configuration sources, precedence rules, and hot-reload behavior for development and production deployments.
