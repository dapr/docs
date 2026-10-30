---
type: docs
title: "Observability Configuration"
linkTitle: "Observability"
weight: 20
description: "Configure OpenTelemetry observability for DurableAgent"
---

Dapr Agents uses `AgentObservabilityConfig` to configure OpenTelemetry logging and tracing for a `DurableAgent`.

## Configuration

The table describes the available observability options.

| Field | Type | Default | Description |
|---|---|---:|---|
| `enabled` | `bool \| None` | `None` | Enables or disables observability for the agent. When `OTEL_SDK_DISABLED` is set to `true`, observability is disabled. |
| `headers` | `dict[str, str]` | `{}` | Headers included in requests to the selected exporter. |
| `auth_token` | `str \| None` | `None` | Authentication token used when exporting telemetry. The runtime configuration value is applied to `auth_token`; the environment value populates `headers`. |
| `endpoint` | `str \| None` | `None` | Base endpoint for the selected telemetry exporter. Required for non-console exporters; console exporters do not require an endpoint. |
| `service_name` | `str \| None` | `None` | Sets the service name included in exported telemetry. |
| `logging_enabled` | `bool \| None` | `None` | Enables export of agent logs. |
| `logging_exporter` | `AgentLoggingExporter \| None` | `None` | Exporter used to export agent logs: `console`, `otlp_grpc`, or `otlp_http`. |
| `tracing_enabled` | `bool \| None` | `None` | Enables export of agent traces. |
| `tracing_exporter` | `AgentTracingExporter \| None` | `None` | Exporter used to export agent traces: `otlp_grpc`, `otlp_http`, `zipkin`, or `console`. |

Use the endpoint format expected by the selected exporter, for example `http://otel-collector:4317` for OTLP gRPC, `http://otel-collector:4318` for OTLP HTTP, or `http://zipkin:9411` for Zipkin. Dapr Agents appends `/v1/logs`, `/v1/traces`, or `/api/v2/spans` when those paths are not already present.

## Configuration sources

Configuration sources are resolved in descending order of priority: instantiation values, environment variables, and state store runtime configuration.

### Source support

| Field | Instantiation | Environment | Runtime configuration |
|---|---|---|---|
| `enabled` | Y | Y | Y |
| `headers` | Y | Y | N |
| `auth_token` | Y | N | Y |
| `endpoint` | Y | Y | Y |
| `service_name` | Y | Y | Y |
| `logging_enabled` | Y | Y | Y |
| `logging_exporter` | Y | Y | Y |
| `tracing_enabled` | Y | Y | Y |
| `tracing_exporter` | Y | Y | Y |

Environment variables support canonical `SCREAMING_SNAKE_CASE` names and lowercase `snake_case` equivalents. When both forms are present, the uppercase name takes precedence.

### Environment variables

| Field | Canonical environment variable |
|---|---|
| `enabled` | `OTEL_SDK_DISABLED` |
| `headers` | `OTEL_EXPORTER_OTLP_HEADERS` |
| `endpoint` | `OTEL_EXPORTER_OTLP_ENDPOINT` |
| `service_name` | `OTEL_SERVICE_NAME` |
| `logging_enabled` | `OTEL_LOGGING_ENABLED` |
| `logging_exporter` | `OTEL_LOGS_EXPORTER` |
| `tracing_enabled` | `OTEL_TRACING_ENABLED` |
| `tracing_exporter` | `OTEL_TRACES_EXPORTER` |

Runtime configuration supports `SCREAMING_SNAKE_CASE`, `snake_case`, and `kebab-case` keys, in that order of priority. Runtime values use the corresponding OpenTelemetry environment-variable names as configuration keys.

## Hot reload

When runtime configuration is enabled, changes to `enabled`, `auth_token`, `endpoint`, `service_name`, `logging_enabled`, `logging_exporter`, `tracing_enabled`, and `tracing_exporter` are applied without restarting the agent. The `headers` field is not hot-reloadable. Invalid hot-reload values are logged and ignored.

## Validation and resolution behavior

- Values provided during instantiation are validated strictly. Invalid values raise an error.
- Invalid environment-variable and runtime values are logged and ignored, including invalid values received during hot reload.
- OpenTelemetry boolean values (`OTEL_SDK_DISABLED`, `OTEL_LOGGING_ENABLED`, and `OTEL_TRACING_ENABLED`) accept only case-insensitive `true` and `false` strings from environment and runtime configuration, as defined by the [OpenTelemetry environment variable specification](https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/#boolean). Native booleans are also accepted during instantiation. Other aliases, such as `1`, `0`, `yes`, and `no`, are ignored or rejected according to their source.
- Exporter values are case-insensitive across supported sources.
- Empty or whitespace-only `auth_token`, `endpoint`, and `service_name` values are treated as unset during instantiation and ignored from environment or runtime configuration.

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
