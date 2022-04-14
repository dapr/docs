---
type: docs
title: "Quickstart: Bindings"
linkTitle: "Dapr Bindings"
weight: 70
description: "Get started with Dapr's Binding building block"
---

Let's take a look at Dapr's [Binding building block]({{< ref bindings >}}). In this Quickstart, you will run a microservice sending and receiving messages to and from [Kafka](https://kafka.apache.org/) using Output and Input Bindings.

Using bindings, you can trigger your app with events coming in from external systems, or interface with external systems. Bindings provide several benefits for you and your code:
 - Remove the complexities of connecting to, and polling from, messaging systems such as queues and message buses.
 - Focus on business logic and not implementation details of how to interact with a system.
 - Keep your code free from SDKs or libraries.
 - Handle retries and failure recovery.
 - Switch between bindings at run time.
 - Build portable applications where environment-specific bindings are set-up and no code changes are required.

For a specific example, bindings would allow your microservice to respond to incoming Twilio/SMS messages without adding or configuring a third-party Twilio SDK, worrying about polling from Twilio (or using websockets, etc.).

<img src="/images/binding-quickstart/Bindings_Quickstart.png" width=800 style="padding-bottom:15px;">

Select your preferred language-specific Dapr SDK before proceeding with the Quickstart.

{{< tabs "Python" "JavaScript" ".NET" "Go" >}}
 <!-- Python -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Python 3.7+ installed](https://www.python.org/downloads/).
- [Docker Desktop](https://www.docker.com/products/docker-desktop).

### Step 1: Set up the environment

Clone the [sample we've provided in our Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/bindings).
```bash
git clone https://github.com/dapr/quickstarts.git
```
### Step 2: Run Kafka Docker Container Locally

In order to run the Kafka bindings quickstart locally, you will run the [Kafka broker server](https://github.com/wurstmeister/kafka-docker) in a docker container on your machine.

To run the container locally, run:

```bash
docker-compose -f ./docker-compose-single-kafka.yml up -d
```

To see the container running locally, run:
```bash
docker ps
```

The output should be similar to this:
```bash
342d3522ca14        kafka-docker_kafka                      "start-kafka.sh"         14 hours ago        Up About
a minute   0.0.0.0:9092->9092/tcp                               kafka-docker_kafka_1
0cd69dbe5e65        wurstmeister/zookeeper                  "/bin/sh -c '/usr/sb…"   8 days ago          Up About
a minute   22/tcp, 2888/tcp, 3888/tcp, 0.0.0.0:2181->2181/tcp   kafka-docker_zookeeper_1
```

### Step 3: Use the Kafka Output binding

In a terminal window, navigate to the `sdk` directory.

```bash
cd bindings/python/sdk
```

Install the dependencies:

```bash
pip3 install -r requirements.txt
```

Run the `python-output-binding-sdk` service alongside a Dapr sidecar.

```bash
dapr run --app-id python-output-binding-sdk --app-protocol grpc --components-path ../../components python3 output.py
```
The `python-output-binding-sdk` uses the Kafka Output Binding [defined in the `bindings.yaml` component]({{< ref "#bindingsyaml-component-file" >}}) to send the `orderId` key/value pair to a Kafka topic. As soon as the service starts, it performs a loop.

```python
with DaprClient() as d:
    bindingName = "orders"
    operation = "create"
    n = 0
    while n < 10:
        n += 1
        req_data = {
            'orderId': n
        }
        print ('Output binding: orderId: ' + str(n),flush=True)

        # Output message to Kafka using an output bindin
        resp = d.invoke_binding(bindingName, operation, json.dumps(req_data))

        time.sleep(0.5)
```

### Step 4: View the Output Binding log

Notice, as specified above, the code invokes the Output Binding with the `orderId` as a payload.

Output Binding `print` statement output:
```
== APP == Output binding: orderId: 1
== APP == Output binding: orderId: 2
== APP == Output binding: orderId: 3
== APP == Output binding: orderId: 4
== APP == Output binding: orderId: 5
== APP == Output binding: orderId: 6
== APP == Output binding: orderId: 7
== APP == Output binding: orderId: 8
== APP == Output binding: orderId: 9
== APP == Output binding: orderId: 10
```

### Step 5: Consume the Kafka messages with an Input Binding

In the same terminal window, run the `python-input-binding-sdk` service alongside a Dapr sidecar.

```bash
dapr run --app-id python-input-binding-sdk --app-protocol grpc --app-port 50051 --components-path ../../components python3 input.py
```
The `python-input-binding-sdk` uses the Kafka Input Binding [defined in the `bindings.yaml` component]({{< ref "#bindingsyaml-component-file" >}}) to receive the `orderId` key/value pair from the Kafka topic. The service is invoked every time a message is added to the Kafka topic.

```python
bindingName = "orders"

@app.binding(bindingName)
def binding(request: BindingRequest):
    print('Input binding: {}'.format(request.text()), flush=True)
```

### Step 6: View the Input Binding log

Notice, as specified above, the code is invoked every time a message is added to a Kafka topic.

Input Binding `print` statement output:
```
== APP == Input binding: {"orderId": 1}
== APP == Input binding: {"orderId": 2}
== APP == Input binding: {"orderId": 3}
== APP == Input binding: {"orderId": 4}
== APP == Input binding: {"orderId": 5}
== APP == Input binding: {"orderId": 6}
== APP == Input binding: {"orderId": 7}
== APP == Input binding: {"orderId": 8}
== APP == Input binding: {"orderId": 9}
== APP == Input binding: {"orderId": 10}
```

#### `bindings.yaml` component file

When you execute the `dapr run` command and specify the location of the component file, the Dapr sidecar initiates the Kafka [Binding building block]({{< ref bindings >}}) and connects to the local Kafka container using the settings specified in the `bindings.yaml` file.

With the `bindings.yaml` component, you can easily swap out the [binding](/reference/components-reference/supported-bindings/) without making code changes.

The Kafka `bindings.yaml` file included for this Quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: orders
spec:
  type: bindings.kafka
  version: v1
  metadata:
  # Kafka broker connection setting
  - name: brokers
    value: localhost:9092
  # consumer configuration: topic and consumer group
  - name: topics
    value: sample
  - name: consumerGroup
    value: group1
  # publisher configuration: topic
  - name: publishTopic
    value: sample
  - name: authRequired
    value: "false"
```

In the YAML file:

- `spec/type` specifies that Kafka is used for this binding.
- `spec/metadata` defines the connection to the Kafka instance used by the component.

{{% /codetab %}}

 <!-- JavaScript -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Latest Node.js installed](https://nodejs.org/download/).
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Step 1: Set up the environment

Clone the [sample we've provided in our Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/bindings).
```bash
git clone https://github.com/dapr/quickstarts.git
```
### Step 2: Run Kafka Docker Container Locally

In order to run the Kafka bindings quickstart locally, you will run the [Kafka broker server](https://github.com/wurstmeister/kafka-docker) in a docker container on your machine.

To run the container locally, run:

```bash
docker-compose -f ./docker-compose-single-kafka.yml up -d
```

To see the container running locally, run:
```bash
docker ps
```

The output should be similar to this:
```bash
342d3522ca14        kafka-docker_kafka                      "start-kafka.sh"         14 hours ago        Up About
a minute   0.0.0.0:9092->9092/tcp                               kafka-docker_kafka_1
0cd69dbe5e65        wurstmeister/zookeeper                  "/bin/sh -c '/usr/sb…"   8 days ago          Up About
a minute   22/tcp, 2888/tcp, 3888/tcp, 0.0.0.0:2181->2181/tcp   kafka-docker_zookeeper_1
```
### Step 3: Use the Kafka Output binding

In a terminal window, navigate to the `sdk` directory.

```bash
cd bindings/javascript/sdk
```

Install the dependencies:

```bash
npm install
```

Run the `javascript-output-binding-sdk` service alongside a Dapr sidecar.

```bash
dapr run --app-id javascript-output-binding-sdk --app-port 6001 --dapr-http-port 6000 --dapr-grpc-port 60001 node output.js --components-path ../../components
```
The `javascript-output-binding-sdk` uses the Kafka Output Binding [defined in the `bindings.yaml` component]({{< ref "#bindingsyaml-component-file" >}}) to send the `orderId` key/value pair to a Kafka topic. As soon as the service starts, it performs a loop.

```js
const client = new DaprClient(daprHost, httpPort);
const bindingName = "orders";
for(var i = 1; i <= 10; i++) {
  const order = {orderId:  i};
  
  // Publish a Kafka event using an output binding
  await client.binding.send(bindingName, "create", order);
  console.log("Output binding: " + JSON.stringify(order));

  await sleep(100);
  }
}
```
## Step 4: View the Output Binding log

Notice, as specified above, the code invokes the Output Binding with the `orderId` as a payload.

Output Binding `console.log` statement output:
```
== APP == Output binding: {"orderId":1}
== APP == Output binding: {"orderId":2}
== APP == Output binding: {"orderId":3}
== APP == Output binding: {"orderId":4}
== APP == Output binding: {"orderId":5}
== APP == Output binding: {"orderId":6}
== APP == Output binding: {"orderId":7}
== APP == Output binding: {"orderId":8}
== APP == Output binding: {"orderId":9}
== APP == Output binding: {"orderId":10}
```

### Step 5: Consume the Kafka messages with an Input Binding

In the same terminal window, run the `javascript-input-binding-sdk` service alongside a Dapr sidecar.

```bash
dapr run --app-id javascript-input-binding-sdk --app-protocol http --app-port 3500 --dapr-http-port 5051 --components-path ../../components node input.js
```
The `javascript-input-binding-sdk` uses the Kafka Input Binding [defined in the `bindings.yaml` component]({{< ref "#bindingsyaml-component-file" >}}) to receive the `orderId` key/value pair from the Kafka topic. The service is invoked every time a message is added to the Kafka topic.

```js
const server = new DaprServer(serverHost, serverPort, daprHost, daprPort);
await server.binding.receive(bindingName, async (data) => console.log(`Input binding: ${JSON.stringify(data)}`));
await server.start();
```

### Step 6: View the Input Binding log

Notice, as specified above, the code is invoked every time a message is added to a Kafka topic.

Input Binding `console.log` statement output:
```
== APP == Input binding: {"orderId":1}
== APP == Input binding: {"orderId":2}
== APP == Input binding: {"orderId":3}
== APP == Input binding: {"orderId":4}
== APP == Input binding: {"orderId":5}
== APP == Input binding: {"orderId":6}
== APP == Input binding: {"orderId":7}
== APP == Input binding: {"orderId":8}
== APP == Input binding: {"orderId":9}
== APP == Input binding: {"orderId":10}
```

#### `bindings.yaml` component file

When you execute the `dapr run` command and specify the location of the component file, the Dapr sidecar initiates the Kafka [Binding building block]({{< ref bindings >}}) and connects to the local Kafka container using the settings specified in the `bindings.yaml` file.

With the `bindings.yaml` component, you can easily swap out the [binding](/reference/components-reference/supported-bindings/) without making code changes.

The Kafka `bindings.yaml` file included for this Quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: orders
spec:
  type: bindings.kafka
  version: v1
  metadata:
  # Kafka broker connection setting
  - name: brokers
    value: localhost:9092
  # consumer configuration: topic and consumer group
  - name: topics
    value: sample
  - name: consumerGroup
    value: group1
  # publisher configuration: topic
  - name: publishTopic
    value: sample
  - name: authRequired
    value: "false"
```

In the YAML file:

- `spec/type` specifies that Kafka is used for this binding.
- `spec/metadata` defines the connection to the Kafka instance used by the component.

{{% /codetab %}}

 <!-- .NET -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [.NET SDK or .NET 6 SDK installed](https://dotnet.microsoft.com/download).
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Step 1: Set up the environment

Clone the [sample we've provided in our Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/bindings).
```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Run Kafka Docker Container Locally

In order to run the Kafka bindings quickstart locally, you will run the [Kafka broker server](https://github.com/wurstmeister/kafka-docker) in a docker container on your machine.

To run the container locally, run:

```bash
docker-compose -f ./docker-compose-single-kafka.yml up -d
```

To see the container running locally, run:
```bash
docker ps
```

The output should be similar to this:
```bash
342d3522ca14        kafka-docker_kafka                      "start-kafka.sh"         14 hours ago        Up About
a minute   0.0.0.0:9092->9092/tcp                               kafka-docker_kafka_1
0cd69dbe5e65        wurstmeister/zookeeper                  "/bin/sh -c '/usr/sb…"   8 days ago          Up About
a minute   22/tcp, 2888/tcp, 3888/tcp, 0.0.0.0:2181->2181/tcp   kafka-docker_zookeeper_1
```

### Step 3: Use the Kafka Output binding

In a terminal window, navigate to the `sdk/output` directory.

```bash
cd bindings/csharp/sdk/output
```

Recall NuGet packages:

```bash
dotnet restore
dotnet build
```

Run the `csharp-output-binding-sdk` service alongside a Dapr sidecar.

```bash
 dapr run --app-id csharp-output-binding-sdk --app-port 6060 --components-path ../../../components -- dotnet run --project output.csproj
```
The `csharp-output-binding-sdk` uses the Kafka Output Binding [defined in the `bindings.yaml` component]({{< ref "#bindingsyaml-component-file" >}}) to send the `orderId` key/value pair to a Kafka topic. As soon as the service starts, it performs a loop.

```cs
var bindingName = "orders";
var opration = "create";

for (int i = 1; i <= 10; i++) {
    var order = new Order(i);
    using var client = new DaprClientBuilder().Build();

    // Publish a Kafka message using output binding
    await client.InvokeBindingAsync(bindingName, opration, order);
    Console.WriteLine("Output binding: " + order);

    await Task.Delay(TimeSpan.FromSeconds(0.2));
}
public record Order([property: JsonPropertyName("orderId")] int OrderId);
```
## Step 4: View the Output Binding log

Notice, as specified above, the code invokes the Output Binding with the `orderId` as a payload.

Output Binding `Console.WriteLine` statement output:
```
== APP == Output binding: Order { OrderId = 1 }
== APP == Output binding: Order { OrderId = 2 }
== APP == Output binding: Order { OrderId = 3 }
== APP == Output binding: Order { OrderId = 4 }
== APP == Output binding: Order { OrderId = 5 }
== APP == Output binding: Order { OrderId = 6 }
== APP == Output binding: Order { OrderId = 7 }
== APP == Output binding: Order { OrderId = 8 }
== APP == Output binding: Order { OrderId = 9 }
== APP == Output binding: Order { OrderId = 10 }
```

### Step 5: Consume the Kafka messages with an Input Binding

In the same terminal window, navigate to the  `http/input` directory. 

```bash
cd ../../http/input
```

Run the `csharp-input-binding-http` service alongside a Dapr sidecar.

```bash
dapr run --app-id csharp-input-binding-http --app-port 7001 --components-path ../../../components -- dotnet run --project input.csproj
```
The `csharp-input-binding-sdk` uses the Kafka Input Binding [defined in the `bindings.yaml` component]({{< ref "#bindingsyaml-component-file" >}}) to receive the `orderId` key/value pair from the Kafka topic. The service is invoked every time a message is added to the Kafka topic.

```cs
var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();
var bindingName = "orders";

if (app.Environment.IsDevelopment()) {app.UseDeveloperExceptionPage();}

// Dapr Kafka input binding
app.MapPost(bindingName, (Order requestData) => {
    Console.WriteLine("Input binding: { \"orderId\": " + requestData.OrderId + "}");
    return Results.Ok(requestData.OrderId);
});
await app.RunAsync();
public record Order([property: JsonPropertyName("orderId")] int OrderId);
```

### Step 6: View the Input Binding log

Notice, as specified above, the code is invoked every time a message is added to a Kafka topic.

Input Binding `Console.WriteLine` statement output:
```
== APP == Input binding: { "orderId": 1}
== APP == Input binding: { "orderId": 2}
== APP == Input binding: { "orderId": 3}
== APP == Input binding: { "orderId": 4}
== APP == Input binding: { "orderId": 5}
== APP == Input binding: { "orderId": 6}
== APP == Input binding: { "orderId": 7}
== APP == Input binding: { "orderId": 8}
== APP == Input binding: { "orderId": 9}
== APP == Input binding: { "orderId": 10}
```

#### `bindings.yaml` component file

When you execute the `dapr run` command and specify the location of the component file, the Dapr sidecar initiates the Kafka [Binding building block]({{< ref bindings >}}) and connects to the local Kafka container using the settings specified in the `bindings.yaml` file.

With the `bindings.yaml` component, you can easily swap out the [binding](/reference/components-reference/supported-bindings/) without making code changes.

The Kafka `bindings.yaml` file included for this Quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: orders
spec:
  type: bindings.kafka
  version: v1
  metadata:
  # Kafka broker connection setting
  - name: brokers
    value: localhost:9092
  # consumer configuration: topic and consumer group
  - name: topics
    value: sample
  - name: consumerGroup
    value: group1
  # publisher configuration: topic
  - name: publishTopic
    value: sample
  - name: authRequired
    value: "false"
```

In the YAML file:

- `spec/type` specifies that Kafka is used for this binding.
- `spec/metadata` defines the connection to the Kafka instance used by the component.

{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Latest version of Go](https://go.dev/dl/).
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Step 1: Set up the environment

Clone the [sample we've provided in our Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/bindings).
```bash
git clone https://github.com/dapr/quickstarts.git
```
### Step 2: Run Kafka Docker Container Locally

In order to run the Kafka bindings quickstart locally, you will run the [Kafka broker server](https://github.com/wurstmeister/kafka-docker) in a docker container on your machine.

To run the container locally, run:

```bash
docker-compose -f ./docker-compose-single-kafka.yml up -d
```

To see the container running locally, run:
```bash
docker ps
```

The output should be similar to this:
```bash
342d3522ca14        kafka-docker_kafka                      "start-kafka.sh"         14 hours ago        Up About
a minute   0.0.0.0:9092->9092/tcp                               kafka-docker_kafka_1
0cd69dbe5e65        wurstmeister/zookeeper                  "/bin/sh -c '/usr/sb…"   8 days ago          Up About
a minute   22/tcp, 2888/tcp, 3888/tcp, 0.0.0.0:2181->2181/tcp   kafka-docker_zookeeper_1
```

### Step 3: Use the Kafka Output binding

In a terminal window, navigate to the `sdk` directory.

```bash
cd bindings/go/sdk
```

Install the dependencies and build the application:

```bash
go build output.go
```

Run the `go-output-binding-sdk` service alongside a Dapr sidecar.

```bash
 dapr run --app-id go-output-binding-sdk --app-port 3500 --components-path ../../components go run output.go 
```
The `go-output-binding-sdk` uses the Kafka Output Binding [defined in the `bindings.yaml` component]({{< ref "#bindingsyaml-component-file" >}}) to send the `orderId` key/value pair to a Kafka topic. As soon as the service starts, it performs a loop.

```go
bindingName := "orders"
bindingOperation := "create"
for i := 1; i <= 10; i++ {
  time.Sleep(5000)
  order := `{"OrderId":` + strconv.Itoa(i) + `}`
  client, err := dapr.NewClient()
  if err != nil {
    panic(err)
  }
  defer client.Close()
  ctx := context.Background()
  //Using Dapr SDK to invoke output binding
  in := &dapr.InvokeBindingRequest{Name: bindingName, Operation: bindingOperation, Data: []byte(order)}
  err = client.InvokeOutputBinding(ctx, in)
  fmt.Println("Output binding: ", order)
```
## Step 4: View the Output Binding log

Notice, as specified above, the code invokes the Output Binding with the `orderId` as a payload.

Output Binding `fmt.Println` statement output:
```
== APP == dapr client initializing for: 127.0.0.1:63280
== APP == Output binding:  {"OrderId":1}
== APP == Output binding:  {"OrderId":2}
== APP == Output binding:  {"OrderId":3}
== APP == Output binding:  {"OrderId":4}
== APP == Output binding:  {"OrderId":5}
== APP == Output binding:  {"OrderId":6}
== APP == Output binding:  {"OrderId":7}
== APP == Output binding:  {"OrderId":8}
== APP == Output binding:  {"OrderId":9}
== APP == Output binding:  {"OrderId":10}
```
### Step 5: Consume the Kafka messages with an Input Binding

In the same terminal window, run the `go-input-binding-sdk` service alongside a Dapr sidecar.

```bash
dapr run --app-id go-input-binding-sdk --app-port 6101 --components-path ../../components go run input.go
```
The `go-input-binding-sdk` uses the Kafka Input Binding [defined in the `bindings.yaml` component]({{< ref "#bindingsyaml-component-file" >}}) to receive the `orderId` key/value pair from the Kafka topic. The service is invoked every time a message is added to the Kafka topic.

```go
func main() {
	bindingName := "/orders"
	daprPort := ":6101"
	s := daprd.NewService(daprPort)

	if err := s.AddBindingInvocationHandler(bindingName, runHandler); err != nil {
		log.Fatalf("error adding binding handler: %v", err)
	}

	if err := s.Start(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("error listenning: %v", err)
	}
}

func runHandler(ctx context.Context, in *common.BindingEvent) (out []byte, err error) {
	fmt.Println("Input binding: ", string(in.Data))
	return nil, nil
}

```
### Step 6: View the Input Binding log

Notice, as specified above, the code is invoked every time a message is added to a Kafka topic.

Input Binding `fmt.Println` statement output:
```
== APP == Input binding:  {"OrderId":1}
== APP == Input binding:  {"OrderId":2}
== APP == Input binding:  {"OrderId":3}
== APP == Input binding:  {"OrderId":4}
== APP == Input binding:  {"OrderId":5}
== APP == Input binding:  {"OrderId":6}
== APP == Input binding:  {"OrderId":7}
== APP == Input binding:  {"OrderId":8}
== APP == Input binding:  {"OrderId":9}
== APP == Input binding:  {"OrderId":10}
```

#### `bindings.yaml` component file

When you execute the `dapr run` command and specify the location of the component file, the Dapr sidecar initiates the Kafka [Binding building block]({{< ref bindings >}}) and connects to the local Kafka container using the settings specified in the `bindings.yaml` file.

With the `bindings.yaml` component, you can easily swap out the [binding](/reference/components-reference/supported-bindings/) without making code changes.

The Kafka `bindings.yaml` file included for this Quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: orders
spec:
  type: bindings.kafka
  version: v1
  metadata:
  # Kafka broker connection setting
  - name: brokers
    value: localhost:9092
  # consumer configuration: topic and consumer group
  - name: topics
    value: sample
  - name: consumerGroup
    value: group1
  # publisher configuration: topic
  - name: publishTopic
    value: sample
  - name: authRequired
    value: "false"
```

In the YAML file:

- `spec/type` specifies that Kafka is used for this binding.
- `spec/metadata` defines the connection to the Kafka instance used by the component.

{{% /codetab %}}

{{< /tabs >}}

## Tell us what you think!
We're continuously working to improve our Quickstart examples and value your feedback. Did you find this quickstart helpful? Do you have suggestions for improvement?

Join the discussion in our [discord channel](https://discord.gg/22ZtJrNe).

## Next steps

- Use Dapr Bindings with HTTP instead of an SDK.
  - [Python](https://github.com/dapr/quickstarts/tree/master/bindings/python/http)
  - [JavaScript](https://github.com/dapr/quickstarts/tree/master/bindings/javascript/http)
  - [.NET](https://github.com/dapr/quickstarts/tree/master/bindings/csharp/http)
  - [Go](https://github.com/dapr/quickstarts/tree/master/bindings/go/http)
- Learn more about [Binding building block]({{< ref bindings >}})

{{< button text="Explore Dapr tutorials  >>" page="getting-started/tutorials/_index.md" >}}
