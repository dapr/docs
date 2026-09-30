---
type: docs
title: "Configuration"
linkTitle: "Configuration"
weight: 45
description: "Configure DurableAgent execution and observability"
---

Configure `DurableAgent` behavior and observability with the configuration objects described in this section.

- [Execution configuration](execution.md) controls iterations, tool execution, streaming, and related runtime behavior.
- [Observability configuration](observability.md) controls OpenTelemetry logging and tracing.

## Configuration resolution

Configuration sources are resolved in the following order:

- **Execution:** Dapr Configuration Store runtime values, then values provided when the agent is instantiated, then environment variables.
- **Observability:** Values provided when the agent is instantiated, then environment variables, then Dapr Configuration Store runtime values.

Each configuration page identifies which fields support each source.
