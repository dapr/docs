---
type: docs
title: "Using OpenTelemetry Collector to collect traces to send to App Insights"
linkTitle: "Using the OpenTelemetry for Azure App Insights"
weight: 1000
description: "How to push trace events to Azure Application Insights, using the OpenTelemetry Collector."
---

Dapr integrates with [OpenTelemetry (OTEL) Collector](https://github.com/open-telemetry/opentelemetry-collector) using the Zipkin API. This guide walks through an example using Dapr to push trace events to Azure Application Insights, using the OpenTelemetry Collector.

## Prerequisites

- [Install Dapr on Kubernetes]({{< ref kubernetes >}})
- [Set up an App Insights resource](https://docs.microsoft.com/azure/azure-monitor/app/create-new-resource) and make note of your App Insights instrumentation key.

## Set up OTEL Collector to push to your App Insights instance

To push events to your App Insights instance, install the OTEL Collector to your Kubernetes cluster.

1. Check out the [`open-telemetry-collector-appinsights.yaml`](/docs/open-telemetry-collector/open-telemetry-collector-appinsights.yaml) file. 

1. Replace the `<INSTRUMENTATION-KEY>` placeholder with your App Insights instrumentation key.

1. Apply the configuration with: 

   ```sh 
   kubectl apply -f open-telemetry-collector-appinsights.yaml
   ```

## Set up Dapr to send trace to OTEL Collector

Set up a Dapr configuration file to turn on tracing and deploy a tracing exporter component that uses the OpenTelemetry Collector.

1. Use this [`collector-config.yaml`](/docs/open-telemetry-collector/collector-config.yaml) file to create your own configuration.

1. Apply the configuration with: 

   ```sh
   kubectl apply -f collector-config.yaml
   ```

## Deploy your app with tracing

Apply the `appconfig` configuration by adding a `dapr.io/config` annotation to the container that you want to participate in the distributed tracing, as shown in the following example:

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

{{% alert title="Note" color="primary" %}}
If you are using one of the Dapr tutorials, such as [distributed calculator](https://github.com/dapr/quickstarts/tree/master/tutorials/distributed-calculator), the `appconfig` configuration is already configured, so no additional settings are needed.
{{% /alert %}}

You can register multiple tracing exporters at the same time, and the tracing logs are forwarded to all registered exporters.

That's it! There's no need to include any SDKs or instrument your application code. Dapr automatically handles the distributed tracing for you.

## View traces 

Deploy and run some applications. After a few minutes, you should see tracing logs appearing in your App Insights resource. You can also use the **Application Map** to examine the topology of your services, as shown below:

![Application map](/images/open-telemetry-app-insights.png)

{{% alert title="Note" color="primary" %}}
Only operations going through Dapr API exposed by Dapr sidecar (for example, service invocation or event publishing) are displayed in Application Map topology.
{{% /alert %}}

## Related links
- Try out the [observability quickstart](https://github.com/dapr/quickstarts/tree/master/tutorials/observability/README.md)
- Learn how to set [tracing configuration options]({{< ref "configuration-overview.md#tracing" >}})
