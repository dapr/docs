# W3C Trace Context - Background

Distributed tracing is a methodology implemented by tracing tools to follow, analyze and debug a transaction across multiple software components. Typically, a distributed trace traverses more than one component which requires it to be uniquely identifiable across all participating systems. Trace context propagation passes along this unique identification. Today, trace context propagation is implemented individually by each tracing vendor. In multi-vendor environments, this causes interoperability problems, like:

Traces that are collected by different tracing vendors cannot be correlated as there is no shared unique identifier.
Traces that cross boundaries between different tracing vendors can not be propagated as there is no uniformly agreed set of identification that is forwarded.
Vendor specific metadata might be dropped by intermediaries.
Cloud platform vendors, intermediaries and service providers, cannot guarantee to support trace context propagation as there is no standard to follow.
In the past, these problems did not have a significant impact as most applications were monitored by a single tracing vendor and stayed within the boundaries of a single platform provider. Today, an increasing number of applications are highly distributed and leverage multiple middleware services and cloud platforms.

This transformation of modern applications calls for a distributed tracing context propagation standard.

W3C trace context specification defines a universally agreed-upon format for the exchange of trace context propagation data - referred to as trace context. Trace context solves the problems described above by

* providing an unique identifier for individual traces and requests, allowing trace data of multiple providers to be linked together.
* providing an agreed-upon mechanism to forward vendor-specific trace data and avoid broken traces when multiple tracing tools participate in a single transaction.
 * providing an industry standard that intermediaries, platforms, and hardware providers can support.

A unified approach for propagating trace data improves visibility into the behavior of distributed applications, facilitating problem and performance analysis. The interoperability provided by trace context is a prerequisite to manage modern micro-service based applications.

Please refer complete W3C context specifications [here](https://www.w3.org/TR/trace-context/).

## W3C Trace Headers

### Trace Context HTTP Headers Format

#### Traceparent Header

The traceparent header represents the incoming request in a tracing system in a common format, understood by all vendors. 
Here’s an example of a traceparent header.

`traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01`

Please refer traceparent fields details [here](https://www.w3.org/TR/trace-context/#traceparent-header)

#### Tracestate Header

The tracestate header includes the parent in a potentially vendor-specific format:

`tracestate: congo=t61rcWkgMzE`

Please refer tracestate fields details [here](https://www.w3.org/TR/trace-context/#tracestate-header)

### Trace Context gRPC Headers Format

In the gRPC API calls, trace context is passed through `grpc-trace-bin` header.


## Using Trace Context in Dapr

Dapr tracing is built on  [OpenCensus](https://opencensus.io/introduction/) specifications that supports official W3C HTTP tracing header.
For the gRPC tracing , [here](https://github.com/census-instrumentation/opencensus-specs/blob/master/trace/gRPC.md) is more details with OpenCensus.

Dapr provides in built support of OpenCensus instrmentation of services when tracing configuration is enabled through Dapr annotation.
Once the tracing configuration is applied, you will get full instrumentation of traces and you can retrieve the trace correlation id from the standard
W3C Context headers as outlined earlier.

However if you choose to pass the trace context explictly, then Dapr will use the passed trace context and propagate all across the HTTP/gRPC call.

## How to pass Trace Context

Since Dapr tracing is built on OpenCensus, user needs to send trace context using OpenCensus SDK.
OpenCensus supports majority of languages.

| Language | SDK |
|:-------:|:----:|
| Go | [Link](https://pkg.go.dev/go.opencensus.io?tab=overview)
| Java | [Link](https://www.javadoc.io/doc/io.opencensus/opencensus-api/latest/index.html)
| C# | [Link](https://github.com/census-instrumentation/opencensus-csharp/)
| C++ | [Link](https://github.com/census-instrumentation/opencensus-cpp)
| Node.js | [Link](https://github.com/census-instrumentation/opencensus-node)
| Python | [Link](https://census-instrumentation.github.io/opencensus-python/trace/api/index.html)

For the purpose of example, we will use the same [grpc app](../create-grpc-app) based on Go SDK.

### Get the OpenCensus Go SDK 

Prerequisites: OpenCensus Go libraries require Go 1.8 or later. For details on installation and prerequisties, refer [here](https://pkg.go.dev/go.opencensus.io?tab=overview).

`$ go get -u go.opencensus.io`

1. import the package "go.opencensus.io/trace"
2. Create trace context

When you want to pass the trace context , you will be starting the trace spans. At high level, since a distributed trace tracks the progression of a single user request as it is handled by the services and processes that make up an application. Each step is called a span in the trace. Spans include metadata about the step, including especially the time spent in the step, called the span’s latency.

So Span is the unit step in a trace. Each span has a name, latency, status and additional metadata.

Below we are starting a span for a cache read and ending it when we are done:

```go
ctx, span := trace.StartSpan(ctx, "cache.Get")
defer span.End()

// Do work to get from cache.
```

The StartSpan call returns 2 values. If you want to propagate trace context within your calls in the same process, you can use `context.Context` to propagate spans.
The returned `span` has the fields 'TraceID' and 'SpanID'. 

You can read more on these fields usage and details [here](https://opencensus.io/tracing/span/)

When you call the Dapr API through HTTP/gRPC, you need to pass the trace context across process. For across the network, OpenCensus provides different propagation methods for different protocols. You can read about the propagation package [here](https://godoc.org/go.opencensus.io/trace/propagation).

In our example, we will use gRPC calls , for that OpenCensus’ binary propagation format is used.

3. Passing the trace context to Dapr 

#### gRPC calls
You need to import the package 'go.opencensus.io/trace/propagation'. 
Once imported, get the span context from the generated span (as mentioned in above step 2), and convert it to OpenCensus binary propagation format.

```go
traceContext := span.SpanContext()
traceContextBinary := propagation.Binary(traceContext)
 ```

You can then pass the trace context through [gRPC metadata]("google.golang.org/grpc/metadata") through 'grpc-trace-bin` header.

```go
ctx = metadata.AppendToOutgoingContext(ctx, "grpc-trace-bin", string(traceContextBinary))
```

You can then pass this context `ctx` in Dapr gRPC calls as first parameter. For example `InvokeService`, context is passed in first parameter.

#### HTTP calls

HTTP integrations use Zipkin’s [B3](https://github.com/openzipkin/b3-propagation) by default but can be configured to use a custom propagation method by setting another propagation.HTTPFormat.

For control over HTTP client headers, redirect policy, and other settings, you need to create a Client:
For this example, [net/http] (net/http) is used for HTTP calls. 

```go
f := &HTTPFormat{}
req, _ := http.NewRequest("GET", "http://localhost:3500/v1.0/invoke/mathService/method/api/v1/add", nil)

traceContext := span.SpanContext()
f.SpanContextToRequest(traceContext, req)
```

Please go here for [Dapr API reference](https://github.com/dapr/docs/tree/master/reference/api).

## Configuring Tracing in Dapr
As mentioned earlier, in this tracing example, we are using the same [grpc app](../create-grpc-app).

So to enable tracing in Dapr, you need to first configure tracing in Dapr. 
You can create deployment config yaml e.g. `appconfig.yaml` with following configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  tracing:
    samplingRate: "1"
```

In Kubernetes, you can apply the configuration as below :

```bash
kubectl apply -f appconfig.yaml
```

You then set the following tracing annotation in your deployment YAML. You can add the following annotaion in sample [grpc app](../create-grpc-app) deployment yaml.

```yaml
dapr.io/config: "appconfig"
```

That't it from Dapr side configuration. 

To view traces, you need to deploy OpenCensus supported exporters. This is independent of Dapr configuration.
You can refer [how-to-diagnose-with-tracing](../diagnose-with-tracing) to set up trace exporters. 

## Invoking Dapr With Trace Context

As mentioned earlier in the [section](#Using-Trace-Context-in-Dapr), you can create the trace context and pass it through when calling Dapr or Dapr can generate trace context passed it back to you. 

If you choose to pass the trace context explictly, then Dapr will use the passed trace context and propagate all across the HTTP/gRPC call.
We are using the same [grpc app](../create-grpc-app), however listing out the complete code for putting it all together.

The following steps will only show you how to create a Dapr client and call the Save State operation when user is passing the trace context:
Rest code snippet and details , refer the same [grpc app](../create-grpc-app).

1. Import the package

```go
package main

import (
    pb "github.com/dapr/go-sdk/dapr"
    "go.opencensus.io/trace"
	  "go.opencensus.io/trace/propagation"
	  "google.golang.org/grpc"
	  "google.golang.org/grpc/metadata"
)
```

2. Create the client

```go
  // Get the Dapr port and create a connection
  daprPort := os.Getenv("DAPR_GRPC_PORT")
  daprAddress := fmt.Sprintf("localhost:%s", daprPort)
  conn, err := grpc.Dial(daprAddress, grpc.WithInsecure())
  if err != nil {
    fmt.Println(err)
  }
  defer conn.Close()

  // Create the client
  client := pb.NewDaprClient(conn)
```

3. Invoke the InvokeService method With Trace Context

```go
  // Create the Trace Context
  ctx , span := trace.StartSpan(context.Background(), "InvokeService")

  // The returned context can be used to keep propagating the newly created span in the current context.
  // In the same process, context.Context is used to propagate trace context.

  // Across the process, use the propagation format of Trace Context to propagate trace context.
  traceContext := propagation.Binary(span.SpanContext())
  ctx = metadata.NewOutgoingContext(ctx, string(traceContext))

  // Pass the trace context
  resp, err := client.InvokeService(ctx, &pb.InvokeServiceRequest{
		Id: "client",
		Message: &commonv1pb.InvokeRequest{
			Method:      "MyMethod",
			ContentType: "text/plain; charset=UTF-8",
			Data:        &any.Any{Value: []byte("Hello")},
		},
	})
```

That's it !. Now you can correlate the calls in your app and in Dapr across services using the same trace context.

To view traces, you can refer [how-to-diagnose-with-tracing](../diagnose-with-tracing) e.g Zipkin/Application Insights. 

