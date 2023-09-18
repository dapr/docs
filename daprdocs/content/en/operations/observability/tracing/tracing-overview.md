---
type: docs
title: "Distributed tracing overview"
linkTitle: "Overview"
weight: 10
description: "Overview on using tracing to get visibility into your application"
---

Dapr uses the Open Telemetry (OTEL) and Zipkin protocols for distributed traces. OTEL is the industry standard and is the recommended trace protocol to use. 

Most observability tools support OTEL, including:
- [Google Cloud Operations](https://cloud.google.com/products/operations)
- [AWS X-ray](https://aws.amazon.com/xray/)
- [New Relic](https://newrelic.com)
- [Azure Monitor](https://azure.microsoft.com/services/monitor/)
- [Datadog](https://www.datadoghq.com)
- [Zipkin](https://zipkin.io/)
- [Jaeger](https://www.jaegertracing.io/)
- [SignalFX](https://www.signalfx.com/)

The following diagram demonstrates how Dapr (using OTEL and Zipkin protocols) integrates with multiple observability tools.

<img src="/images/observability-tracing.png" width=1000 alt="Distributed tracing with Dapr">

## Scenarios

Tracing is used with service invocaton and pub/sub APIs. You can flow trace context between services that uses these APIs. There are two scenarios for how tracing is used:

 1. Dapr generates the trace context and you propagate the trace context to another service.
 1. You generate the trace context and Dapr propagates the trace context to a service.

### Scenario 1: Dapr generates trace context headers

#### Propagating sequential service calls

Dapr takes care of creating the trace headers. However, when there are more than two services, you're responsible for propagating the trace headers between them. Let's go through the scenarios with examples:

##### Single service invocation call

For example, `service A -> service B`.

Dapr generates the trace headers in `service A`, which are then propagated from `service A` to `service B`. No further propagation is needed. 

##### Multiple sequential service invocation calls 

For example, `service A -> service B -> propagate trace headers to -> service C` and so on to further Dapr-enabled services.

Dapr generates the trace headers at the beginning of the request in `service A`, which are then propagated to `service B`. You are now responsible for taking the headers and propagating them to `service C`, since this is specific to your application. 

In other words, if the app is calling to Dapr and wants to trace with an existing trace header (span), it must always propagate to Dapr (from `service B` to `service C`, in this example). Dapr always propagates trace spans to an application.

{{% alert title="Note" color="primary" %}}
No helper methods are exposed in Dapr SDKs to propagate and retrieve trace context. You need to use HTTP/gRPC clients to propagate and retrieve trace headers through HTTP headers and gRPC metadata.
{{% /alert %}}

##### Request is from external endpoint

For example, `from a gateway service to a Dapr-enabled service A`.

An external gateway ingress calls Dapr, which generates the trace headers and calls `service A`. `Service A` then calls `service B` and further Dapr-enabled services. 

You must propagate the headers from `service A` to `service B`. For example: `Ingress -> service A -> propagate trace headers -> service B`. This is similar to [case 2]({{< ref "tracing-overview.md#multiple-sequential-service-invocation-calls" >}}).

##### Pub/sub messages

Dapr generates the trace headers in the published message topic. These trace headers are propagated to any services listening on that topic.

#### Propagating multiple different service calls

In the following scenarios, Dapr does some of the work for you, with you then creating or propagating trace headers.

##### Multiple service calls to different services from single service

When you are calling multiple services from a single service, you need to propagate the trace headers. For example:

```
service A -> service B
[ .. some code logic ..]
service A -> service C
[ .. some code logic ..]
service A -> service D
[ .. some code logic ..]
```

In this case:
1. When `service A` first calls `service B`, Dapr generates the trace headers in `service A`. 
1. The trace headers in `service A` are propagated to `service B`. 
1. These trace headers are returned in the response from `service B` as part of response headers. 
1. You then need to propagate the returned trace context to the next services, like `service C` and `service D`, as Dapr does not know you want to reuse the same header.

### Scenario 2: You generate your own trace context headers from non-Daprized applications

Generating your own trace context headers is more unusual and typically not required when calling Dapr. 

However, there are scenarios where you could specifically choose to add W3C trace headers into a service call. For example, you have an existing application that does not use Dapr. In this case, Dapr still propagates the trace context headers for you. 

If you decide to generate trace headers yourself, there are three ways this can be done:

1. Standard OpenTelemetry SDK

   You can use the industry standard [OpenTelemetry SDKs](https://opentelemetry.io/docs/instrumentation/) to generate trace headers and pass these trace headers to a Dapr-enabled service. _This is the preferred method_.

1. Vendor SDK

   You can use a vendor SDK that provides a way to generate W3C trace headers and pass them to a Dapr-enabled service.

1. W3C trace context

   You can handcraft a trace context following [W3C trace context specifications](https://www.w3.org/TR/trace-context/) and pass them to a Dapr-enabled service. 
   
   Read [the trace context overview]({{< ref w3c-tracing-overview >}}) for more background and examples on W3C trace context and headers.

## Related Links

- [Observability concepts]({{< ref observability-concept.md >}})
- [W3C Trace Context for distributed tracing]({{< ref w3c-tracing-overview >}})
- [W3C Trace Context specification](https://www.w3.org/TR/trace-context/)
- [Observability quickstart](https://github.com/dapr/quickstarts/tree/master/tutorials/observability)
