---
type: docs
title: "Trace context"
linkTitle: "Trace context"
weight: 4000
description: Background and scenarios for using W3C tracing with Dapr
type: docs
---

Dapr uses the [Open Telemetry protocol](https://opentelemetry.io/), which in turn uses the [W3C trace context](https://www.w3.org/TR/trace-context/) for distributed tracing for both service invocation and pub/sub messaging. Dapr generates and propagates the trace context information, which can be sent to observability tools for visualization and querying.

## Background
Distributed tracing is a methodology implemented by tracing tools to follow, analyze, and debug a transaction across multiple software components. Typically, a distributed trace traverses more than one service which requires it to be uniquely identifiable. Trace context propagation passes along this unique identification.

In the past, trace context propagation has typically been implemented individually by each different tracing vendor. In multi-vendor environments, this causes interoperability problems, such as:

- Traces that are collected by different tracing vendors cannot be correlated as there is no shared unique identifier.
- Traces that cross boundaries between different tracing vendors can not be propagated as there is no forwarded, uniformly agreed set of identification.
- Vendor-specific metadata might be dropped by intermediaries.
- Cloud platform vendors, intermediaries, and service providers cannot guarantee to support trace context propagation as there is no standard to follow.

In the past, these problems did not have a significant impact, as most applications were monitored by a single tracing vendor and stayed within the boundaries of a single platform provider. Today, an increasing number of applications are distributed and leverage multiple middleware services and cloud platforms.

This transformation of modern applications called for a distributed tracing context propagation standard. The [W3C trace context specification](https://www.w3.org/TR/trace-context/) defines a universally agreed-upon format for the exchange of trace context propagation data - referred to as trace context. Trace context solves the problems described above by:

* Providing a unique identifier for individual traces and requests, allowing trace data of multiple providers to be linked together.
* Providing an agreed-upon mechanism to forward vendor-specific trace data and avoid broken traces when multiple tracing tools participate in a single transaction.
* Providing an industry standard that intermediaries, platforms, and hardware providers can support.

A unified approach for propagating trace data improves visibility into the behavior of distributed applications, facilitating problem and performance analysis.

## Related Links
- [W3C Trace Context specification](https://www.w3.org/TR/trace-context/)
