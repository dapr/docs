---
type: docs
title: "How-To: Use output bindings to interface with external resources"
linkTitle: "How-To: Output bindings"
description: "Invoke external systems with output bindings"
weight: 300
---

Output bindings enable you to invoke external resources without taking dependencies on special SDK or libraries.
For a complete sample showing output bindings, visit this [link](https://github.com/dapr/quickstarts/tree/master/bindings).

## Example:

The below code example loosely describes an application that processes orders. In the example, there is an order processing service which has a Dapr sidecar. The order processing service uses Dapr to invoke external resources via an output binding.

<img src="/images/building-block-bindings-example.png" width=1000 alt="Diagram showing bindings of example service">

## 1. Create a binding

An output binding represents a resource that Dapr uses to invoke and send messages to.

For the purpose of this guide, you'll use a Kafka binding. You can find a list of the different binding specs [here]({{< ref setup-bindings >}}).

Create a new binding component with the name of `checkout`.

Inside the `metadata` section, configure Kafka related properties such as the topic to publish the message to and the broker.

{{< tabs "Self-Hosted (CLI)" Kubernetes >}}

{{% codetab %}}

Create the following YAML file, named `binding.yaml`, and save this to a `components` sub-folder in your application directory.
(Use the `--components-path` flag with `dapr run` to point to your custom components dir)

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: checkout
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

{{% /codetab %}}

{{% codetab %}}

To deploy this into a Kubernetes cluster, fill in the `metadata` connection details of your [desired binding component]({{< ref setup-bindings >}}) in the yaml below (in this case kafka), save as `binding.yaml`, and run `kubectl apply -f binding.yaml`.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: checkout
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

{{% /codetab %}}

{{< /tabs >}}

## 2. Send an event(Output Binding)

Below are code examples that leverage Dapr SDKs for output binding.

{{< tabs Dotnet Java Python Go Javascript>}}

{{% codetab %}}

```csharp
//dependencies
using Dapr.Client;

//code
namespace EventService
{
    class Program
    {
        static async Task Main(string[] args)
        {
          string BINDING_NAME = "checkout";
          string BINDING_OPERATION = "create";
          int orderId = 100;
          using var client = new DaprClientBuilder().Build();
          //Using Dapr SDK to invoke output binding
          await client.InvokeBindingAsync(BINDING_NAME, BINDING_OPERATION, orderId);
          Console.WriteLine("Sending message: " + orderId);
        }
    }
}

```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --app-ssl dotnet run
```

{{% /codetab %}}

{{% codetab %}}

```java
//dependencies
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.HttpExtension;

//code
@SpringBootApplication
public class OrderProcessingServiceApplication {

	public static void main(String[] args) throws InterruptedException{
		String BINDING_NAME = "checkout";
		String BINDING_OPERATION = "create";
		int orderId = 100;
    DaprClient client = new DaprClientBuilder().build();
    //Using Dapr SDK to invoke output binding
    client.invokeBinding(BINDING_NAME, BINDING_OPERATION, orderId).block();
    log.info("Sending message: " + orderId);
	}
}

```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 mvn spring-boot:run
```

{{% /codetab %}}

{{% codetab %}}

```python
#dependencies
from dapr.clients import DaprClient

#code
BINDING_NAME = 'checkout'
BINDING_OPERATION = 'create' 

orderId = 100
with DaprClient() as client:
    #Using Dapr SDK to invoke output binding
    resp = client.invoke_binding(BINDING_NAME, BINDING_OPERATION, json.dumps(orderId))
logging.basicConfig(level = logging.INFO)
logging.info('Sending message: ' + str(orderId))
    
```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --app-protocol grpc python3 OrderProcessingService.py
```

{{% /codetab %}}

{{% codetab %}}

```go
//dependencies
import (
	"context"
	"strconv"
	dapr "github.com/dapr/go-sdk/client"

)

//code
func main() {
	BINDING_NAME := "checkout";
	BINDING_OPERATION := "create";
	orderId := 100
  client, err := dapr.NewClient()
  if err != nil {
    panic(err)
  }
  defer client.Close()
  ctx := context.Background()
  //Using Dapr SDK to invoke output binding
  in := &dapr.InvokeBindingRequest{ Name: BINDING_NAME, Operation: BINDING_OPERATION , Data: []byte(strconv.Itoa(orderId))}
  err = client.InvokeOutputBinding(ctx, in)
  log.Println("Sending message: " + strconv.Itoa(orderId))
}
    
```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 go run OrderProcessingService.go
```

{{% /codetab %}}

{{% codetab %}}

```javascript
//dependencies
import { DaprServer, DaprClient, CommunicationProtocolEnum } from 'dapr-client'; 

//code
const daprHost = "127.0.0.1"; 

var main = function() {
    var orderId = 100;
    start(orderId).catch((e) => {
        console.error(e);
        process.exit(1);
    });
}

async function start(orderId) {
    const BINDING_NAME = "checkout";
    const BINDING_OPERATION = "create";
    const client = new DaprClient(daprHost, process.env.DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
    //Using Dapr SDK to invoke output binding
    const result = await client.binding.send(BINDING_NAME, BINDING_OPERATION, { orderId: orderId });
    console.log("Sending message: " + orderId);
}

main();
    
```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 npm start
```

{{% /codetab %}}

{{< /tabs >}}

All that's left now is to invoke the output bindings endpoint on a running Dapr instance.

You can also invoke the output bindings endpoint using HTTP:

```bash
curl -X POST -H 'Content-Type: application/json' http://localhost:3601/v1.0/bindings/checkout -d '{ "data": { "orderId": "100" }, "operation": "create" }'
```

As seen above, you invoked the `/binding` endpoint with the name of the binding to invoke, in our case its `checkout`.
The payload goes inside the mandatory `data` field, and can be any JSON serializable value.

You'll also notice that there's an `operation` field that tells the binding what you need it to do.
You can check [here]({{< ref supported-bindings >}}) which operations are supported for every output binding.

Watch this [video](https://www.youtube.com/watch?v=ysklxm81MTs&feature=youtu.be&t=1960) on how to use bi-directional output bindings.

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube.com/embed/ysklxm81MTs?start=1960" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## References

- [Binding API]({{< ref bindings_api.md >}})
- [Binding components]({{< ref bindings >}})
- [Binding detailed specifications]({{< ref supported-bindings >}})