# Dapr observability

Observability is one of the critical properties of production-ready services to debug, operate, monitor, and maintain Dapr core components and user applications. This enables users to monitor Dapr core components and its interaction with user application and understand how these monitored services behave. We defines the below three terms to improve Dapr observability:

* **[Metrics](./metrics.md)**: contains core component and critical service level metrics, which provides a way of monitoring and understanding behavior of dapr and user app. e.g. service-level metrics (latency, traffics, error rates of requests between dapr sidecars and user app, etc) between dapr sidecars and user apps, and core-component level metrics(side car injection failure, health, …)
* **[Logs](./logs.md)**: contains messages (warning, error, info, debug) produced by Dapr core components. Each log should include metadata such as message type, hostname, component name, Dapr id, ip address, etc.
* **[Distributed trace](./traces.md)**: contains distributed trace spans between Dapr runtime, placement service, and user app across process, nodes, network, and security boundaries. It provides a detailed understanding of call flows and service dependencies.

## Status

|         | Runtime | Operator | Injector | Placement | Sentry|
|---------|---------|----------|----------|-----------|--------|
|Metrics  | yes     | yes      | yes      | yes       | yes    |
|Tracing  | yes     | N/A      | N/A      | *Planned* | N/A    |
|Logs     | yes     | yes      | yes      | yes       | yes    |

## Supported monitoring tools

### Metrics

* [Prometheus + Grafana](../../howto/observe-metrics-with-prometheus/README.md)
* [Azure monitor](../../howto/setup-monitoring-tools/setup-azure-monitor.md)

### Logs

* [Fluentd + Elastic search + Kibana](../../howto/setup-monitoring-tools/setup-fluentd-es-kibana.md)
* [Azure monitor](../../howto/setup-monitoring-tools/setup-azure-monitor.md)

### Traces

* [Zipkin](../../howto/diagnose-with-tracing/zipkin.md)
* [Application insight](../../howto/diagnose-with-tracing/azure-monitor.md)
