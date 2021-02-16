---
type: docs
title: "How-To: Observe metrics with Dynatrace"
linkTitle: "Dynatrace"
weight: 6000
description: "Set up Dynatrace to observe Dapr metrics using the Kubernetes integration"
---

As Dapr exposes it's metrics via a Prometheus endpoint, [Dynatrace](https://www.dynatrace.com) can automatically integrate these metrics and make them available for charting, alerting, and further analysis. 

### Prerequisites

- A Dynatrace account. If you don't have an account, sign-up for a [free trial](https://www.dynatrace.com/trial/)

- Enabled Dynatrace [Kubernetes Integration](https://www.dynatrace.com/support/help/technology-support/cloud-platforms/kubernetes/monitoring/monitor-kubernetes-clusters-with-dynatrace/) with **Monitor Prometheus exporters** enabled.

## Annotate Prometheus exporter pods

Dynatrace collects metrics from any pods that are annotated with a `metrics.dynatrace.com/scrape` property set to `true` in the pod definition.

### Configure metrics port 

The default metrics port exposed by Dapr is `9090` Set `metrics.dynatrace.com/port` to respective port.

See an example of a simple pod definition with the annotations.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: addapp
  labels:
    app: add
spec:
  replicas: 1
  selector:
    matchLabels:
      app: add
  template:
    metadata:
      labels:
        app: add
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "addapp"
        dapr.io/app-port: "6000"
        dapr.io/config: "tracing"
        metrics.dynatrace.com/scrape: "true"
        metrics.dynatrace.com/port: "9090"
    spec:
      containers:
      - name: add
        image: dapriosamples/distributed-calculator-go:latest
        ports:
        - containerPort: 6000
        imagePullPolicy: Always
```
&nbsp;

For advanced Prometheus configuration, see [Dynatrace help](https://www.dynatrace.com/support/help/shortlink/monitor-prometheus-metrics#annotate-prometheus-exporter-pods)

## View metrics on a dashboard

Metrics are available in the Data Explorer for custom charting. 

![dataexplorer](/images/dt-dataexplorer.png)

You can simply search for the metric keys of all available [Dapr metrics](https://github.com/dapr/dapr/blob/master/docs/development/dapr-metrics.md) and define how you’d like to analyze and chart your metrics. After that you can pin your charts on a dashboard.

## References
* [How-To: Setup Metric Events for alerting](https://www.dynatrace.com/support/help/how-to-use-dynatrace/problem-detection-and-analysis/problem-detection/metric-events-for-alerting/)
* [How-To: Set up Dynatrace OneAgent for distributed tracing and deep code-level insights]({{< ref dynatrace.md >}})

