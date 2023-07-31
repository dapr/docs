---
type: docs
title: "Distributed tracing"
linkTitle: "Distributed tracing"
weight: 100
description: "Use tracing to get visibility into your application"
---

Dapr uses the Open Telemetry (OTEL) and Zipkin protocols for distributed traces. OTEL is the industry standard and is the recommended trace protocol to use. 

 Most observability tools support OTEL. For example [Google Cloud Operations](https://cloud.google.com/products/operations), [New Relic](https://newrelic.com), [Azure Monitor](https://azure.microsoft.com/services/monitor/), [Datadog](https://www.datadoghq.com), Instana, [Jaeger](https://www.jaegertracing.io/), and [SignalFX](https://www.signalfx.com/).

## Scenarios
Tracing is used with service invocaton and pub/sub APIs. You can flow trace context between services that uses these APIs. 

There are two scenarios for how tracing is used:

 1. Dapr generates the trace context and you propagate the trace context to another service.
 2. You generate the trace context and Dapr propagates the trace context to a service.

### Propagating sequential service calls

Dapr takes care of creating the trace headers. However, when there are more than two services, you're responsible for propagating the trace headers between them. Let's go through the scenarios with examples:

1. Single service invocation call (`service A -> service B`)

    Dapr generates the trace headers in service A, which are then propagated from service A to service B. No further propagation is needed. 

2. Multiple sequential service invocation calls ( `service A -> service B -> service C`)

    Dapr generates the trace headers at the beginning of the request in service A, which are then propagated to service B. You are now responsible for taking the headers and propagating them to service C, since this is specific to your application. 
    
     `service A -> service B -> propagate trace headers to -> service C` and so on to further Dapr-enabled services.

     In other words, if the app is calling to Dapr and wants to trace with an existing span (trace header), it must always propagate to Dapr (from service B to service C in this case). Dapr always propagates trace spans to an application.

{{% alert title="Note" color="primary" %}}
There are no helper methods exposed in Dapr SDKs to propagate and retrieve trace context. You need to use HTTP/gRPC clients to propagate and retrieve trace headers through HTTP headers and gRPC metadata.
{{% /alert %}}

3. Request is from external endpoint (for example, `from a gateway service to a Dapr-enabled service A`)

    An external gateway ingress calls Dapr, which generates the trace headers and calls service A. Service A then calls service B and further Dapr-enabled services. You must propagate the headers from service A to service B: `Ingress -> service A -> propagate trace headers -> service B`. This is similar to case 2 above.

4. Pub/sub messages
     Dapr generates the trace headers in the published message topic. These trace headers are propagated to any services listening on that topic.

### Propagating multiple different service calls

In the following scenarios, Dapr does some of the work for you and you need to either create or propagate trace headers.

1. Multiple service calls to different services from single service

   When you are calling multiple services from a single service (see example below), you need to propagate the trace headers:

        ```
        service A -> service B
        [ .. some code logic ..]
        service A -> service C
        [ .. some code logic ..]
        service A -> service D
        [ .. some code logic ..]
        ```

    In this case, when service A first calls service B, Dapr generates the trace headers in service A, which are then propagated to service B. These trace headers are returned in the response from service B as part of response headers. You then need to propagate the returned trace context to the next services, service C and service D, as Dapr does not know you want to reuse the same header.

### Generating your own trace context headers from non-Daprized applications

You may have chosen to generate your own trace context headers.
Generating your own trace context headers is more unusual and typically not required when calling Dapr. However, there are scenarios where you could specifically choose to add W3C trace headers into a service call; for example, you have an existing application that does not use Dapr. In this case, Dapr still propagates the trace context headers for you. If you decide to generate trace headers yourself, there are three ways this can be done:

1. You can use the industry standard [OpenTelemetry SDKs](https://opentelemetry.io/docs/instrumentation/) to generate trace headers and pass these trace headers to a Dapr-enabled service. This is the preferred method.

2. You can use a vendor SDK that provides a way to generate W3C trace headers and pass them to a Dapr-enabled service.

3. You can handcraft a trace context following [W3C trace context specifications](https://www.w3.org/TR/trace-context/) and pass them to a Dapr-enabled service.

## W3C trace context

Dapr uses the standard W3C trace context headers. 

- For HTTP requests, Dapr uses `traceparent` header. 
- For gRPC requests, Dapr uses `grpc-trace-bin` header. 

When a request arrives without a trace ID, Dapr creates a new one. Otherwise, it passes the trace ID along the call chain.

Read [trace context overview]({{< ref w3c-tracing-overview >}}) for more background on W3C trace context.

## W3C trace headers
These are the specific trace context headers that are generated and propagated by Dapr for HTTP and gRPC.

### Trace context HTTP headers format
When propagating a trace context header from an HTTP response to an HTTP request, you copy these headers.

#### Traceparent header
The traceparent header represents the incoming request in a tracing system in a common format, understood by all vendors.
Here’s an example of a traceparent header.

`traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01`

 Find the traceparent fields detailed [here](https://www.w3.org/TR/trace-context/#traceparent-header).

#### Tracestate header
The tracestate header includes the parent in a potentially vendor-specific format:

`tracestate: congo=t61rcWkgMzE`

Find the tracestate fields detailed [here](https://www.w3.org/TR/trace-context/#tracestate-header).

### Trace context gRPC headers format
In the gRPC API calls, trace context is passed through `grpc-trace-bin` header.

## Related Links

- [Observability concepts]({{< ref observability-concept.md >}})
- [W3C Trace Context for distributed tracing]({{< ref w3c-tracing-overview >}})
- [W3C Trace Context specification](https://www.w3.org/TR/trace-context/)
- [Observability quickstart](https://github.com/dapr/quickstarts/tree/master/tutorials/observability)
