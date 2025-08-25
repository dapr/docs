---
type: docs
title: "Using OpenTelemetry Collector to collect traces to send to App Insights"
linkTitle: "Using the OpenTelemetry for Azure App Insights"
weight: 1000
description: "How to push trace events to Azure Application Insights, using the OpenTelemetry Collector."
---

Dapr integrates with [OpenTelemetry (OTEL) Collector](https://github.com/open-telemetry/opentelemetry-collector) using the OpenTelemetry protocol (OTLP). This guide walks through an example using Dapr to push traces to Azure Application Insights, using the OpenTelemetry Collector.

## Prerequisites

- [Install Dapr on Kubernetes]({{% ref kubernetes %}})
- [Create an Application Insights resource](https://learn.microsoft.com/azure/azure-monitor/app/create-workspace-resource) and make note of your Application Insights connection string.

## Set up OTEL Collector to push to your App Insights instance

To push traces to your Application Insights instance, install the OpenTelemetry Collector on your Kubernetes cluster.

1. Download and inspect the [`open-telemetry-collector-appinsights.yaml`](/docs/open-telemetry-collector/open-telemetry-collector-appinsights.yaml) file.

1. Replace the `<CONNECTION_STRING>` placeholder with your App Insights connection string.

1. Deploy the OpenTelemetry Collector into the same namespace where your Dapr-enabled applications are running:

   ```sh
   kubectl apply -f open-telemetry-collector-appinsights.yaml
   ```

## Set up Dapr to send traces to the OpenTelemetry Collector

Create a Dapr configuration file to enable tracing and send traces to the OpenTelemetry Collector via [OTLP](https://opentelemetry.io/docs/specs/otel/protocol/).

1. Download and inspect the [`collector-config-otel.yaml`](/docs/open-telemetry-collector/collector-config-otel.yaml). Update the `namespace` and `otel.endpointAddress` values to align with the namespace where your Dapr-enabled applications and OpenTelemetry Collector are deployed.

1. Apply the configuration with:

   ```sh
   kubectl apply -f collector-config-otel.yaml
   ```

## Deploy your app with tracing

Apply the `tracing` configuration by adding a `dapr.io/config` annotation to the Dapr applications that you want to include in distributed tracing, as shown in the following example:

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
        dapr.io/config: "tracing"
```

{{% alert title="Note" color="primary" %}}
If you are using one of the Dapr tutorials, such as [distributed calculator](https://github.com/dapr/quickstarts/tree/master/tutorials/distributed-calculator), you will need to update the `appconfig` configuration to `tracing`.
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
- Learn how to set [tracing configuration options]({{% ref "configuration-overview.md#tracing" %}})
