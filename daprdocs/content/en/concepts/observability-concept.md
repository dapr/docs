---
type: docs
title: "Observability"
linkTitle: "Observability"
weight: 500
description: >
  How to monitor applications through tracing, metrics, logs and health
---

Observability is a term from control theory. Observability means you can answer questions about what's happening on the inside of a system by observing the outside of the system, without having to ship new code to answer new questions. Observability is critical in production environments and services to debug, operate and monitor Dapr system services, components and user applications.

The observability capabilities enable users to monitor the Dapr system services, their interaction with user applications and understand how these monitored services behave. The observability capabilities are divided into the following areas;

* **[Distributed tracing](./traces.md)**: is used to profile and monitor Dapr system services and user apps. Distributed tracing helps pinpoint where failures occur and what causes poor performance. Distributed tracing is particularly well-suited to debugging and monitoring distributed software architectures, such as microservices.

    You can use distributed tracing to help debug and optimize application code. Distributed tracing contains trace spans between the Dapr runtime, Dapr system services, and user apps across process, nodes, network, and security boundaries. It provides a detailed understanding of service invocations (call flows) and service dependencies.

    Dapr uses [W3C distributed tracing]({{< ref w3c-tracing >}})

    It is generally recommended to run Dapr in production with tracing.
* **[Metrics](./metrics.md)**: are the series of measured values and counts that are collected and stored over time. Dapr metrics provide monitoring and understanding of the behavior of Dapr system services and user apps. For example, the service metrics between Dapr sidecars and user apps show call latency, traffic failures, error rates of requests etc. Dapr system services metrics show side car injection failures, health of the system services including CPU usage, number of actor placement made etc.  

* **[Logs](./logs.md)**: are records of events that occur and can be used to determine failures or another status. Logs events contain warning, error, info, and debug messages produced by Dapr system services. Each log event includes metadata such as message type, hostname, component name, App ID, ip address, etc.

* **[Health](./health.md)**: Dapr provides a way for a hosting platform to determine it's health using an HTTP endpoint. With this endpoint, the Dapr process, or sidecar, can be probed to determine its readiness and liveness and action taken accordingly.

## Open Telemetry
Dapr integrates with [OpenTelemetry](https://opentelemetry.io/) for tracing, metrics and logs. With OpenTelemetry, you can configure various exporters for tracing and metrics based on your environment, whether it is running in the cloud or on-premises.
