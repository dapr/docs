# W3C tracing context for distributed tracing

- [Background](#background)
- [W3C trace headers](#w3c-trace-headers)
- [Trace context HTTP headers format](#trace-context-http-headers-format)
- [Trace context gRPC headers format](#trace-context-grpc-headers-format)
- [Scenarios](#scenarios)
     - [What Dapr covers](#dapr-covers)
     - [What Dapr does not cover](#dapr-does-not-cover)

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

## Scenarios

There are broadly two scenarios to use trace context
 1. You don’t pass any trace context. 
 In this case, Dapr generates trace context and propagates the trace context. 
    You can get more details in section - [What Dapr covers](#dapr-covers)
 2. You pass your own generated trace context. 
 In this case, Dapr uses provided trace context and propagates the trace context.
    You can get more details in section - [What Dapr does not cover](#dapr-does-not-cover)

### What Dapr covers

Lets go through scenarios in detail with examples, this helps to understand the scenarios that Dapr covers.
In all these below scenarios, you do not need to create and pass any trace headers. Dapr takes care of creating
trace headers and propagating trace headers.

1. Single Service Invocation call within Dapr to Dapr (`service A -> service B` )

    Dapr generates the trace headers in service A and these trace headers are propagated from service A to service B.
2. Multiple Sequential Service Calls within Dapr to Dapr ( `service A -> service B -> service C`)

    Dapr generates the trace heades in the beginning of the request in service A and these trace headers are propagated from `service A-> service B -> service C` and so on to further Dapr enabled services.
3. Request is from outside Dapr ( e.g. gateway service ) to Dapr enabled service A

    Dapr generates trace headers in service A and these trace headers are propagated from service A to further Dapr enabled services `service  A-> service B -> service C`. This is similar to above case 2.
4. Mutiple Service calls chained from single source

    When you are calling multiple services from single source, for example, all the calls to services are continuing from service A:

        service A -> service B
        [ .. some code logic ..]
        service A -> service C
        [ .. some code logic ..]
        service A -> service D
        [ .. some code logic ..]
    
    In this case, when service A first calls service B, Dapr generates trace headers in service A, and these trace headers are propagated to service B. These trace headers are returned in response of call to service B as part of response headers.

    Please go to [how to use w3c tracecontext](../../howto/use-w3c-tracecontext/README.md) and refer 
    `Passing the trace context to Dapr` section as how to extract the trace headers from response. 

    For the subsequent call to service C, you can attach the same trace headers to service C call and so on to call service D.

    Please go to [how to use w3c tracecontext](../../howto/use-w3c-tracecontext/README.md) and refer 
    `Passing the trace context to Dapr` section as how to attach the trace headers in request. 

### What Dapr does not cover

If you choose to generate your own trace context, Dapr does not provide a way to generate your own trace headers. 
You need to create trace headers and pass the trace headers to the service calls.

There are three ways to create trace headers : 
1. You can use industry standard OpenCensus/OpenTelemetry SDK to generate trace headers and pass these trace headers to Dapr enabled service. 
Dapr uses the same trace context and pass it to other services. This is Dapr team recommendation.
2. You can use any vendor SDK that provides a way to generate W3C trace headers such as DynaTrace SDK and pass these trace headers to Dapr enabled service. Dapr uses the same trace context and propagate the trace headers to other services.
3. You can craft trace context following [W3C trace context specification](https://www.w3.org/TR/trace-context/) and pass these trace headers to Dapr enabled service. Dapr uses the same trace context and pass it to other services.

In case of multiple service calls from single source, steps to extract and attach trace headers are same as menioned in earlier section.

Please go to [how to use w3c tracecontext](../../howto/use-w3c-tracecontext/README.md) and refer 
`Create trace context` section as how to create trace headers using OpenCensus SDK - recommended way to create your own trace headers.

Please go to [how to use w3c tracecontext](../../howto/use-w3c-tracecontext/README.md) and refer 
`Passing the trace context to Dapr` section as how to extract the trace headers from response. 

For the subsequent call to service C, you can attach the same trace headers to service C call and so on to call service D.

Please go to [how to use w3c tracecontext](../../howto/use-w3c-tracecontext/README.md) and refer 
`Passing the trace context to Dapr` section as how to attach the trace headers in request. 

## Related Links

* [Observability sample](https://github.com/dapr/samples/tree/master/8.observability)
* [How-To: Set up Application Insights for distributed tracing](../../howto/use-w3c-tracecontext)
* [How-To: Set up Zipkin for distributed tracing](../../howto/diagnose-with-tracing/zipkin.md)
* [W3C trace context specification](https://www.w3.org/TR/trace-context/)
