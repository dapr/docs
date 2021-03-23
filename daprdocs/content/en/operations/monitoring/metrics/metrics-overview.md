---
type: docs
title: "Metrics"
linkTitle: "Metrics"
weight: 4000
description: "Observing Dapr metrics in Kubernetes"
---

Dapr exposes a [Prometheus](https://prometheus.io/) metrics endpoint that you can scrape to gain a greater understanding of how Dapr is behaving and to setup alerts for specific conditions.

## Configuration

The metrics endpoint is enabled by default, you can disable it by passing the command line argument `--enable-metrics=false` to Dapr system processes.

The default metrics port is `9090`. This can be overridden by passing the command line argument `--metrics-port` to Daprd. Additionally, the metrics exporter can be disabled for a specific application by setting the `dapr.io/enable-metrics: "false"` annotation to your application deployment. With the metrics exporter disabled, `daprd` will not open the metrics listening port.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodeapp
  labels:
    app: node
spec:
  replicas: 1
  selector:
    matchLabels:
      app: node
  template:
    metadata:
      labels:
        app: node
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "nodeapp"
        dapr.io/app-port: "3000"
        dapr.io/enable-metrics: "true"
        dapr.io/metrics-port: "9090"
    spec:
      containers:
      - name: node
        image: dapriosamples/hello-k8s-node:latest
        ports:
        - containerPort: 3000
        imagePullPolicy: Always
```

To disable the metrics collection in the Dapr side cars running in a specific namespace, you can use the `metric` spec configuration and set `enabled: false` to disable the metrics in the Dapr runtime.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: tracing
  namespace: default
spec:
  tracing:
    samplingRate: "1"
  metric:
    enabled: true
```

## Metrics

Each Dapr system process emits Go runtime/process metrics by default and have their own metrics:

- [Dapr metric list](https://github.com/dapr/dapr/blob/master/docs/development/dapr-metrics.md)

## References

* [Howto: Run Prometheus locally]({{< ref prometheus.md >}})
* [Howto: Set up Prometheus and Grafana for metrics]({{< ref grafana.md >}})
* [Howto: Set up Azure monitor to search logs and collect metrics for Dapr]({{< ref azure-monitor.md >}})
