---
type: docs
title: "How-To: Set up Datadog for distributed tracing"
linkTitle: "Datadog"
weight: 5000
description: "Set up Datadog for distributed tracing"
---

Dapr captures metrics and traces that can be sent directly to Datadog through the OpenTelemetry Collector Datadog exporter.

## Configure Dapr tracing with the OpenTelemetry Collector and Datadog

Using the OpenTelemetry Collector Datadog exporter, you can configure Dapr to create traces for each application in your Kubernetes cluster and collect them in Datadog.

> Before you begin, [set up the OpenTelemetry Collector]({{< ref "open-telemetry-collector.md#setting-opentelemetry-collector" >}}).

1. Add your Datadog API key to the `./deploy/opentelemetry-collector-generic-datadog.yaml` file in the `datadog` exporter configuration section:
    ```yaml
    data:
      otel-collector-config:
        ...
        exporters:
          ...
          datadog:
            api:
              key: <YOUR_API_KEY>
    ```

1. Apply the `opentelemetry-collector` configuration by running the following command.  

    ```sh
    kubectl apply -f ./deploy/open-telemetry-collector-generic-datadog.yaml
    ```

1. Set up a Dapr configuration file that will turn on tracing and deploy a tracing exporter component that uses the OpenTelemetry Collector.  

   ```sh
   kubectl apply -f ./deploy/collector-config.yaml

1. Apply the `appconfig` configuration by adding a `dapr.io/config` annotation to the container that you want to participate in the distributed tracing.

   ```yml
   annotations:
      dapr.io/config: "appconfig"

1. Create and configure the application. Once running, telemetry data is sent to Datadog and visible in Datadog APM.

<img src="/images/datadog-traces.png" width=1200 alt="Datadog APM showing telemetry data.">


## Related Links/References

* [Complete example of setting up Dapr on a Kubernetes cluster](https://github.com/ericmustin/quickstarts/tree/master/hello-kubernetes)
* [Datadog documentation about OpenTelemetry support](https://docs.datadoghq.com/opentelemetry/)
* [Datadog Application Performance Monitoring](https://docs.datadoghq.com/tracing/)