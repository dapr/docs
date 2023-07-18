---
type: docs
title: "How-To: Set-up New Relic for distributed tracing"
linkTitle: "New Relic"
weight: 2000
description: "Set-up New Relic for distributed tracing"
---

## Prerequisites

- Perpetually [free New Relic account](https://newrelic.com/signup?ref=dapr), 100 GB/month of free data ingest, 1 free full access user, unlimited free basic users

## Configure Dapr tracing

Dapr natively captures metrics and traces that can be send directly to New Relic. The easiest way to export these is by configuring Dapr to send the traces to [New Relic's Trace API](https://docs.newrelic.com/docs/distributed-tracing/trace-api/report-zipkin-format-traces-trace-api/) using the Zipkin trace format.

In order for the integration to send data to New Relic [Telemetry Data Platform](https://newrelic.com/platform/telemetry-data-platform), you need a [New Relic Insights Insert API key](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/#insights-insert-key).

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
  namespace: default
spec:
  tracing:
    samplingRate: "1"
    zipkin:
      endpointAddress: "https://trace-api.newrelic.com/trace/v1?Api-Key=<NR-INSIGHTS-INSERT-API-KEY>&Data-Format=zipkin&Data-Format-Version=2"
```

### Viewing Traces

New Relic Distributed Tracing overview
![New Relic Kubernetes Cluster Explorer App](/images/nr-distributed-tracing-overview.png)

New Relic Distributed Tracing details
![New Relic Kubernetes Cluster Explorer App](/images/nr-distributed-tracing-detail.png)

## (optional) New Relic Instrumentation

In order for the integrations to send data to New Relic Telemetry Data Platform, you either need a [New Relic license key](https://docs.newrelic.com/docs/accounts/accounts-billing/account-setup/new-relic-license-key) or [New Relic Insights Insert API key](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/#insights-insert-key).

### OpenTelemetry instrumentation

Leverage the different language specific OpenTelemetry implementations, for example [New Relic Telemetry SDK and OpenTelemetry support for .NET](https://github.com/newrelic/newrelic-telemetry-sdk-dotnet). In this case, use the [OpenTelemetry Trace Exporter](https://github.com/newrelic/newrelic-telemetry-sdk-dotnet/tree/main/src/NewRelic.OpenTelemetry). See example [here](https://github.com/harrykimpel/quickstarts/blob/master/distributed-calculator/csharp-otel/Startup.cs).

### New Relic Language agent

Similarly to the OpenTelemetry instrumentation, you can also leverage a New Relic language agent. As an example, the [New Relic agent instrumentation for .NET Core](https://docs.newrelic.com/docs/agents/net-agent/other-installation/install-net-agent-docker-container) is part of the Dockerfile. See example [here](https://github.com/harrykimpel/quickstarts/blob/master/distributed-calculator/csharp/Dockerfile).

## (optional) Enable New Relic Kubernetes integration

In case Dapr and your applications run in the context of a Kubernetes environment, you can enable additional metrics and logs.

The easiest way to install the New Relic Kubernetes integration is to use the [automated installer](https://one.newrelic.com/launcher/nr1-core.settings?pane=eyJuZXJkbGV0SWQiOiJrOHMtY2x1c3Rlci1leHBsb3Jlci1uZXJkbGV0Lms4cy1zZXR1cCJ9) to generate a manifest. It bundles not just the integration DaemonSets, but also other New Relic Kubernetes configurations, like [Kubernetes events](https://docs.newrelic.com/docs/integrations/kubernetes-integration/kubernetes-events/install-kubernetes-events-integration), [Prometheus OpenMetrics](https://docs.newrelic.com/docs/integrations/prometheus-integrations/get-started/send-prometheus-metric-data-new-relic/), and [New Relic log monitoring](https://docs.newrelic.com/docs/logs/ui-data/use-logs-ui/).

### New Relic Kubernetes Cluster Explorer

The [New Relic Kubernetes Cluster Explorer](https://docs.newrelic.com/docs/integrations/kubernetes-integration/understand-use-data/kubernetes-cluster-explorer) provides a unique visualization of the entire data and deployments of the data collected by the Kubernetes integration.

It is a good starting point to observe all your data and dig deeper into any performance issues or incidents happening inside of the application or microservices.

![New Relic Kubernetes Cluster Explorer App](/images/nr-k8s-cluster-explorer-app.png)

Automated correlation is part of the visualization capabilities of New Relic.

### Pod-level details

![New Relic K8s Pod Level Details](/images/nr-k8s-pod-level-details.png)

### Logs in Context

![New Relic K8s Logs In Context](/images/nr-k8s-logs-in-context.png)

## New Relic Dashboards

### Kubernetes Overview

![New Relic Dashboard Kubernetes Overview](/images/nr-dashboard-k8s-overview.png)

### Dapr System Services

![New Relic Dashboard Dapr System Services](/images/nr-dashboard-dapr-system-services.png)

### Dapr Metrics

![New Relic Dashboard Dapr Metrics 1](/images/nr-dashboard-dapr-metrics-1.png)

## New Relic Grafana integration

New Relic teamed up with [Grafana Labs](https://grafana.com/) so you can use the [Telemetry Data Platform](https://newrelic.com/platform/telemetry-data-platform) as a data source for Prometheus metrics and see them in your existing dashboards, seamlessly tapping into the reliability, scale, and security provided by New Relic.

[Grafana dashboard templates](https://github.com/dapr/dapr/blob/227028e7b76b7256618cd3236d70c1d4a4392c9a/grafana/README.md) to monitor Dapr system services and sidecars can easily be used without any changes. New Relic provides a [native endpoint for Prometheus metrics](https://docs.newrelic.com/docs/integrations/grafana-integrations/set-configure/configure-new-relic-prometheus-data-source-grafana) into Grafana. A datasource can easily be set-up:

![New Relic Grafana Data Source](/images/nr-grafana-datasource.png)

And the exact same dashboard templates from Dapr can be imported to visualize Dapr system services and sidecars.

![New Relic Grafana Dashboard](/images/nr-grafana-dashboard.png)

## New Relic Alerts

All the data that is collected from Dapr, Kubernetes or any services that run on top of can be used to set-up alerts and notifications into the preferred channel of your choice. See [Alerts and Applied Intelligence](https://docs.newrelic.com/docs/alerts-applied-intelligence/overview/).

## Related Links/References

* [New Relic Account Signup](https://newrelic.com/signup)
* [Telemetry Data Platform](https://newrelic.com/platform/telemetry-data-platform)
* [Distributed Tracing](https://docs.newrelic.com/docs/distributed-tracing/concepts/introduction-distributed-tracing/)
* [New Relic Trace API](https://docs.newrelic.com/docs/distributed-tracing/trace-api/introduction-trace-api/)
* [Types of New Relic API keys](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/)
* [New Relic OpenTelemetry User Experience](https://blog.newrelic.com/product-news/opentelemetry-user-experience/)
* [Alerts and Applied Intelligence](https://docs.newrelic.com/docs/alerts-applied-intelligence/overview/)
