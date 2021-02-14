---
type: docs
title: "Observability"
linkTitle: "Observability"
weight: 500
description: >
  Monitor applications through tracing, metrics, logs and health
---

When building an applications, understanding how the system is behaving is an important part of operating it - this includes having the ability to observe the internal flows of an application, gauging its performance and becoming aware of problems as soon as they occur. This is challenging for any system but even more so for a distributed system comprised of multiple microservices where a flow may start in one microservices but continue in another. Observability is critical in production environments but also useful during development to understand bottlenecks, improve performance and perform basic debugging across the span of microservices.

While some data points about an application can be gathered from the underlying infrastructure (e.g. memory consumption, CPU usage), other meaningful information must be collected from an "application aware" layer - one that can show how important flows are executed across microservices. This usually means a developer must add some code to instrument an application for this purpose. Often, instrumentation code is simply meant to send collected data such as traces and metrics to an external monitoring tool or service that can help store, visualize and analyze all this information. Having to maintain this code, which is not part of the core logic of the application, is another burden on the developer - sometimes requiring understanding monitoring tools APIs, using additional SDKs etc. This instrumentation may also add to the portability challenges of an application which may require different instrumentation depending on where the application is deployed (e.g. different cloud providers offer different monitoring solutions and an on-prem deployment might require an on-prem solution).

## Observability for your application with Dapr
When building an application which is leveraging Dapr building blocks to perform service-to-service calls and pub/sub messaging, Dapr offers an advantage in respect to [distributed tracing]({{<ref tracing>}}) - Because this inter-service communication flows through the Dapr sidecar, the sidecar is in a unique position to offload the burden of application level instrumentation. Dapr can be [configured to emit tracing data]({{<ref setup-tracing.md>}}), and because Dapr does so using standard protocols such as the [Zipkin](https://zipkin.io) protocol, it can be easily integrated with multiple [monitoring backends]({{<ref supported-tracing-backends>}}). Additionally, Dapr can be configured to work with the [OpenTelemtry collector]({{<ref open-telemetry-collector>}}) which offers even more compatibility with external monitoring tools.


## Observability for the Dapr sidecar and system services
Like for other parts of your system, you will want to be able to observe Dapr itself and collect metrics and logs emitted by the Dapr sidecar that runs along each microservice as well as the Dapr related services in your environment such as the control plane services that are deployed for a Dapr enabled Kubernetes cluster.






=========================================================================

Observability is a term from control theory. Observability means you can answer questions about what's happening on the inside of a system by observing the outside of the system, without having to ship new code to answer new questions. 

The observability capabilities enable users to monitor the Dapr system services, their interaction with user applications and understand how these monitored services behave. The observability capabilities are divided into the following areas;

## Distributed tracing

[Distributed tracing]({{<ref "tracing.md">}}) is used to profile and monitor Dapr system services and user apps. Distributed tracing helps pinpoint where failures occur and what causes poor performance. Distributed tracing is particularly well-suited to debugging and monitoring distributed software architectures, such as microservices.

You can use distributed tracing to help debug and optimize application code. Distributed tracing contains trace spans between the Dapr runtime, Dapr system services, and user apps across process, nodes, network, and security boundaries. It provides a detailed understanding of service invocations (call flows) and service dependencies.

Dapr uses [W3C tracing context for distributed tracing]({{<ref w3c-tracing>}})

It is generally recommended to run Dapr in production with tracing.

## Metrics

[Metrics]({{<ref "metrics.md">}}) are the series of measured values and counts that are collected and stored over time. Dapr metrics provide monitoring and understanding of the behavior of Dapr system services and user apps.

For example, the service metrics between Dapr sidecars and user apps show call latency, traffic failures, error rates of requests etc.

Dapr system services metrics show side car injection failures, health of the system services including CPU usage, number of actor placement made etc.

#### Next steps

- [How-To: Set up Prometheus and Grafana]({{< ref prometheus.md >}})
- [How-To: Set up Azure Monitor]({{< ref azure-monitor.md >}})

## Logs

[Logs]({{<ref "logs.md">}}) are records of events that occur and can be used to determine failures or another status.

Logs events contain warning, error, info, and debug messages produced by Dapr system services. Each log event includes metadata such as message type, hostname, component name, App ID, ip address, etc.

#### Next steps

- [How-To: Set up Fluentd, Elastic search and Kibana in Kubernetes]({{< ref fluentd.md >}})
- [How-To: Set up Azure Monitor]({{< ref azure-monitor.md >}})

## Health

Dapr provides a way for a hosting platform to determine its [Health]({{<ref "sidecar-health.md">}}) using an HTTP endpoint. With this endpoint, the Dapr process, or sidecar, can be probed to determine its readiness and liveness and action taken accordingly.

#### Next steps

- [Health API]({{< ref health_api.md >}})