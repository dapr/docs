---
type: docs
title: "Observability Configuration"
linkTitle: "Observability"
weight: 20
description: "Configure OpenTelemetry observability for DurableAgent"
---

Dapr Agents uses `AgentObservabilityConfig` to configure OpenTelemetry logging and tracing for a `DurableAgent`.

## Configuration fields

The **Constructor default** and **Resolved default** columns are defined as follows:

- **Constructor default:** The value used when the configuration object is created without an override.
- **Resolved default:** The value used when no configuration source provides an override.

| Field | Type | Constructor default | Resolved default | Description |
|---|---|---:|---:|---|
| `enabled` | `bool \| None` | `None` | `False` | Enables or disables observability for the agent. `OTEL_SDK_DISABLED` uses inverted semantics: when set to `true`, observability is disabled; when set to `false`, it is enabled. |
| `headers` | `dict[str, str]` | `{}` | `{}` | Headers included in requests to the selected exporter. The `OTEL_EXPORTER_OTLP_HEADERS` environment variable is parsed into this field. |
| `auth_token` | `str \| None` | `None` | `None` | Authentication token used when exporting telemetry. For runtime configuration, `OTEL_EXPORTER_OTLP_HEADERS` maps to this field. |
| `endpoint` | `str \| None` | `None` | `None` | Base endpoint for the selected telemetry exporter. Required for non-console exporters; console exporters do not require an endpoint. |
| `service_name` | `str \| None` | `None` | `None` | Sets the service name included in exported telemetry. |
| `logging_enabled` | `bool \| None` | `None` | `False` | Enables agent log export. |
| `logging_exporter` | `AgentLoggingExporter \| None` | `None` | `AgentLoggingExporter.CONSOLE` | Exporter used for agent logs: `console`, `otlp_grpc`, or `otlp_http`. |
| `tracing_enabled` | `bool \| None` | `None` | `False` | Enables agent trace export. |
| `tracing_exporter` | `AgentTracingExporter \| None` | `None` | `AgentTracingExporter.CONSOLE` | Exporter used for agent traces: `console`, `otlp_grpc`, `otlp_http`, or `zipkin`. |

{{% alert title="Note" color="primary" %}}
For non-console exporters, use the endpoint format expected by the selected exporter. For example, use `http://otel-collector:4317` for OTLP gRPC, `http://otel-collector:4318` for OTLP HTTP, or `http://zipkin:9411` for Zipkin. Dapr Agents appends `/v1/logs` or `/v1/traces` to OTLP HTTP endpoints and `/api/v2/spans` to Zipkin endpoints when missing. OTLP gRPC endpoints are used as provided.
{{% /alert %}}

## Configuration sources

Configuration sources are resolved from highest to lowest priority:

1. Instantiation values
2. Environment variables
3. State store runtime configuration

### Configuration support

| Field | Instantiation | Environment | Runtime configuration | Hot-reloadable |
|---|---|---|---|---|
| `enabled` | Y | Y | Y | Y |
| `headers` | Y | Y | N | N |
| `auth_token` | Y | N | Y | Y |
| `endpoint` | Y | Y | Y | Y |
| `service_name` | Y | Y | Y | Y |
| `logging_enabled` | Y | Y | Y | Y |
| `logging_exporter` | Y | Y | Y | Y |
| `tracing_enabled` | Y | Y | Y | Y |
| `tracing_exporter` | Y | Y | Y | Y |

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

Environment variables support these key-naming conventions, from highest to lowest priority:

1. `SCREAMING_SNAKE_CASE`
2. `snake_case`

### Runtime configuration keys

| Field | Canonical runtime key |
|---|---|
| `enabled` | `OTEL_SDK_DISABLED` |
| `auth_token` | `OTEL_EXPORTER_OTLP_HEADERS` |
| `endpoint` | `OTEL_EXPORTER_OTLP_ENDPOINT` |
| `service_name` | `OTEL_SERVICE_NAME` |
| `logging_enabled` | `OTEL_LOGGING_ENABLED` |
| `logging_exporter` | `OTEL_LOGS_EXPORTER` |
| `tracing_enabled` | `OTEL_TRACING_ENABLED` |
| `tracing_exporter` | `OTEL_TRACES_EXPORTER` |

Runtime configuration supports these key-naming conventions, from highest to lowest priority:

1. `SCREAMING_SNAKE_CASE`
2. `snake_case`
3. `kebab-case`

## Hot reload

Updates to fields marked `Y` in the **Hot-reloadable** column of the [Configuration support](#configuration-support) table can be applied without restarting the agent. To enable this behavior, include the corresponding keys from the [Runtime configuration keys](#runtime-configuration-keys) table in a runtime configuration subscription. Updates to other fields require a restart.

{{% alert title="Warning" color="warning" %}}
Hot-reload configuration continues to support legacy key-naming conventions, such as `Otel_Logging_Enabled`, `Otel-Logging-Enabled`, and `OTEL-LOGGING-ENABLED`, for backward compatibility. These conventions are deprecated and may be removed in a future release. For new configuration, use one of the supported naming conventions in the [Runtime configuration keys](#runtime-configuration-keys) section.
{{% /alert %}}

## Validation and resolution behavior

The following validation rules apply to the fields supported by each configuration source:

| Rule | Instantiation | Environment | Runtime configuration and hot reload |
|---|---|---|---|
| Invalid value | Raises an error | Logged and ignored | Logged and ignored |
| OpenTelemetry boolean values | Native booleans or case-insensitive `true`/`false` | Case-insensitive `true`/`false` only | Case-insensitive `true`/`false` only |
| Logging and tracing exporter names | Case-insensitive | Case-insensitive | Case-insensitive |
| Empty or whitespace-only `auth_token`, `endpoint`, and `service_name` values | Treated as unset | Ignored | Ignored |

The following OpenTelemetry boolean keys are used for both environment variables and runtime configuration: `OTEL_SDK_DISABLED`, `OTEL_LOGGING_ENABLED`, and `OTEL_TRACING_ENABLED`.

For OpenTelemetry boolean keys, environment variables and runtime configuration accept only case-insensitive `true` and `false` strings, following the [OpenTelemetry environment variable specification](https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/#boolean). Native booleans are accepted during instantiation. Values such as `1`, `0`, `yes`, and `no` are invalid: during instantiation, they raise an error; when provided through environment variables or runtime configuration, they are logged and ignored.

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
