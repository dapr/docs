---
type: docs
title: "How-To: Invoke services using gRPC"
linkTitle: "How-To: Invoke with gRPC"
description: "Call between services using service invocation"
weight: 3000
---

This article describe how to use Dapr to connect services using gRPC.

By using Dapr's gRPC proxying capability, you can use your existing proto-based gRPC services and have the traffic go through the Dapr sidecar. Doing so yields the following [Dapr service invocation]({{< ref service-invocation-overview.md >}}) benefits to developers:

1. Mutual authentication
2. Tracing
3. Metrics
4. Access lists
5. Network level resiliency
6. API token based authentication

Dapr allows proxying all kinds of gRPC invocations, including unary and [stream-based](#proxying-of-streaming-rpcs) ones.

## Step 1: Run a gRPC server

The following example is taken from the ["hello world" grpc-go example](https://github.com/grpc/grpc-go/tree/master/examples/helloworld). Although this example is in Go, the same concepts apply to all programming languages supported by gRPC.

```go
package main

import (
	"context"
	"log"
	"net"

	"google.golang.org/grpc"
	pb "google.golang.org/grpc/examples/helloworld/helloworld"
)

const (
	port = ":50051"
)

// server is used to implement helloworld.GreeterServer.
type server struct {
	pb.UnimplementedGreeterServer
}

// SayHello implements helloworld.GreeterServer
func (s *server) SayHello(ctx context.Context, in *pb.HelloRequest) (*pb.HelloReply, error) {
	log.Printf("Received: %v", in.GetName())
	return &pb.HelloReply{Message: "Hello " + in.GetName()}, nil
}

func main() {
	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	s := grpc.NewServer()
	pb.RegisterGreeterServer(s, &server{})
	log.Printf("server listening at %v", lis.Addr())
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
```

This Go app implements the Greeter proto service and exposes a `SayHello` method.

### Run the gRPC server using the Dapr CLI

```bash
dapr run --app-id server --app-port 50051 -- go run main.go
```

Using the Dapr CLI, we're assigning a unique id to the app, `server`, using the `--app-id` flag.

## Step 2: Invoke the service

The following example shows you how to discover the Greeter service using Dapr from a gRPC client.
Notice that instead of invoking the target service directly at port `50051`, the client is invoking its local Dapr sidecar over port `50007` which then provides all the capabilities of service invocation including service discovery, tracing, mTLS and retries.

```go
package main

import (
	"context"
	"log"
	"time"

	"google.golang.org/grpc"
	pb "google.golang.org/grpc/examples/helloworld/helloworld"
	"google.golang.org/grpc/metadata"
)

const (
	address = "localhost:50007"
)

func main() {
	// Set up a connection to the server.
	conn, err := grpc.Dial(address, grpc.WithInsecure(), grpc.WithBlock())
	if err != nil {
		log.Fatalf("did not connect: %v", err)
	}
	defer conn.Close()
	c := pb.NewGreeterClient(conn)

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*2)
	defer cancel()

	ctx = metadata.AppendToOutgoingContext(ctx, "dapr-app-id", "server")
	r, err := c.SayHello(ctx, &pb.HelloRequest{Name: "Darth Tyrannus"})
	if err != nil {
		log.Fatalf("could not greet: %v", err)
	}

	log.Printf("Greeting: %s", r.GetMessage())
}
```

The following line tells Dapr to discover and invoke an app named `server`:

```go
ctx = metadata.AppendToOutgoingContext(ctx, "dapr-app-id", "server")
```

All languages supported by gRPC allow for adding metadata. Here are a few examples:

{{< tabs Java Dotnet Python JavaScript Ruby "C++">}}

{{% codetab %}}
```java
Metadata headers = new Metadata();
Metadata.Key<String> jwtKey = Metadata.Key.of("dapr-app-id", "server");

GreeterService.ServiceBlockingStub stub = GreeterService.newBlockingStub(channel);
stub = MetadataUtils.attachHeaders(stub, header);
stub.SayHello(new HelloRequest() { Name = "Darth Malak" });
```
{{% /codetab %}}

{{% codetab %}}
```csharp
var metadata = new Metadata
{
	{ "dapr-app-id", "server" }
};

var call = client.SayHello(new HelloRequest { Name = "Darth Nihilus" }, metadata);
```
{{% /codetab %}}

{{% codetab %}}
```python
metadata = (('dapr-app-id', 'server'),)
response = stub.SayHello(request={ name: 'Darth Revan' }, metadata=metadata)
```
{{% /codetab %}}

{{% codetab %}}
```javascript
const metadata = new grpc.Metadata();
metadata.add('dapr-app-id', 'server');

client.sayHello({ name: "Darth Malgus" }, metadata)
```
{{% /codetab %}}

{{% codetab %}}
```ruby
metadata = { 'dapr-app-id' : 'server' }
response = service.sayHello({ 'name': 'Darth Bane' }, metadata)
```
{{% /codetab %}}

{{% codetab %}}
```c++
grpc::ClientContext context;
context.AddMetadata("dapr-app-id", "server");
```
{{% /codetab %}}

{{< /tabs >}}

### Run the client using the Dapr CLI

```bash
dapr run --app-id client --dapr-grpc-port 50007 -- go run main.go
```

### View telemetry

If you're running Dapr locally with Zipkin installed, open the browser at `http://localhost:9411` and view the traces between the client and server.

### Deploying to Kubernetes

Set the following Dapr annotations on your deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: grpc-app
  namespace: default
  labels:
    app: grpc-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: grpc-app
  template:
    metadata:
      labels:
        app: grpc-app
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "server"
        dapr.io/app-protocol: "grpc"
        dapr.io/app-port: "50051"
...
```
*If your app uses an SSL connection, you can tell Dapr to invoke your app over an insecure SSL connection with the `app-ssl: "true"` annotation (full list [here]({{< ref arguments-annotations-overview.md >}}))*

The `dapr.io/app-protocol: "grpc"` annotation tells Dapr to invoke the app using gRPC.

### Namespaces

When running on [namespace supported platforms]({{< ref "service_invocation_api.md#namespace-supported-platforms" >}}), you include the namespace of the target app in the app ID: `myApp.production`

For example, invoking the gRPC server on a different namespace:

```go
ctx = metadata.AppendToOutgoingContext(ctx, "dapr-app-id", "server.production")
```

See the [Cross namespace API spec]({{< ref "service_invocation_api.md#cross-namespace-invocation" >}}) for more information on namespaces.

## Step 3: View traces and logs

The example above showed you how to directly invoke a different service running locally or in Kubernetes. Dapr outputs metrics, tracing and logging information allowing you to visualize a call graph between services, log errors and optionally log the payload body.

For more information on tracing and logs see the [observability]({{< ref observability-concept.md >}}) article.

## Proxying of streaming RPCs

When using Dapr to proxy streaming RPC calls using gRPC, you must set an additional metadata option `dapr-stream` with value `true`.

For example:

{{< tabs Go Java Dotnet Python JavaScript Ruby "C++">}}

{{% codetab %}}
```go
ctx = metadata.AppendToOutgoingContext(ctx, "dapr-app-id", "server")
ctx = metadata.AppendToOutgoingContext(ctx, "dapr-stream", "true")
```
{{% /codetab %}}

{{% codetab %}}
```java
Metadata headers = new Metadata();
Metadata.Key<String> jwtKey = Metadata.Key.of("dapr-app-id", "server");
Metadata.Key<String> jwtKey = Metadata.Key.of("dapr-stream", "true");
```
{{% /codetab %}}

{{% codetab %}}
```csharp
var metadata = new Metadata
{
	{ "dapr-app-id", "server" },
	{ "dapr-stream", "true" }
};
```
{{% /codetab %}}

{{% codetab %}}
```python
metadata = (('dapr-app-id', 'server'), ('dapr-stream', 'true'),)
```
{{% /codetab %}}

{{% codetab %}}
```javascript
const metadata = new grpc.Metadata();
metadata.add('dapr-app-id', 'server');
metadata.add('dapr-stream', 'true');
```
{{% /codetab %}}

{{% codetab %}}
```ruby
metadata = { 'dapr-app-id' : 'server' }
metadata = { 'dapr-stream' : 'true' }
```
{{% /codetab %}}

{{% codetab %}}
```c++
grpc::ClientContext context;
context.AddMetadata("dapr-app-id", "server");
context.AddMetadata("dapr-stream", "true");
```
{{% /codetab %}}

{{< /tabs >}}

### Streaming gRPCs and Resiliency

When proxying streaming gRPCs, due to their long-lived nature, [resiliency]({{< ref "resiliency-overview.md" >}}) policies are applied on the "initial handshake" only. As a consequence:

- If the stream is interrupted after the initial handshake, it will not be automatically re-established by Dapr. Your application will be notified that the stream has ended, and will need to recreate it.
- Retry policies only impact the initial connection "handshake". If your resiliency policy includes retries, Dapr will detect failures in establishing the initial connection to the target app and will retry until it succeeds (or until the number of retries defined in the policy is exhausted).
- Likewise, timeouts defined in resiliency policies only apply to the initial "handshake". After the connection has been established, timeouts do not impact the stream anymore.

## Related Links

* [Service invocation overview]({{< ref service-invocation-overview.md >}})
* [Service invocation API specification]({{< ref service_invocation_api.md >}})
* [gRPC proxying community call video](https://youtu.be/B_vkXqptpXY?t=70)

## Community call demo

Watch this [video](https://youtu.be/B_vkXqptpXY?t=69) on how to use Dapr's gRPC proxying capability:

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/B_vkXqptpXY?start=69" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/B_vkXqptpXY?start=69" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
