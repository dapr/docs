# Trace calls across services 

## Contents
- [How to create trace context](#how-to-create-trace-context)

    [Go](#create-trace-context-in-go)
    [C#](#create-trace-context-in-c#)

- [How to pass trace context in Dapr request](#how-to-pass-trace-context-in-dapr-request)

    [Go](#pass-trace-context-in-go)
    [C#](#pass-trace-context-in-c#)

- [How to retrieve trace context from Dapr response](#how-to-retrieve-trace-context-from-dapr-response)

    [Go](#retrieve-trace-context-in-go)
    [C#](#retrieve-trace-context-in-c#)

- [Putting it all together with Go Sample](#putting-it-all-together-with-go-sample)
- [Related Links](#related-links)

### How to create trace context

Go through `Scenarios` section in [W3C Trace Context for distributed tracing](../../concepts/observability/W3C-traces.md) to know that Dapr covers generating trace context and you do
not need to explicitly create trace context.

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

### How to pass trace context in Dapr request

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

You can then pass this context `ctx` in Dapr gRPC calls as first parameter. For example `InvokeService`, context is passed in first parameter.

##### For HTTP calls

HTTP integration uses [Zipkin’s B3](https://github.com/openzipkin/b3-propagation) by default, but can be configured to use a custom propagation method by setting another `propagation.HTTPFormat`.

In this example, [net/http](net/http) is used for HTTP calls. 

```go
f := &HTTPFormat{}
req, _ := http.NewRequest("GET", "http://localhost:3500/v1.0/invoke/mathService/method/api/v1/add", nil)

traceContext := span.SpanContext()
f.SpanContextToRequest(traceContext, req)
```

### How to retrieve trace context from Dapr response

#### Retrieve trace context in Go
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

Let's go through an example using the [grpc app](../create-grpc-app) with Go SDK.

#### 1. Get the OpenCensus Go SDK 

Prerequisites: OpenCensus Go libraries require Go 1.8 or later. For details on installation go [here](https://pkg.go.dev/go.opencensus.io?tab=overview).

#### 2. Import the package "go.opencensus.io/trace"
`$ go get -u go.opencensus.io`

#### 3. Create trace context

When you want to pass the trace context, you are starting the trace spans. Since a distributed trace tracks the progression of a single user request as it is handled by the services and processes that make up an application, each step is called a `span` in the trace. Spans include metadata about the step, including the time spent in the step, called the span’s latency.

Span is the unit step in a trace. Each span has a name, latency, status and additional metadata.

The code belows shows starting a span for a cache read and ending it when done:

```go
ctx, span := trace.StartSpan(ctx, "cache.Get")
defer span.End()

// Do work to get from cache.
```

The `StartSpan` call returns two values. If you want to propagate trace context within your calls in the same process, you can use `context.Context` to propagate spans. The returned `span` has the fields 'TraceID' and 'SpanID'.  You can read more on these fields usage [here](https://opencensus.io/tracing/span/)

When you call the Dapr API through HTTP/gRPC, you need to pass the trace context across processes or services. Across the network, OpenCensus provides different propagation methods for different protocols. You can read about the propagation package [here](https://godoc.org/go.opencensus.io/trace/propagation).

In our example, since these are gRPC calls, the OpenCensus binary propagation format is used.

#### 4. Passing the trace context to Dapr 

##### For gRPC calls
First import the package 'go.opencensus.io/trace/propagation'. 
Once imported, get the span context from the generated span (as mentioned in above step 3), and convert it to OpenCensus binary propagation format.

```go
traceContext := span.SpanContext()
traceContextBinary := propagation.Binary(traceContext)
 ```

You can then pass the trace context through [gRPC metadata]("google.golang.org/grpc/metadata") through `grpc-trace-bin` header.

```go
ctx = metadata.AppendToOutgoingContext(ctx, "grpc-trace-bin", string(traceContextBinary))
```

You can then pass this context `ctx` in Dapr gRPC calls as first parameter. For example `InvokeService`, context is passed in first parameter.

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

##### HTTP calls

HTTP integration uses [Zipkin’s B3](https://github.com/openzipkin/b3-propagation) by default, but can be configured to use a custom propagation method by setting another `propagation.HTTPFormat`.

For control over HTTP client headers, redirect policy, and other settings, you  create a client. In this example, [net/http](net/http) is used for HTTP calls. 

```go
f := &HTTPFormat{}
req, _ := http.NewRequest("GET", "http://localhost:3500/v1.0/invoke/mathService/method/api/v1/add", nil)

traceContext := span.SpanContext()
f.SpanContextToRequest(traceContext, req)
```

To retrieve the trace context when the HTTP request is returned, you can use :

```go
sc, ok := f.SpanContextFromRequest(req)
```

See the [Dapr API reference](https://github.com/dapr/docs/tree/master/reference/api).

### Configuring tracing in Dapr
To enable tracing in Dapr, you need to first configure tracing. 
Create adeployment config yaml e.g. `appconfig.yaml` with following configuration.

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

### Viewing traces

To view traces, you need to deploy OpenCensus supported exporters. This is independent of Dapr configuration.
Read [how-to-diagnose-with-tracing](../diagnose-with-tracing) to set up trace exporters. 

### Invoking Dapr with trace context

As mentioned earlier in the [section](#Using-Trace-Context-in-Dapr), you can create the trace context and pass it when calling Dapr, or Dapr can generate trace context and pass it back to you. 

If you choose to pass the trace context explicitly, then Dapr will use the passed trace context and propagate all across the HTTP/gRPC call.

Using the [grpc app](../create-grpc-app) in the example and putting this all together, the following steps show you how to create a Dapr client and call the Save State operation passing the trace context:

The Rest code snippet and details, refer to the [grpc app](../create-grpc-app).

#### 1. Import the package

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

#### 2. Create the client

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

#### 3. Invoke the InvokeService method With Trace Context

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

