---
type: docs
title: "Using OpenTelemetry Collector to collect traces"
linkTitle: "Using the OpenTelemetry Collector"
weight: 900
description: "How to use Dapr to push trace events through the OpenTelemetry Collector."
---

Dapr will be exporting trace in the OpenTelemetry format when OpenTelemetry is GA. In the mean time, traces can be exported using the Zipkin format. Combining with the [OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector) you can still send trace to many popular tracing backends (like Azure AppInsights, AWS X-Ray, StackDriver, etc).

![Using OpenTelemetry Collect to integrate with many backend](/images/open-telemetry-collector.png)

## Requirements

1. A installation of Dapr on Kubernetes.

2. You are already setting up your trace backends  to receive traces.

3. Check OpenTelemetry Collector exporters [here](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter) and [here](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter) to see if your trace backend is supported by the OpenTelemetry Collector. On those linked pages, find the exporter you want to use and read its doc to find out the parameters required.

## Setting OpenTelemetry Collector

### Run OpenTelemetry Collector to push to your trace backend


1. Check out the file [open-telemetry-collector-generic.yaml](/docs/open-telemetry-collector/open-telemetry-collector-generic.yaml) and replace the section marked with `<your-exporter-here>` with the correct settings for your trace exporter. Again, refer to the OpenTelemetry Collector links in the Prerequisites section to determine the correct settings.

2. Apply the configuration with `kubectl apply -f open-telemetry-collector-generic.yaml`.

## Set up Dapr to send trace to OpenTelemetry Collector

### Turn on tracing in Dapr
Next, set up both a Dapr configuration file to turn on tracing and deploy a tracing exporter component that uses the OpenTelemetry Collector.

1. Create a collector-config.yaml file with this [content](/docs/open-telemetry-collector/collector-config.yaml)

2. Apply the configuration with `kubectl apply -f collector-config.yaml`.

### Deploy your app with tracing

When running in Kubernetes mode, apply the `appconfig` configuration by adding a `dapr.io/config` annotation to the container that you want to participate in the distributed tracing, as shown in the following example:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  ...
spec:
  ...
  template:
    metadata:
      ...
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "MyApp"
        dapr.io/app-port: "8080"
        dapr.io/config: "appconfig"
```

Some of the tutorials such as [distributed calculator](https://github.com/dapr/quickstarts/tree/master/tutorials/distributed-calculator) already configure these settings, so if you are using those no additional settings are needed.

That's it! There's no need include any SDKs or instrument your application code. Dapr automatically handles the distributed tracing for you.

> **NOTE**: You can register multiple tracing exporters at the same time, and the tracing logs are forwarded to all registered exporters.

Deploy and run some applications. Wait for the trace to propagate to your tracing backend and view them there.

## Related links
* Try out the [observability tutorial]https://github.com/dapr/quickstarts/tree/master/tutorials/observability)
* How to set [tracing configuration options]({{< ref "configuration-overview.md#tracing" >}})

