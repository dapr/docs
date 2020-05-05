# Observability

Observability is a term from control theory. Observability means you can answer questions about what's happening on the inside of a system by observing the outside of the system, without having to ship new code to answer new questions. Observability is critical in production environments and services to debug, operate and monitor Dapr system services, components and user applications.

The observability capabilities enable users to monitor the Dapr system services, their interaction with user applications and understand how these monitored services behave. The observability capabilities are divided into the following areas;

* **[Metrics](./metrics.md)**: are the series of measured values and counts that are collected and stored over time. Dapr metrics provide monitoring and understanding of the behavior of Dapr system services and user apps. For example, the service metrics between Dapr sidecars and user apps show call latency, traffic failures, error rates of requests etc. Dapr system services metrics show side car injection failures, health of the system services including CPU usage, number of actor placement made etc.  
* **[Logs](./logs.md)**: are records of events that occur occur that can be used to determine failures or other status. Logs events contain warning, error, info and debug messages produced by Dapr system services. Each log event includes metadata such as message type, hostname, component name, App ID, ip address, etc.
* **[Distributed tracing](./traces.md)**: is used to profile and monitor Dapr system services and user apps. Distributed tracing helps pinpoint where failures occur and what causes poor performance. Distributed tracing is particularly well-suited to debugging and monitoring distributed software architectures, such as microservices.

     You can use distributed tracing to help debug and optimize application code. Distributed tracing contains trace spans between the Dapr runtime, Dapr system services, and user apps across process, nodes, network, and security boundaries. It provides a detailed understanding of service invocations (call flows) and service dependencies.

    It is generally recommended to run Dapr in production with tracing.

* **[Health](./health.md)**: Dapr provides a way for a hosting platform to determine it's health using an HTTP endpoint. With this endpoint, the Dapr process, or sidecar, can be probed to determine its readiness and liveness and action taken accordingly.

## Open Telemetry
Dapr integrates with OpenTelemetry for metrics, logs and tracing. With OpenTelemetry, you can configure various exporters for tracing and metrics based on your environment, whether it is running in the cloud or on-premises.

## Monitoring tools

The observability tools listed below are ones that have been tested to work with Dapr.

### Metrics

* [How-To: Set up Prometheus and Grafana](../../howto/setup-monitoring-tools/setup-prometheus-grafana.md)
* [How-To: Set up Azure Monitor](../../howto/setup-monitoring-tools/setup-azure-monitor.md)

### Logs

* [How-To: Set up Fluentd, Elastic search and Kibana in Kubernetes](../../howto/setup-monitoring-tools/setup-fluentd-es-kibana.md)
* [How-To: Set up Azure Monitor](../../howto/setup-monitoring-tools/setup-azure-monitor.md)

### Distributed Tracing

* [How-To: Set up Zipkin](../../howto/diagnose-with-tracing/zipkin.md)
* [How-To: Set up Application Insights](../../howto/diagnose-with-tracing/azure-monitor.md)


##  Implementation Status
The table below shows the current status of each of the observabilty capabilites for the Dapr runtime and system services. N/A means not applicable.

|         | Runtime | Operator | Injector | Placement | Sentry|
|---------|---------|----------|----------|-----------|--------|
|Metrics  | Yes     | Yes      | Yes      | Yes       | Yes    |
|Tracing  | Yes     | N/A      | N/A      | *Planned* | N/A    |
|Logs     | Yes     | Yes      | Yes      | Yes       | Yes    |