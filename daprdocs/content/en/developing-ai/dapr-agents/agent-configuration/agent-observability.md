---
type: docs
title: "Observability Configuration"
linkTitle: "Observability"
weight: 20
description: "Configure OpenTelemetry observability for DurableAgent"
---

Dapr Agents uses `AgentObservabilityConfig` to configure OpenTelemetry logging and tracing for a `DurableAgent`.

## Configuration

| Field | Type | Default | Description | Resolution support |
|---|---|---:|---|---|
| `enabled` | `bool \| None` | `None` | Enables or disables agent observability. | Instantiation, environment, runtime store |
| `headers` | `dict[str, str]` | `{}` | Headers sent to observability exporters. | Instantiation, environment |
| `auth_token` | `str \| None` | `None` | Authentication token used for exporter requests. | Instantiation, runtime store |
| `endpoint` | `str \| None` | `None` | OpenTelemetry or Zipkin exporter endpoint. | Instantiation, environment, runtime store |
| `service_name` | `str \| None` | `None` | Service name attached to observability data. | Instantiation, environment, runtime store |
| `logging_enabled` | `bool \| None` | `None` | Enables agent log export. | Instantiation, environment, runtime store |
| `logging_exporter` | `AgentLoggingExporter \| None` | `None` | Log exporter: `console`, `otlp_grpc`, or `otlp_http`. | Instantiation, environment, runtime store |
| `tracing_enabled` | `bool \| None` | `None` | Enables agent trace export. | Instantiation, environment, runtime store |
| `tracing_exporter` | `AgentTracingExporter \| None` | `None` | Trace exporter: `otlp_grpc`, `otlp_http`, `zipkin`, or `console`. | Instantiation, environment, runtime store |

The environment variables used for resolution are:

| Environment variable | Field |
|---|---|
| `OTEL_SDK_DISABLED` | `enabled` (inverted: `true` disables observability) |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `endpoint` |
| `OTEL_EXPORTER_OTLP_HEADERS` | `headers` |
| `OTEL_SERVICE_NAME` | `service_name` |
| `OTEL_LOGGING_ENABLED` | `logging_enabled` |
| `OTEL_LOGS_EXPORTER` | `logging_exporter` |
| `OTEL_TRACING_ENABLED` | `tracing_enabled` |
| `OTEL_TRACES_EXPORTER` | `tracing_exporter` |

Observability resolution uses the following priority, from highest to lowest: values provided when the agent is instantiated, environment variables, and Dapr Configuration Store runtime values. Runtime values use the corresponding OpenTelemetry environment-variable names as configuration keys.

## Usage

Configure OpenTelemetry logging and tracing by passing `AgentObservabilityConfig` to `DurableAgent`:

```python
from dapr_agents import DurableAgent
from dapr_agents.agents.configs import (
    AgentLoggingExporter,
    AgentObservabilityConfig,
    AgentTracingExporter,
)

agent = DurableAgent(
    name="TravelAgent",
    agent_observability=AgentObservabilityConfig(
        enabled=True,
        endpoint="http://otel-collector:4317",
        service_name="travel-agent",
        tracing_enabled=True,
        tracing_exporter=AgentTracingExporter.OTLP_GRPC,
        logging_enabled=True,
        logging_exporter=AgentLoggingExporter.OTLP_GRPC,
    ),
)
```

Use the Dapr sidecar's observability configuration separately when you also need telemetry from Dapr Workflows, state, or pub/sub operations.
