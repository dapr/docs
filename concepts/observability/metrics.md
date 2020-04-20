# Metrics

Dapr exposes a [Prometheus](https://prometheus.io/) metrics endpoint that you can scrape to gain a greater understanding of how Dapr is behaving and to setup alerts for specific conditions.

## Configuration

The metrics endpoint is enabled by default, you can disable it by passing the command line argument `--enable-metrics=false` to dapr system processes.

The default metrics port is `9090`. This can be overridden by passing the command line argument `--metrics-port` to darpd.

## Metrics

Each Dapr system process emits Go runtime/process metrics by default and have their own metrics:

- [Dapr metric list](https://github.com/dapr/dapr/blob/master/docs/development/dapr-metrics.md)

## References

* [Howto: Run Prometheus locally](../../howto/setup-monitoring-tools/observe-metrics-with-prometheus-locally.md)
* [Howto: Set up Prometheus and Grafana for metrics](../../howto/setup-monitoring-tools/setup-prometheus-grafana.md)
* [Howto: Set up Azure monitor to search logs and collect metrics for Dapr](../../howto/setup-monitoring-tools/setup-azure-monitor.md)
