---
type: docs
title: "Using Dynatrace OpenTelemetry Collector to collect traces to send to Dynatrace"
linkTitle: "Using the Dynatrace OpenTelemetry Collector"
weight: 1000
description: "How to push trace events to Dynatrace, using the Dynatrace OpenTelemetry Collector."
---

Dapr integrates with the [Dynatrace Collector](https://docs.dynatrace.com/docs/ingest-from/opentelemetry/collector) using the OpenTelemetry protocol (OTLP). This guide walks through an example using Dapr to push traces to Dynatrace, using the Dynatrace version of the OpenTelemetry Collector.

{{% alert title="Note" color="primary" %}}
This guide refers to the Dynatrace OpenTelemetry Collector, which uses the same Helm chart as the open-source collector but overridden with the Dynatrace-maintained image for better support and Dynatrace-specific features.
{{% /alert %}}

## Prerequisites

- [Install Dapr on Kubernetes]({{< ref kubernetes >}})
- Access to a Dynatrace tenant and an API token with `openTelemetryTrace.ingest`, `metrics.ingest`, and `logs.ingest` scopes
- Helm 

## Set up Dynatrace OpenTelemetry Collector to push to your Dynatrace instance

To push traces to your Dynatrace instance, install the Dynatrace OpenTelemetry Collector on your Kubernetes cluster.

1. Create a Kubernetes secret with your Dynatrace credentials:

    ```sh
    kubectl create secret generic dynatrace-otelcol-dt-api-credentials \
      --from-literal=DT_ENDPOINT=https://YOUR_TENANT.live.dynatrace.com/api/v2/otlp \
      --from-literal=DT_API_TOKEN=dt0s01.YOUR_TOKEN_HERE
    ```

    Replace `YOUR_TENANT` with your Dynatrace tenant ID and `YOUR_TOKEN_HERE` with your Dynatrace API token.

1. Use the Dynatrace OpenTelemetry Collector distribution for better defaults and support than the open source version. Download and inspect the [`collector-helm-values.yaml`](https://github.com/Dynatrace/dynatrace-otel-collector/blob/main/config_examples/collector-helm-values.yaml) file. This is based on the [k8s enrichment demo](https://docs.dynatrace.com/docs/ingest-from/opentelemetry/collector/use-cases/kubernetes/k8s-enrich#demo-configuration) and includes Kubernetes metadata enrichment for proper pod/namespace/cluster context.


1. Deploy the Dynatrace Collector with Helm.

    ```sh
    helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
    helm repo update
    helm upgrade -i dynatrace-collector open-telemetry/opentelemetry-collector -f collector-helm-values.yaml
    ```

## Set up Dapr to send traces to the Dynatrace Collector

Create a Dapr configuration file to enable tracing and send traces to the OpenTelemetry Collector via [OTLP](https://opentelemetry.io/docs/specs/otel/protocol/).


1. Update the following file to ensure the `endpointAddress` points to your Dynatrace OpenTelemetry Collector service in your Kubernetes cluster. If deployed in the `default` namespace, it's typically `dynatrace-collector.default.svc.cluster.local`.  

    **Important:** Ensure the `endpointAddress` does NOT include the `http://` prefix to avoid URL encoding issues:

    ```yaml
     apiVersion: dapr.io/v1alpha1
     kind: Configuration
     metadata:
       name: tracing
     spec:
       tracing:
         samplingRate: "1"
         otel:
           endpointAddress: "dynatrace-collector.default.svc.cluster.local:4318" # Update with your collector's service address
    ```

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

Deploy and run some applications. After a few minutes, you should see traces appearing in your Dynatrace tenant:

1. Navigate to **Search > Distributed tracing** in your Dynatrace UI.
2. Filter by service names to see your Dapr applications and their associated tracing spans.

<img src="/images/open-telemetry-collector-dynatrace-traces.png" width=1200 alt="Dynatrace showing tracing data.">

{{% alert title="Note" color="primary" %}}
Only operations going through Dapr API exposed by Dapr sidecar (for example, service invocation or event publishing) are displayed in Dynatrace distributed traces.
{{% /alert %}}


{{% alert title="Disable OneAgent daprd monitoring" color="warning" %}}
If you are running Dynatrace OneAgent in your cluster, you should exclude the `daprd` sidecar container from OneAgent monitoring to prevent interferences in this configuration. Excluding it prevents any automatic injection attempts that could break functionality or result in confusing traces.


Add this annotation to your application deployments or globally in your dynakube configuration file:

```yaml
metadata:
  annotations:
    dapr.io/enabled: "true"
    dapr.io/app-id: "MyApp"
    dapr.io/app-port: "8080"
    dapr.io/config: "tracing"
    container.inject.dynatrace.com/daprd: "false" # Exclude dapr sidecar from being auto-monitored by OneAgent

```
{{% /alert %}}

## Related links
- Try out the [observability quickstart](https://github.com/dapr/quickstarts/tree/master/tutorials/observability/README.md)
- Learn how to set [tracing configuration options]({{< ref "configuration-overview.md#tracing" >}})
- [Dynatrace OpenTelemetry documentation](https://docs.dynatrace.com/docs/ingest-from/opentelemetry)
- Enrich OTLP telemetry data [with Kubernetes metadata
](https://docs.dynatrace.com/docs/ingest-from/opentelemetry/collector/use-cases/kubernetes/k8s-enrich)
