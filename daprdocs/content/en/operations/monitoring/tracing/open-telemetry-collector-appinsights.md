---
type: docs
title: "Using OpenTelemetry Collector to collect traces to send to AppInsights"
linkTitle: "Using the OpenTelemetry for Azure AppInsights"
weight: 1000
description: "How to push trace events to Azure Application Insights, using the OpenTelemetry Collector."
---

Dapr integrates with [OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector) using the Zipkin API. This guide walks through an example using Dapr to push trace events to Azure Application Insights, using the OpenTelemetry Collector.

## Requirements

A installation of Dapr on Kubernetes.

## How to configure distributed tracing with Application Insights

### Setup Application Insights

1. First, you'll need an Azure account. See instructions [here](https://azure.microsoft.com/free/) to apply for a **free** Azure account.
2. Follow instructions [here](https://docs.microsoft.com/en-us/azure/azure-monitor/app/create-new-resource) to create a new Application Insights resource.
3. Get the Application Insights Intrumentation key from your Application Insights page.

### Run OpenTelemetry Collector to push to your Application Insights instance

Install the OpenTelemetry Collector to your Kubernetes cluster to push events to your Application Insights instance

1. Check out the file [open-telemetry-collector-appinsights.yaml](/docs/open-telemetry-collector/open-telemetry-collector-appinsights.yaml) and replace the `<INSTRUMENTATION-KEY>` placeholder with your Application Insights Instrumentation Key.

2. Apply the configuration with `kubectl apply -f open-telemetry-collector-appinsights.yaml`.

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

Deploy and run some applications. After a few minutes, you should see tracing logs appearing in your Application Insights resource. You can also use the **Application Map** to examine the topology of your services, as shown below:

![Application map](/images/open-telemetry-app-insights.png)

> **NOTE**: Only operations going through Dapr API exposed by Dapr sidecar (e.g. service invocation or event publishing) are displayed in Application Map topology.

## Related links
* Try out the [observability quickstart](https://github.com/dapr/quickstarts/tree/master/tutorials/observability)
* How to set [tracing configuration options]({{< ref "configuration-overview.md#tracing" >}})
