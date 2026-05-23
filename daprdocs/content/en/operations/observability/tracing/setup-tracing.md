---
type: docs
title: "Configure Dapr to send distributed tracing data"
linkTitle: "Configure tracing"
weight: 30
description: "Set up Dapr to send distributed tracing data"
---

{{% alert title="Note" color="primary" %}}
It is recommended to run Dapr with tracing enabled for any production scenario. You can configure Dapr to send tracing and telemetry data to many observability tools based on your environment, whether it is running in the cloud or on-premises.
{{% /alert %}}


## Configuration

The `tracing` section under the `Configuration` spec contains the following properties:

```yml
spec:
  tracing:
    samplingRate: "1"
    otel: 
      endpointAddress: "myendpoint.cluster.local:4317"
      headers:
        - name: "x-api-key"
          secretKeyRef:
            name: "my-secret-store"
            key: "otel-api-key"
      timeout: "30s"
    zipkin:
      endpointAddress: "https://..."
    
```

The following table lists the properties for tracing:

| Property     | Type   | Description |
|--------------|--------|-------------|
| `samplingRate` | string | Set sampling rate for tracing to be enabled or disabled.
| `stdout` | bool | True write more verbose information to the traces
| `otel.endpointAddress` | string | Set the Open Telemetry (OTEL) target hostname and optionally port. If this is used, you do not need to specify the 'zipkin' section.
| `otel.isSecure` | bool | Is the connection to the endpoint address encrypted.
| `otel.protocol` | string | Set to `http` or `grpc` protocol.
| `otel.headers` | array | Headers to include in OTLP exporter requests. Each entry has a `name` and either a plaintext `value` or a `secretKeyRef` to reference a Kubernetes secret.
| `otel.timeout` | string | Timeout for OTLP exporter requests (for example `30s`, `5m`).
| `zipkin.endpointAddress` | string | Set the Zipkin server URL. If this is used, you do not need to specify the `otel` section.

To enable tracing, use a configuration file (in self hosted mode) or a Kubernetes configuration object (in Kubernetes mode). For example, the following configuration object changes the sample rate to 1 (every span is sampled), and sends trace using OTEL protocol to the OTEL server at localhost:4317

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: tracing
spec:
  tracing:
    samplingRate: "1"
    otel:
      endpointAddress: "localhost:4317"
      isSecure: false
      protocol: grpc
      headers:
        - name: "x-api-key"
          value: "my-api-key"
        - name: "x-secret-header"
          secretKeyRef:
            name: "my-secret"
            key: "header-value"
      timeout: "30s"
```

## Sampling rate

Dapr uses probabilistic sampling. The sample rate defines the probability a tracing span will be sampled and can have a value between 0 and 1 (inclusive). The default sample rate is 0.0001 (i.e. 1 in 10,000 spans is sampled).

Changing `samplingRate` to 0 disables tracing altogether.

## Environment variables

The OpenTelemetry (otel) endpoint can also be configured via an environment variables. The presence of the OTEL_EXPORTER_OTLP_ENDPOINT environment variable
turns on tracing for the sidecar.

| Environment Variable | Description |
|----------------------|-------------|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Sets the Open Telemetry (OTEL) server hostname and optionally port, turns on tracing |
| `OTEL_EXPORTER_OTLP_INSECURE` | Sets the connection to the endpoint as unencrypted (true/false) |
| `OTEL_EXPORTER_OTLP_PROTOCOL` | Transport protocol (`grpc`, `http/protobuf`, `http/json`) |
| `OTEL_EXPORTER_OTLP_TRACES_HEADERS` | Comma-separated list of `key=value` headers for the OTLP traces exporter |
| `OTEL_EXPORTER_OTLP_TRACES_TIMEOUT` | Timeout in milliseconds for the OTLP traces exporter (for example `30000`) |

## Next steps

Learn how to set up tracing with one of the following tools:
- [OTEL Collector]({{% ref otel-collector %}})
- [New Relic]({{% ref newrelic.md %}})
- [Jaeger]({{% ref open-telemetry-collector-jaeger.md %}})
- [Zipkin]({{% ref zipkin.md %}})
- [Datadog]({{% ref datadog.md %}})
- [Dash0]({{% ref dash0.md %}})
