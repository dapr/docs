---
type: docs
title: "Observability"
linkTitle: "Observability"
weight: 500
description: >
  Observe applications through tracing, metrics, logs and health
---

When building an application, understanding how the system is behaving is an important part of operating it - this includes having the ability to observe the internal calls of an application, gauging its performance and becoming aware of problems as soon as they occur. This is challenging for any system, but even more so for a distributed system comprised of multiple microservices where a flow, made of several calls, may start in one microservice but continue in another. Observability is critical in production environments, but also useful during development to understand bottlenecks, improve performance and perform basic debugging across the span of microservices.

While some data points about an application can be gathered from the underlying infrastructure (for example memory consumption, CPU usage), other meaningful information must be collected from an "application-aware" layer–one that can show how an important series of calls is executed across microservices. This usually means a developer must add some code to instrument an application for this purpose. Often, instrumentation code is simply meant to send collected data such as traces and metrics to observability tools or services that can help store, visualize and analyze all this information.

Having to maintain this code, which is not part of the core logic of the application, is a burden on the developer, sometimes requiring understanding the observability tools' APIs, using additional SDKs etc. This instrumentation may also add to the portability challenges of an application, which may require different instrumentation depending on where the application is deployed. For example, different cloud providers offer different observability tools and an on-premises deployment might require a self-hosted solution.

## Observability for your application with Dapr

When building an application which leverages Dapr API building blocks to perform service-to-service calls and pub/sub messaging, Dapr offers an advantage with respect to [distributed tracing]({{<ref tracing>}}). Because this inter-service communication flows through the Dapr runtime (or "sidecar"), Dapr is in a unique position to offload the burden of application-level instrumentation.

### Distributed tracing

Dapr can be [configured to emit tracing data]({{<ref setup-tracing.md>}}), and because Dapr does so using the widely adopted protocols of [Open Telemetry (OTEL)](https://opentelemetry.io/) and [Zipkin](https://zipkin.io), it can be easily integrated with multiple observability tools.

<img src="/images/observability-tracing.png" width=1000 alt="Distributed tracing with Dapr">

### Automatic tracing context generation

Dapr uses [W3C tracing]({{<ref w3c-tracing-overview>}}) specification for tracing context, included as part Open Telemetry (OTEL), to generate and propagate the context header for the application or propagate user-provided context headers. This means that you get tracing by default with Dapr.

## Observability for the Dapr sidecar and control plane

You also want to be able to observe Dapr itself, by collecting metrics on performance, throughput and latency and logs emitted by the Dapr sidecar, as well as the Dapr control plane services. Dapr sidecars have a health endpoint that can be probed to indicate their health status.

<img src="/images/observability-sidecar.png" width=1000 alt="Dapr sidecar metrics, logs and health checks">

### Logging

Dapr generates [logs]({{<ref "logs.md">}}) to provide visibility into sidecar operation and to help users identify issues and perform debugging. Log events contain warning, error, info, and debug messages produced by Dapr system services. Dapr can also be configured to send logs to collectors such as [Fluentd]({{< ref fluentd.md >}}), [Azure Monitor]({{< ref azure-monitor.md >}}), and other observability tools, so that logs can be searched and analyzed to provide insights.

### Metrics

Metrics are the series of measured values and counts that are collected and stored over time. [Dapr metrics]({{<ref "metrics">}}) provide monitoring capabilities to understand the behavior of the Dapr sidecar and control plane. For example, the metrics between a Dapr sidecar and the user application show call latency, traffic failures, error rates of requests, etc. Dapr [control plane metrics](https://github.com/dapr/dapr/blob/master/docs/development/dapr-metrics.md) show sidecar injection failures and the health of control plane services, including CPU usage, number of actor placements made, etc.

### Health checks

The Dapr sidecar exposes an HTTP endpoint for [health checks]({{<ref sidecar-health.md>}}). With this API, user code or hosting environments can probe the Dapr sidecar to determine its status and identify issues with sidecar readiness.

Conversely, Dapr can be configured to probe for the [health of your application]({{<ref app-health.md >}}), and react to changes in the app's health, including stopping pub/sub subscriptions and short-circuiting service invocation calls.
