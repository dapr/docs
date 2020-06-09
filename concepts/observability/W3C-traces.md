# W3C tracing context for distributed tracing

- [Background](#background)
- [W3C trace headers](#w3c-trace-headers)
- [Trace context HTTP headers format](#trace-context-http-headers-format)
- [Trace context gRPC headers format](#trace-context-grpc-headers-format)

## Background

Distributed tracing is a methodology implemented by tracing tools to follow, analyze and debug a transaction across multiple software components. Typically, a distributed trace traverses more than one component which requires it to be uniquely identifiable across all participating systems. Trace context propagation passes along this unique identification. 

Today, trace context propagation is implemented individually by each tracing vendor. In multi-vendor environments, this causes interoperability problems, such as:

- Traces that are collected by different tracing vendors cannot be correlated as there is no shared unique identifier.
- Traces that cross boundaries between different tracing vendors can not be propagated as there is no uniformly agreed set of identification that is forwarded.
- Vendor specific metadata might be dropped by intermediaries.
- Cloud platform vendors, intermediaries and service providers, cannot guarantee to support trace context propagation as there is no standard to follow.

In the past, these problems did not have a significant impact as most applications were monitored by a single tracing vendor and stayed within the boundaries of a single platform provider. Today, an increasing number of applications are highly distributed and leverage multiple middleware services and cloud platforms.

This transformation of modern applications calls for a distributed tracing context propagation standard.

[W3C trace context specification](https://www.w3.org/TR/trace-context/) defines a universally agreed-upon format for the exchange of trace context propagation data - referred to as trace context. Trace context solves the problems described above by

* providing an unique identifier for individual traces and requests, allowing trace data of multiple providers to be linked together.
* providing an agreed-upon mechanism to forward vendor-specific trace data and avoid broken traces when multiple tracing tools participate in a single transaction.
 * providing an industry standard that intermediaries, platforms, and hardware providers can support.

A unified approach for propagating trace data improves visibility into the behavior of distributed applications, facilitating problem and performance analysis. The interoperability provided by trace context is a prerequisite to manage modern micro-service based applications.

## W3C trace headers

### Trace context HTTP headers format

#### Traceparent Header

The traceparent header represents the incoming request in a tracing system in a common format, understood by all vendors. 
Here’s an example of a traceparent header.

`traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01`

 Refer traceparent fields details [here](https://www.w3.org/TR/trace-context/#traceparent-header)

#### Tracestate Header

The tracestate header includes the parent in a potentially vendor-specific format:

`tracestate: congo=t61rcWkgMzE`

Refer tracestate fields details [here](https://www.w3.org/TR/trace-context/#tracestate-header)

### Trace context gRPC headers format

In the gRPC API calls, trace context is passed through `grpc-trace-bin` header.

## Related Links

* [Observability sample](https://github.com/dapr/samples/tree/master/8.observability)
* [How-To: Set up Application Insights for distributed tracing](../../howto/use-w3c-tracecontext)
* [How-To: Set up Zipkin for distributed tracing](../../howto/diagnose-with-tracing/zipkin.md)
* [W3C trace context specification](https://www.w3.org/TR/trace-context/)
