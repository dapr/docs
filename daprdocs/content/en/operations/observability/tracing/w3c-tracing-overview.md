---
type: docs
title: "W3C trace context overview"
linkTitle: "W3C trace context"
weight: 20
description: Background and scenarios for using W3C tracing context and headers with Dapr
---

Dapr uses the [Open Telemetry protocol](https://opentelemetry.io/), which in turn uses the [W3C trace context](https://www.w3.org/TR/trace-context/) for distributed tracing for both service invocation and pub/sub messaging. Dapr generates and propagates the trace context information, which can be sent to observability tools for visualization and querying.

## Background

Distributed tracing is a methodology implemented by tracing tools to follow, analyze, and debug a transaction across multiple software components. 

Typically, a distributed trace traverses more than one service, which requires it to be uniquely identifiable. **Trace context propagation** passes along this unique identification.

In the past, trace context propagation was implemented individually by each different tracing vendor. In multi-vendor environments, this causes interoperability problems, such as:

- Traces collected by different tracing vendors can't be correlated, as there is no shared unique identifier.
- Traces crossing boundaries between different tracing vendors can't be propagated, as there is no forwarded, uniformly agreed set of identification.
- Vendor-specific metadata might be dropped by intermediaries.
- Cloud platform vendors, intermediaries, and service providers cannot guarantee to support trace context propagation, as there is no standard to follow.

Previously, most applications were monitored by a single tracing vendor and stayed within the boundaries of a single platform provider, so these problems didn't have a significant impact. 

Today, an increasing number of applications are distributed and leverage multiple middleware services and cloud platforms. This transformation of modern applications requires a distributed tracing context propagation standard. 

The [W3C trace context specification](https://www.w3.org/TR/trace-context/) defines a universally agreed-upon format for the exchange of trace context propagation data (referred to as trace context). Trace context solves the above problems by providing:

- A unique identifier for individual traces and requests, allowing trace data of multiple providers to be linked together.
- An agreed-upon mechanism to forward vendor-specific trace data and avoid broken traces when multiple tracing tools participate in a single transaction.
- An industry standard that intermediaries, platforms, and hardware providers can support.

This unified approach for propagating trace data improves visibility into the behavior of distributed applications, facilitating problem and performance analysis.

## W3C trace context and headers format

### W3C trace context

Dapr uses the standard W3C trace context headers. 

- For HTTP requests, Dapr uses `traceparent` header. 
- For gRPC requests, Dapr uses `grpc-trace-bin` header. 

When a request arrives without a trace ID, Dapr creates a new one. Otherwise, it passes the trace ID along the call chain.

### W3C trace headers
These are the specific trace context headers that are generated and propagated by Dapr for HTTP and gRPC.

{{< tabs "HTTP" "gRPC" >}}
 <!-- HTTP -->
{{% codetab %}}

Copy these headers when propagating a trace context header from an HTTP response to an HTTP request:

**Traceparent header**  

The traceparent header represents the incoming request in a tracing system in a common format, understood by all vendors:

```
traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01
```

[Learn more about the traceparent fields details](https://www.w3.org/TR/trace-context/#traceparent-header).

**Tracestate header**  

The tracestate header includes the parent in a potentially vendor-specific format:

```
tracestate: congo=t61rcWkgMzE
```

[Learn more about the tracestate fields details](https://www.w3.org/TR/trace-context/#tracestate-header).

{{% /codetab %}}


 <!-- gRPC -->
{{% codetab %}}

In the gRPC API calls, trace context is passed through `grpc-trace-bin` header.

{{% /codetab %}}

{{< /tabs >}}

## Related Links
- [Learn more about distributed tracing in Dapr]({{< ref tracing-overview.md >}})
- [W3C Trace Context specification](https://www.w3.org/TR/trace-context/)
