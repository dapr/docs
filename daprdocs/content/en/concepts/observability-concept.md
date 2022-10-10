---
type: docs
title: "Observability"
linkTitle: "Observability"
weight: 500
description: >
  Monitor applications through tracing, metrics, logs and health
---

When building an application, understanding how the system is behaving is an important part of operating it–this includes having the ability to observe the internal calls of an application, gauging its performance and becoming aware of problems as soon as they occur. This is challenging for any system, but even more so for a distributed system comprised of multiple microservices where a flow, made of several calls, may start in one microservice but continue in another. Observability is critical in production environments, but also useful during development to understand bottlenecks, improve performance, and perform basic debugging across the span of microservices.

While some data points about your application can be gathered from the underlying infrastructure (memory consumption, CPU usage, etc.), other meaningful information must be collected from an "application-aware" layer. This layer can show how an important series of calls is executed across microservices. Typically, you implement this layer by adding some code to instrument an application for this purpose. Instrumentation code is not part of the core logic of the application, but is simply meant to send collected data (traces and metrics) to an external monitoring tool or service that stores, visualizes, and analyzes the information.

Maintaining instrumentation code can be cumbersome, requiring you to understand the monitoring tools' APIs, use additional SDKs, etc. It can also decrease your application's portability, requiring different instrumentation depending on where the application is deployed. For example, different cloud providers offer different monitoring solutions and an on-premises deployment might require a self-hosted solution.

## Observability for your application with Dapr

Dapr offers an advantage to applications that leverage its service-to-service invocation and pub/sub building blocks in respect to [distributed tracing]({{<ref tracing>}}). Because this inter-service communication flows through the Dapr sidecar, Dapr is in a unique position to offload the burden of application-level instrumentation.

### Distributed tracing

Dapr can be [configured to emit tracing data]({{<ref setup-tracing.md>}}), and because Dapr does so using widely adopted protocols such as the [Zipkin](https://zipkin.io) protocol, it can be easily integrated with multiple [monitoring backends]({{<ref supported-tracing-backends>}}).

<img src="/images/observability-tracing.png" width=1000 alt="Distributed tracing with Dapr">

### OpenTelemetry collector

Dapr can also be configured to work with the [OpenTelemetry Collector]({{<ref open-telemetry-collector>}}) which offers even more compatibility with external monitoring tools.

<img src="/images/observability-opentelemetry-collector.png" width=1000 alt="Distributed tracing via OpenTelemetry collector">

### Tracing context

Dapr implements the [W3C tracing]({{<ref w3c-tracing>}}) specification for tracing context and can generate and propagate the context header itself or propagate user-provided context headers.

## Observability for the Dapr sidecar and system services

As for other parts of your system, you will want to be able to observe Dapr itself and collect metrics and logs emitted by the Dapr sidecar that runs along each microservice, as well as the Dapr-related services in your environment such as the control plane services that are deployed for a Dapr-enabled Kubernetes cluster.

<img src="/images/observability-sidecar.png" width=1000 alt="Dapr sidecar metrics, logs and health checks">

### Logging

Dapr generates [logs]({{<ref "logs.md">}}) to provide visibility into sidecar operation and to help users identify issues and perform debugging. Log events contain warning, error, info, and debug messages produced by Dapr system services. Dapr can also be configured to send logs to collectors such as [Fluentd]({{< ref fluentd.md >}}) and [Azure Monitor]({{< ref azure-monitor.md >}}) so they can be easily searched and analyzed to provide insights.

### Metrics

Metrics are the series of measured values and counts that are collected and stored over time. [Dapr metrics]({{<ref "metrics">}}) provide monitoring capabilities to understand the behavior of the Dapr sidecar and system services. For example, the metrics between a Dapr sidecar and the user application show call latency, traffic failures, error rates of requests, etc. Dapr [system services metrics](https://github.com/dapr/dapr/blob/master/docs/development/dapr-metrics.md) show sidecar injection failures and the health of system services, including CPU usage, number of actor placements made, etc.

### Health checks

The Dapr sidecar exposes an HTTP endpoint for [health checks]({{<ref sidecar-health.md>}}). With this API, user code or hosting environments can probe the Dapr sidecar to determine its status and identify issues with sidecar readiness.

Conversely, Dapr can be configured to probe for the [health of your application]({{ <ref app-health.md> }}), and react to changes in the app's health, including stopping pub/sub subscriptions and short-circuiting service invocation calls.
