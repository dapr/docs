---
type: docs
title: "Dapr MCP server observability"
linkTitle: "Observability"
weight: 50
description: "Traces, metrics, and logs the Dapr MCP server exports over OpenTelemetry, and its health endpoints"
---

The Dapr MCP server exports traces, metrics, and logs over the OpenTelemetry Protocol (OTLP), and serves health endpoints for probes when it runs over HTTP.

## Turn on telemetry

Telemetry is off until you set an OTLP endpoint. Point the server at an OpenTelemetry Collector, or any backend that accepts OTLP:

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
export OTEL_SERVICE_NAME=dapr-mcp-server
dapr run --app-id dapr-mcp-server --resources-path ./components -- dapr-mcp-server --http localhost:8080
```

An endpoint without a scheme, such as `otel-collector:4317`, uses TLS. Add `OTEL_EXPORTER_OTLP_INSECURE=true` to send plaintext to an endpoint like that, or give the scheme explicitly. To use OTLP over HTTP instead of gRPC, set `OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf` and use the HTTP port, usually `4318`.

All three signals go to the same endpoint unless you override one with its `OTEL_EXPORTER_OTLP_{TRACES,METRICS,LOGS}_*` variables. See the [configuration reference]({{% ref "dapr-mcp-server-configuration.md#telemetry" %}}) for every setting. If the exporters can't be set up, the server logs a warning and keeps running without telemetry.

For a collector to receive the data, see [Using OpenTelemetry Collector]({{% ref otel-collector %}}).

## Traces

The server creates:

- **A server span for each HTTP request**, named after the method and route, for example `POST /`. It continues the caller's trace when the request carries a W3C `traceparent` header.
- **A span for each tool call**, named after the tool, for example `save_state`. It has the attributes `mcp.tool.name`, `mcp.tool.package`, and, where the tool targets a component, `dapr.component.name`, plus details such as the state key or topic. Failed calls are marked with an error status.

The tool span's trace context is passed to the Dapr sidecar with each gRPC call, so spans from the sidecar, and from any app it calls, join the same trace when [Dapr tracing]({{% ref tracing-overview.md %}}) exports to the same backend.

## Metrics

Metrics are exported every 10 seconds by default (`OTEL_METRIC_EXPORT_INTERVAL`). Set `DAPR_MCP_SERVER_METRICS_ENABLED=false` to turn them off while keeping traces.

| Metric | Type | Unit | Description |
|---|---|---|---|
| `dapr-mcp-server.tool.invocations` | Counter | `{invocation}` | Tool calls, by outcome. |
| `dapr-mcp-server.tool.errors` | Counter | `{error}` | Tool calls that failed. |
| `dapr-mcp-server.tool.duration` | Histogram | `ms` | Tool call duration. |
| `dapr-mcp-server.tool.in_progress` | Up-down counter | `{tool}` | Tool calls running now. |
| `dapr-mcp-server.http.requests_total` | Counter | `{request}` | MCP HTTP requests. |
| `dapr-mcp-server.http.request_duration` | Histogram | `ms` | MCP HTTP request duration. Server-sent event streams are counted but not timed, because their duration is the client's session length. |
| `dapr-mcp-server.http.requests_in_flight` | Up-down counter | `{request}` | MCP HTTP requests being handled now. |

Tool metrics carry `tool.name` and `tool.package`. The invocation, error, and duration metrics also carry `dapr.component.type`, which holds the target the call named (a component name, app ID, or actor type), and the invocation and duration metrics carry `outcome` (`success` or `error`). HTTP metrics carry `http.request.method`, `http.response.status_code`, and `http.route`. The HTTP metrics cover MCP requests only, not the health endpoints.

## Logs

The server writes structured JSON logs to stderr, never stdout, so logs can't corrupt the stdio transport. Every record includes the service name and version. Set the level with `DAPR_MCP_SERVER_LOG_LEVEL` (`debug`, `info`, `warn`, or `error`; default `info`).

When an OTLP endpoint is set, the same records are also exported as OpenTelemetry logs, correlated with the active trace. Set `DAPR_MCP_SERVER_LOGS_OTEL_ENABLED=false` to keep logs on stderr only.

At `debug` level the server logs incoming request headers, with `Authorization`, `Cookie`, `X-Api-Key`, and the configured token header redacted. Each successful tool call is logged at `info`, and each failure at `warn`, with its target, such as the store name and key, but never with payloads or secret values.

## Health endpoints

With `--http`, the server serves three endpoints on the same address as MCP. They never require authentication, and each returns JSON with a `status` of `healthy` or `unhealthy` and the server `version`.

| Endpoint | Returns `200` when | Otherwise |
|---|---|---|
| `/livez` | The process is running. | — |
| `/startupz` | Startup has finished: the server connected to the sidecar and registered its tools. | `503` |
| `/readyz` | The server is ready and the Dapr sidecar answers a metadata request within 5 seconds. The response lists each check. | `503` |

```json
{
  "status": "healthy",
  "checks": [
    { "status": "healthy", "component": "dapr", "message": "sidecar connected", "latency": "1.2ms" }
  ],
  "version": "v0.0.1"
}
```

On `SIGTERM` or `SIGINT`, `/readyz` starts returning `503`, open server-sent event streams are closed, and in-flight requests get up to 15 seconds to finish before the server exits.

The `--health-check` flag runs the same liveness check from the command line. It requests `/livez` on the address from `--health-check-addr`, or from `--http`, or `localhost:8080`, and exits with `0` or `1`. The container image uses it as its `HEALTHCHECK`.

Over stdio there is no HTTP listener, so these endpoints aren't available.
