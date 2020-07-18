# How to use trace context
Dapr uses W3C trace context for distributed tracing for both service invocation and pub/sub messaging. Dapr does all the heavy lifting of generating and propagating the trace context information and there are very few cases where you need to either propagate or create a trace context. First read scenarios in the [W3C trace context for distributed tracing](../../concepts/observability/W3C-traces.md) article to understand whether you need to propagate or create a trace context.

To view traces, read the [how to diagnose with tracing](../diagnose-with-tracing) article.

## Contents
- [How to retrieve trace context from a response](#how-to-retrieve-trace-context-from-a-response)
- [How to propagate trace context in a request](#how-to-propagate-trace-context-in-a-request)
- [How to create trace context](#how-to-create-trace-context)
    - [Go](#create-trace-context-in-go)
    - [Java](#create-trace-context-in-java)
    - [Python](#create-trace-context-in-python)
    - [NodeJS](#create-trace-context-in-nodejs)
    - [C++](#create-trace-context-in-c++)
    - [C#](#create-trace-context-in-c#)
- [Putting it all together with a Go Sample](#putting-it-all-together-with-a-go-sample)
- [Related Links](#related-links)

## How to retrieve trace context from a response
`Note: There are no helper methods exposed in Dapr SDKs to propagate and retrieve trace context. You need to use http/gRPC clients to propagate and retrieve trace headers through http headers and gRPC metadata.`

### Retrieve trace context in Go
#### For HTTP calls
OpenCensus Go SDK provides [ochttp](https://pkg.go.dev/go.opencensus.io/plugin/ochttp/propagation/tracecontext?tab=doc) package that provides methods to retrieve trace context from http response.

To retrieve the trace context from HTTP response, you can use :

```go
f := tracecontext.HTTPFormat{}
sc, ok := f.SpanContextFromRequest(req)
```
#### For gRPC calls
To retrieve the trace context header when the gRPC call is returned, you can pass the response header reference as gRPC call option which contains response headers: 

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

### Retrieve trace context in C#
#### For HTTP calls
To retrieve the trace context from HTTP response, you can use [.NET API](https://docs.microsoft.com/en-us/dotnet/api/system.net.http.headers.httpresponseheaders?view=netcore-3.1) :

```csharp
// client is HttpClient. req is HttpRequestMessage
HttpResponseMessage response = await client.SendAsync(req);
IEnumerable<string> values1, values2;
string traceparentValue = "";
string tracestateValue = "";
if (response.Headers.TryGetValues("traceparent", out values1))
{
    traceparentValue = values1.FirstOrDefault();
}
if (response.Headers.TryGetValues("tracestate", out values2))
{
    tracestateValue = values2.FirstOrDefault();
}
```

#### For gRPC calls
To retrieve the trace context from gRPC response, you can use [Grpc.Net.Client](https://www.nuget.org/packages/Grpc.Net.Client) ResponseHeadersAsync method.

```csharp
// client is Dapr proto client
using var call = client.InvokeServiceAsync(req);
var response = await call.ResponseAsync;
var headers = await call.ResponseHeadersAsync();
var tracecontext = headers.First(e => e.Key == "grpc-trace-bin");
```
Additional general details on calling gRPC services with .NET client [here](https://docs.microsoft.com/en-us/aspnet/core/grpc/client?view=aspnetcore-3.1).

## How to propagate trace context in a request
`Note: There are no helper methods exposed in Dapr SDKs to propagate and retrieve trace context. You need to use http/gRPC clients to propagate and retrieve trace headers through http headers and gRPC metadata.`

### Pass trace context in Go
#### For HTTP calls
OpenCensus Go SDK provides [ochttp](https://pkg.go.dev/go.opencensus.io/plugin/ochttp/propagation/tracecontext?tab=doc) package that provides methods to attach trace context in http request.

```go
f := tracecontext.HTTPFormat{}
req, _ := http.NewRequest("GET", "http://localhost:3500/v1.0/invoke/mathService/method/api/v1/add", nil)

traceContext := span.SpanContext()
f.SpanContextToRequest(traceContext, req)
```

#### For gRPC calls

```go
traceContext := span.SpanContext()
traceContextBinary := propagation.Binary(traceContext)
 ```
 
You can then pass the trace context through [gRPC metadata]("google.golang.org/grpc/metadata") through `grpc-trace-bin` header.

```go
ctx = metadata.AppendToOutgoingContext(ctx, "grpc-trace-bin", string(traceContextBinary))
```

You can then continuing passing this go context `ctx` in subsequent Dapr gRPC calls as first parameter. For example `InvokeService`, context is passed in first parameter.

### Pass trace context in C#
#### For HTTP calls
To pass trace context in HTTP request, you can use [.NET API](https://docs.microsoft.com/en-us/dotnet/api/system.net.http.headers.httprequestheaders?view=netcore-3.1) :

```csharp
// client is HttpClient. req is HttpRequestMessage
req.Headers.Add("traceparent", traceparentValue);
req.Headers.Add("tracestate", tracestateValue);
HttpResponseMessage response = await client.SendAsync(req);
```

#### For gRPC calls
To pass the trace context in gRPC call metadata, you can use [Grpc.Net.Client](https://www.nuget.org/packages/Grpc.Net.Client) ResponseHeadersAsync method.

```csharp
// client is Dapr.Client.Autogen.Grpc.v1
var headers = new Metadata();
headers.Add("grpc-trace-bin", tracecontext);
using var call = client.InvokeServiceAsync(req, headers);
```
Additional general details on calling gRPC services with .NET client [here](https://docs.microsoft.com/en-us/aspnet/core/grpc/client?view=aspnetcore-3.1).

## How to create trace context
You can create a trace context using the recommended OpenCensus SDKs. OpenCensus supports several different programming languages.

| Language | SDK |
|:-------:|:----:|
| Go | [Link](https://pkg.go.dev/go.opencensus.io?tab=overview)
| Java | [Link](https://www.javadoc.io/doc/io.opencensus/opencensus-api/latest/index.html)
| C# | [Link](https://github.com/census-instrumentation/opencensus-csharp/)
| C++ | [Link](https://github.com/census-instrumentation/opencensus-cpp)
| Node.js | [Link](https://github.com/census-instrumentation/opencensus-node)
| Python | [Link](https://census-instrumentation.github.io/opencensus-python/trace/api/index.html)

### Create trace context in Go

#### 1. Get the OpenCensus Go SDK 

Prerequisites: OpenCensus Go libraries require Go 1.8 or later. For details on installation go [here](https://pkg.go.dev/go.opencensus.io?tab=overview).

#### 2. Import the package "go.opencensus.io/trace"
`$ go get -u go.opencensus.io`

#### 3. Create trace context

```go
ctx, span := trace.StartSpan(ctx, "cache.Get")
defer span.End()

// Do work to get from cache.
```

### Create trace context in Java

```java
try (Scope ss = TRACER.spanBuilder("cache.Get").startScopedSpan()) {
}
```

### Create trace context in Python

```python
with tracer.span(name="cache.get") as span:
    pass
```

### Create trace context in NodeJS

```nodejs
tracer.startRootSpan({name: 'cache.Get'}, rootSpan => {
});
```

### Create trace context in C++

```cplusplus
opencensus::trace::Span span = opencensus::trace::Span::StartSpan(
                                            "cache.Get", nullptr, {&sampler});
```

### Create trace context in C#

```csharp
var span = tracer.SpanBuilder("cache.Get").StartScopedSpan();
```

## Putting it all together with a Go Sample

### Configure tracing in Dapr
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

### Invoking Dapr with trace context

As mentioned in `Scenarios` section in [W3C Trace Context for distributed tracing](../../concepts/observability/W3C-traces.md) that Dapr covers generating trace context and you do not need to explicitly create trace context.

However if you choose to pass the trace context explicitly, then Dapr will use the passed trace context and propagate all across the HTTP/gRPC call.

Using the [grpc app](../create-grpc-app) in the example and putting this all together, the following steps show you how to create a Dapr client and call the InvokeService method passing the trace context:

The Rest code snippet and details, refer to the [grpc app](../create-grpc-app).

### 1. Import the package

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

### 2. Create the client

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

### 3. Invoke the InvokeService method With Trace Context

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

You can now correlate the calls in your app and across services with Dapr using the same trace context.

## Related Links

* [Observability concepts](../../concepts/observability/traces.md)
* [W3C Trace Context for distributed tracing](../../concepts/observability/W3C-traces.md)
* [How to set up Application Insights for distributed tracing](../../howto/diagnose-with-tracing/azure-monitor.md)
* [How to set up Zipkin for distributed tracing](../../howto/diagnose-with-tracing/zipkin.md)
* [W3C trace context specification](https://www.w3.org/TR/trace-context/)
* [Observability sample](https://github.com/dapr/samples/tree/master/8.observability)


