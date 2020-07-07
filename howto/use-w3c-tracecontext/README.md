# How to use Trace Context

## Contents
- [How to create trace context](#how-to-create-trace-context)

    [Go](#create-trace-context-in-go)
    [Java](#create-trace-context-in-java)
    [Python](#create-trace-context-in-python)
    [NodeJS](#create-trace-context-in-nodejs)
    [C++](#create-trace-context-in-c++)
    [C#](#create-trace-context-in-c#)

- [How to pass trace context in Dapr request](#how-to-pass-trace-context-in-dapr-request)

    [Go](#pass-trace-context-in-go)

- [How to retrieve trace context from Dapr response](#how-to-retrieve-trace-context-from-dapr-response)

    [Go](#retrieve-trace-context-in-go)

- [Putting it all together with Go Sample](#putting-it-all-together-with-go-sample)
- [Related Links](#related-links)

### How to create trace context

Go through `Scenarios` section in [W3C Trace Context for distributed tracing](../../concepts/observability/W3C-traces.md) to know that Dapr covers generating trace context and you do not need to explicitly create trace context.

If you choose to create your own trace context, then please read further as how to create trace context otherwise you can skip this section.

You create a trace context using recommended OpenCensus SDK. OpenCensus supports several different programming languages.

| Language | SDK |
|:-------:|:----:|
| Go | [Link](https://pkg.go.dev/go.opencensus.io?tab=overview)
| Java | [Link](https://www.javadoc.io/doc/io.opencensus/opencensus-api/latest/index.html)
| C# | [Link](https://github.com/census-instrumentation/opencensus-csharp/)
| C++ | [Link](https://github.com/census-instrumentation/opencensus-cpp)
| Node.js | [Link](https://github.com/census-instrumentation/opencensus-node)
| Python | [Link](https://census-instrumentation.github.io/opencensus-python/trace/api/index.html)

#### Create trace context in Go

##### 1. Get the OpenCensus Go SDK 

Prerequisites: OpenCensus Go libraries require Go 1.8 or later. For details on installation go [here](https://pkg.go.dev/go.opencensus.io?tab=overview).

##### 2. Import the package "go.opencensus.io/trace"
`$ go get -u go.opencensus.io`

##### 3. Create trace context

```go
ctx, span := trace.StartSpan(ctx, "cache.Get")
defer span.End()

// Do work to get from cache.
```

##### Create trace context in Java

```java
try (Scope ss = TRACER.spanBuilder("cache.Get").startScopedSpan()) {
}
```

##### Create trace context in Python

```python
with tracer.span(name="cache.get") as span:
    pass
```

##### Create trace context in NodeJS

```nodejs
tracer.startRootSpan({name: 'cache.Get'}, rootSpan => {
});
```

##### Create trace context in C++

```cplusplus
opencensus::trace::Span span = opencensus::trace::Span::StartSpan(
                                            "cache.Get", nullptr, {&sampler});
```

##### Create trace context in C#

```csharp
var span = tracer.SpanBuilder("cache.Get").StartScopedSpan();
```

### How to pass trace context in Dapr request

`Note: Currently there are no helper methods exposed in Dapr SDKs to pass and retrieve trace context. You need to use raw http/gRPC clients to pass and retrieve trace headers through http headers and gRPC metadata.`

#### Pass trace context in Go

##### For gRPC calls

```go
traceContext := span.SpanContext()
traceContextBinary := propagation.Binary(traceContext)
 ```

You can then pass the trace context through [gRPC metadata]("google.golang.org/grpc/metadata") through `grpc-trace-bin` header.

```go
ctx = metadata.AppendToOutgoingContext(ctx, "grpc-trace-bin", string(traceContextBinary))
```

You can then continuing passing this go context `ctx` in subsequent Dapr gRPC calls as first parameter. For example `InvokeService`, context is passed in first parameter.

##### For HTTP calls

OpenCensus Go SDK provides [ochttp](https://pkg.go.dev/go.opencensus.io/plugin/ochttp/propagation/tracecontext?tab=doc) package provides methods to attach trace context to the http request and also retrieve trace context from http response.

```go
f := tracecontext.HTTPFormat{}
req, _ := http.NewRequest("GET", "http://localhost:3500/v1.0/invoke/mathService/method/api/v1/add", nil)

traceContext := span.SpanContext()
f.SpanContextToRequest(traceContext, req)
```

### How to retrieve trace context from Dapr response

`Note: Currently there are no helper methods exposed in Dapr SDKs to pass and retrieve trace context. You need to use raw http/gRPC clients to pass and retrieve trace headers through http headers and gRPC metadata.`

##### Retrieve trace context in Go
##### For gRPC calls
To retrieve the trace context header when the gRPC call  is returned, you can pass the response header reference as gRPC call option which contains response headers: 

```go
var responseHeader metadata.MD

// Call the InvokeService with call option
// grpc.Header(&responseHeader)

client.InvokeService(ctx, &pb.InvokeServiceRequest{
		Id: "client",
		Message: &commonv1pb.InvokeRequest{
			Method:      "MyMethod",
			ContentType: "text/plain; charset=UTF-8",
			Data:        &any.Any{Value: []byte("Hello")},
		},
	},
	grpc.Header(&responseHeader))
```
##### For HTTP calls

To retrieve the trace context when the HTTP request is returned, you can use :

```go
sc, ok := f.SpanContextFromRequest(req)
```

### Putting it all together with Go Sample

##### Configure tracing in Dapr
First you need to enable tracing configuration in Dapr. This step is mentioned for completeness from enabling tracing to invoking Dapr with trace context.
Create a deployment config yaml e.g. `appconfig.yaml` with following configuration.

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

##### Invoking Dapr with trace context

As mentioned in `Scenarios` section in [W3C Trace Context for distributed tracing](../../concepts/observability/W3C-traces.md) that Dapr covers generating trace context and you do not need to explicitly create trace context.

However if you choose to pass the trace context explicitly, then Dapr will use the passed trace context and propagate all across the HTTP/gRPC call.

Using the [grpc app](../create-grpc-app) in the example and putting this all together, the following steps show you how to create a Dapr client and call the InvokeService method passing the trace context:

The Rest code snippet and details, refer to the [grpc app](../create-grpc-app).

##### 1. Import the package

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

##### 2. Create the client

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

##### 3. Invoke the InvokeService method With Trace Context

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

That's it !. Now you can correlate the calls in your app and across services with Dapr using the same trace context.

To view traces, you can refer [how-to-diagnose-with-tracing](../diagnose-with-tracing) 

## Related Links

* [Observability concepts](../../concepts/observability/traces.md)
* [Observability sample](https://github.com/dapr/samples/tree/master/8.observability)
* [W3C Trace Context for distributed tracing](../../concepts/observability/W3C-traces.md)
* [How-To: Set up Application Insights for distributed tracing](../../howto/diagnose-with-tracing/azure-monitor.md)
* [How-To: Set up Zipkin for distributed tracing](../../howto/diagnose-with-tracing/zipkin.md)
* [W3C trace context specification](https://www.w3.org/TR/trace-context/)

