---
type: docs
title: "How-To: Invoke services using gRPC"
linkTitle: "How-To: Invoke with gRPC"
description: "Call between services using service invocation"
weight: 3000
---
{{% alert title="Preview feature" color="warning" %}}
gRPC proxying is currently in [preview]({{< ref preview-features.md >}}).
{{% /alert %}}

This article describe how to use Dapr to connect services using gRPC.
By using Dapr's gRPC proxying capability, you can use your existing proto based gRPC services and have the traffic go through the Dapr sidecar. Doing so yields the following [Dapr service invocation]({{< ref service-invocation-overview.md >}}) benefits to developers:

1. Mutual authentication
2. Tracing
3. Metrics
4. Access lists
5. Network level resiliency
6. API token based authentication

## Step 1: Run a gRPC server

The following example is taken from the [hello world grpc-go example](https://github.com/grpc/grpc-go/tree/master/examples/helloworld).

Note this example is in Go, but applies to all programming languages supported by gRPC.

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

Since gRPC proxying is currently a preview feature, you need to opt-in using a configuration file. See https://docs.dapr.io/operations/configuration/preview-features/ for more information.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: serverconfig
spec:
  tracing:
    samplingRate: "1"
    zipkin:
      endpointAddress: http://localhost:9411/api/v2/spans
  features:
    - name: proxy.grpc
      enabled: true
```

Run the sidecar and the Go server:

```bash
dapr run --app-id server --app-port 50051 --config config.yaml -- go run main.go
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
context.AddMetadata("dapr-app-id", "Darth Sidious");
```
{{% /codetab %}}

{{< /tabs >}}

### Run the client using the Dapr CLI

Since gRPC proxying is currently a preview feature, you need to opt-in using a configuration file. See https://docs.dapr.io/operations/configuration/preview-features/ for more information.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: serverconfig
spec:
  tracing:
    samplingRate: "1"
    zipkin:
      endpointAddress: http://localhost:9411/api/v2/spans
  features:
    - name: proxy.grpc
      enabled: true
```

```bash
dapr run --app-id client --dapr-grpc-port 50007 --config config.yaml -- go run main.go
```

### View telemetry

If you're running Dapr locally with Zipkin installed, open the browser at `http://localhost:9411` and view the traces between the client and server.

## Deploying to Kubernetes

### Step 1: Apply the following configuration YAML using `kubectl`

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: serverconfig
spec:
  tracing:
    samplingRate: "1"
    zipkin:
      endpointAddress: http://localhost:9411/api/v2/spans
  features:
    - name: proxy.grpc
      enabled: true
```

```bash
kubectl apply -f config.yaml
```

### Step 2: set the following Dapr annotations on your pod

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
		dapr.io/config: "serverconfig"
...
```
*If your app uses an SSL connection, you can tell Dapr to invoke your app over an insecure SSL connection with the `app-ssl: "true"` annotation (full list [here]({{< ref arguments-annotations-overview.md >}}))*

The `dapr.io/app-protocol: "grpc"` annotation tells Dapr to invoke the app using gRPC.
The `dapr.io/config: "serverconfig"` annotation tells Dapr to use the configuration applied above that enables gRPC proxying.

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

 ## Related Links

* [Service invocation overview]({{< ref service-invocation-overview.md >}})
* [Service invocation API specification]({{< ref service_invocation_api.md >}})
* [gRPC proxying community call video](https://youtu.be/B_vkXqptpXY?t=70)

## Community call demo
Watch this [video](https://youtu.be/B_vkXqptpXY?t=69) on how to use Dapr's gRPC proxying capability:

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube.com/embed/B_vkXqptpXY?start=69" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>