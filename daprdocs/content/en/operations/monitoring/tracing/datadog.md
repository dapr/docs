---
type: docs
title: "How-To: Set up Datadog for distributed tracing"
linkTitle: "Datadog"
weight: 1000
description: "Set up Datadog for distributed tracing"
---

Dapr captures metrics and traces that can be sent directly to Datadog through the OpenTelemetry Collector Datadog exporter.

## Configure Tracing in Dapr with the OpenTelemetry Collector and Datadog

You can configure Dapr to create traces for each application in your Kubernetes cluster and collect those traces in Datadog, using the OpenTelemetry Collector Datadog exporter.

Follow [the Dapr docs for setting up the OpenTelemetry Collector](https://docs.dapr.io/operations/monitoring/tracing/otel-collector/open-telemetry-collector/#setting-opentelemetry-collector) and:

  1. Add your Datadog API key to the `./deploy/opentelemetry-collector-generic-datadog.yaml` file in the `datadog` exporter configuration section:
    ```yaml
      datadog:
        api:
          key: <YOUR_API_KEY>
    ```

  2. Apply the `opentelemetry-collector` configuration by running `kubectl apply -f ./deploy/open-telemetry-collector-generic-datadog.yaml`.

  3. Set up a Dapr configuration file to both turn on tracing and deploy a tracing exporter component that uses the OpenTelemetry Collector, by running `kubectl apply -f ./deploy/collector-config.yaml`.

  4. Apply the `appconfig` configuration by adding a `dapr.io/config` annotation to the container that you want to participate in the distributed tracing: `dapr.io/config: "appconfig"`.

Create and configure the application. When it runs, telemetry data is sent to Datadog and visible in Datadog APM.

## Related Links/References

* [Complete example of setting up Dapr on a Kubernetes cluster](https://github.com/ericmustin/quickstarts/tree/master/hello-kubernetes)
* [Datadog documentation about OpenTelemetry support](https://docs.datadoghq.com/opentelemetry/)
* [Datadog Application Performance Monitoring](https://docs.datadoghq.com/tracing/)