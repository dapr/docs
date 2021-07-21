---
type: docs
title: "W3C trace context overview"
linkTitle: "Overview"
weight: 10000
description: Background and scenarios for using W3C tracing with Dapr
type: docs
---

## Introduction
Dapr uses W3C trace context for distributed tracing for both service invocation and pub/sub messaging. Largely Dapr does all the heavy lifting of generating and propogating the trace context information and this can be sent to many different diagnostics tools for visualization and querying. There are only a very few cases where you, as a developer, need to either propagate a trace header or generate one.

## Background
Distributed tracing is a methodology implemented by tracing tools to follow, analyze and debug a transaction across multiple software components. Typically, a distributed trace traverses more than one service which requires it to be uniquely identifiable. Trace context propagation passes along this unique identification.

In the past, trace context propagation has typically been implemented individually by each different tracing vendors. In multi-vendor environments, this causes interoperability problems, such as;

- Traces that are collected by different tracing vendors cannot be correlated as there is no shared unique identifier.
- Traces that cross boundaries between different tracing vendors can not be propagated as there is no uniformly agreed set of identification that is forwarded.
- Vendor specific metadata might be dropped by intermediaries.
- Cloud platform vendors, intermediaries and service providers, cannot guarantee to support trace context propagation as there is no standard to follow.

In the past, these problems did not have a significant impact as most applications were monitored by a single tracing vendor and stayed within the boundaries of a single platform provider. Today, an increasing number of applications are distributed and leverage multiple middleware services and cloud platforms.

This transformation of modern applications called for a distributed tracing context propagation standard. The [W3C trace context specification](https://www.w3.org/TR/trace-context/) defines a universally agreed-upon format for the exchange of trace context propagation data - referred to as trace context. Trace context solves the problems described above by;

* Providing an unique identifier for individual traces and requests, allowing trace data of multiple providers to be linked together.
* Providing an agreed-upon mechanism to forward vendor-specific trace data and avoid broken traces when multiple tracing tools participate in a single transaction.
* Providing an industry standard that intermediaries, platforms, and hardware providers can support.

A unified approach for propagating trace data improves visibility into the behavior of distributed applications, facilitating problem and performance analysis.

## Scenarios
There are two scenarios where you need to understand how tracing is used:
 1. Dapr generates and propagates the trace context between services.
 2. Dapr generates the trace context and you need to propagate the trace context to another service **or** you generate the trace context and Dapr propagates the trace context to a service.

### Dapr generates and propagates the trace context between services.
In these scenarios Dapr does all work for you. You do not need to create and propagate any trace headers. Dapr takes care of creating all trace headers and propogating them. Let's go through the scenarios with examples;

1. Single service invocation call (`service A -> service B` )

    Dapr generates the trace headers in service A and these trace headers are propagated from service A to service B.

2. Multiple sequential service invocation calls ( `service A -> service B -> service C`)

    Dapr generates the trace headers at the beginning of the request in service A and these trace headers are propagated from `service A-> service B -> service C` and so on to further Dapr enabled services.

3. Request is from external endpoint (`For example from a gateway service to a Dapr enabled service A`)

    Dapr generates the trace headers in service A and these trace headers are propagated from service A to further Dapr enabled services `service  A-> service B -> service C`. This is similar to above case 2.

4. Pub/sub messages
     Dapr generates the trace headers in the published message topic and these trace headers are propagated to any services listening on that topic.

### You need to propagate or generate trace context between services
In these scenarios Dapr does some of the work for you and you need to either create or propagate trace headers.

1. Multiple service calls to different services from single service

   When you are calling multiple services from a single service, for example from service A like this, you need to propagate the trace headers;

        service A -> service B
        [ .. some code logic ..]
        service A -> service C
        [ .. some code logic ..]
        service A -> service D
        [ .. some code logic ..]

    In this case, when service A first calls service B, Dapr generates the trace headers in service A, and these trace headers are then propagated to service B. These trace headers are returned in the response from service B as part of response headers. However you need to propagate the returned trace context to the next services, service C and Service D, as Dapr does not know you want to reuse the same header.

     To understand how to extract the trace headers from a response and add the trace headers into a request, see the [how to use trace context]({{< ref w3c-tracing >}}) article.

2. You have chosen to generate your own trace context headers.
This is much more unusual. There may be occasions where you specifically chose to add W3C trace headers into a service call, for example if you have an existing application that does not currently use Dapr. In this case Dapr still propagates the trace context headers for you. If you decide to generate trace headers yourself, there are three ways this can be done :

     1. You can use the industry standard OpenCensus/OpenTelemetry SDKs to generate trace headers and pass these trace headers to a Dapr enabled service. This is the preferred recommendation.

     2. You can use a vendor SDK that provides a way to generate W3C trace headers such as DynaTrace SDK and pass these trace headers to a Dapr enabled service.

     3. You can handcraft a trace context following [W3C trace context specification](https://www.w3.org/TR/trace-context/) and pass these trace headers to Dapr enabled service.

## W3C trace headers
Theses are the specific trace context headers that are generated and propagated by Dapr for HTTP and gRPC.

### Trace context HTTP headers format
When propogating a trace context header from an HTTP response to an HTTP request, these are the headers that you need to copy.

#### Traceparent Header
The traceparent header represents the incoming request in a tracing system in a common format, understood by all vendors.
Here’s an example of a traceparent header.

`traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01`

 The traceparent fields are detailed [here](https://www.w3.org/TR/trace-context/#traceparent-header)

#### Tracestate Header
The tracestate header includes the parent in a potentially vendor-specific format:

`tracestate: congo=t61rcWkgMzE`

The tracestate fields are detailed [here](https://www.w3.org/TR/trace-context/#tracestate-header)

### Trace context gRPC headers format
In the gRPC API calls, trace context is passed through `grpc-trace-bin` header.

## Related Links
- [How To set up Application Insights for distributed tracing with OpenTelemetry]({{< ref open-telemetry-collector.md >}})
- [How To set up Zipkin for distributed tracing]({{< ref zipkin.md >}})
- [W3C trace context specification](https://www.w3.org/TR/trace-context/)
- [Observability sample](https://github.com/dapr/quickstarts/tree/master/observability)
