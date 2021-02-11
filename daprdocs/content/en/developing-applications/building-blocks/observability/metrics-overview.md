---
type: docs
title: "Metrics"
linkTitle: "Metrics"
weight: 4000
description: "Observing Dapr metrics"
---

Dapr exposes a [Prometheus](https://prometheus.io/) metrics endpoint that you can scrape to gain a greater understanding of how Dapr is behaving and to setup alerts for specific conditions.

## Configuration

The metrics endpoint is enabled by default, you can disable it by passing the command line argument `--enable-metrics=false` to Dapr system processes.

The default metrics port is `9090`. This can be overridden by passing the command line argument `--metrics-port` to Daprd.

To disable the metrics in the Dapr side car, you can use the `metric` spec configuration and set `enabled: false` to disable the metrics in the Dapr runtime.

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
    enabled: false
```

## Metrics

Each Dapr system process emits Go runtime/process metrics by default and have their own metrics:

- [Dapr metric list](https://github.com/dapr/dapr/blob/master/docs/development/dapr-metrics.md)

## References

* [Howto: Run Prometheus locally]({{< ref prometheus.md >}})
* [Howto: Set up Prometheus and Grafana for metrics]({{< ref grafana.md >}})
* [Howto: Set up Azure monitor to search logs and collect metrics for Dapr]({{< ref azure-monitor.md >}})
