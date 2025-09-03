---
type: docs
title: "How-To: Use output bindings to interface with external resources"
linkTitle: "How-To: Output bindings"
description: "Invoke external systems with output bindings"
weight: 300
---


With output bindings, you can invoke external resources. An optional payload and metadata can be sent with the invocation request.

<img src="/images/howto-bindings/kafka-output-binding.png" width=1000 alt="Diagram showing bindings of example service">

This guide uses a Kafka binding as an example. You can find your preferred binding spec from [the list of bindings components]({{% ref setup-bindings %}}). In this guide:

1. The example invokes the `/binding` endpoint with `checkout`, the name of the binding to invoke.
1. The payload goes inside the mandatory `data` field, and can be any JSON serializable value.
1. The `operation` field tells the binding what action it needs to take. For example, [the Kafka binding supports the `create` operation]({{% ref "kafka#binding-support" %}}).
   - You can check [which operations (specific to each component) are supported for every output binding]({{% ref supported-bindings %}}).

{{% alert title="Note" color="primary" %}}
 If you haven't already, [try out the bindings quickstart]({{% ref bindings-quickstart %}}) for a quick walk-through on how to use the bindings API.

{{% /alert %}}

## Create a binding

Create a `binding.yaml` file and save to a `components` sub-folder in your application directory.

Create a new binding component named `checkout`. Within the `metadata` section, configure the following Kafka-related properties:

- The topic to which you'll publish the message
- The broker

When creating the binding component, [specify the supported `direction` of the binding]({{% ref "bindings_api#binding-direction-optional" %}}). 

{{< tabpane text=true >}}

{{% tab "Self-Hosted (CLI)" %}}

Use the `--resources-path` flag with `dapr run` to point to your custom resources directory.

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
    value: false
  - name: direction
    value: output
```

{{% /tab %}}

{{% tab "Kubernetes" %}}

To deploy the following `binding.yaml` file into a Kubernetes cluster, run `kubectl apply -f binding.yaml`.

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
    value: false
  - name: direction
    value: output
```

{{% /tab %}}

{{< /tabpane >}}

## Send an event (output binding)

The code examples below leverage Dapr SDKs to invoke the output bindings endpoint on a running Dapr instance. 

{{< tabpane text=true >}}

{{% tab ".NET" %}}

Here's an example of using a console app with top-level statements in .NET 6+:

```csharp
using System.Text;
using System.Threading.Tasks;
using Dapr.Client;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprClient();
var app = builder.Build();

const string BINDING_NAME = "checkout";
const string BINDING_OPERATION = "create";

var random = new Random();
using var daprClient = app.Services.GetRequiredService<DaprClient>();

while (true)
{
    await Task.Delay(TimeSpan.FromSeconds(5));
    var orderId = random.Next(1, 1000);
    await client.InvokeBindingAsync(BINDING_NAME, BINDING_OPERATION, orderId);
    Console.WriteLine($"Sending message: {orderId}"); 
}
```

{{% /tab %}}

{{% tab "Java" %}}

```java
//dependencies
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.HttpExtension;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Random;
import java.util.concurrent.TimeUnit;

//code
@SpringBootApplication
public class OrderProcessingServiceApplication {

	private static final Logger log = LoggerFactory.getLogger(OrderProcessingServiceApplication.class);

	public static void main(String[] args) throws InterruptedException{
		String BINDING_NAME = "checkout";
		String BINDING_OPERATION = "create";
		while(true) {
			TimeUnit.MILLISECONDS.sleep(5000);
			Random random = new Random();
			int orderId = random.nextInt(1000-1) + 1;
			DaprClient client = new DaprClientBuilder().build();
          //Using Dapr SDK to invoke output binding
			client.invokeBinding(BINDING_NAME, BINDING_OPERATION, orderId).block();
			log.info("Sending message: " + orderId);
		}
	}
}

```

{{% /tab %}}

{{% tab "Python" %}}

```python
#dependencies
import random
from time import sleep    
import requests
import logging
import json
from dapr.clients import DaprClient

#code
logging.basicConfig(level = logging.INFO)
BINDING_NAME = 'checkout'
BINDING_OPERATION = 'create' 
while True:
    sleep(random.randrange(50, 5000) / 1000)
    orderId = random.randint(1, 1000)
    with DaprClient() as client:
        #Using Dapr SDK to invoke output binding
        resp = client.invoke_binding(BINDING_NAME, BINDING_OPERATION, json.dumps(orderId))
    logging.basicConfig(level = logging.INFO)
    logging.info('Sending message: ' + str(orderId))
    
```

{{% /tab %}}

{{% tab "Go" %}}

```go
//dependencies
import (
	"context"
	"log"
	"math/rand"
	"time"
	"strconv"
	dapr "github.com/dapr/go-sdk/client"

)

//code
func main() {
	BINDING_NAME := "checkout";
	BINDING_OPERATION := "create";
	for i := 0; i < 10; i++ {
		time.Sleep(5000)
		orderId := rand.Intn(1000-1) + 1
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
}
    
```

{{% /tab %}}

{{% tab "JavaScript%}}" %}}

```javascript
//dependencies
import { DaprClient, CommunicationProtocolEnum } from "@dapr/dapr";

//code
const daprHost = "127.0.0.1";

(async function () {
    for (var i = 0; i < 10; i++) {
        await sleep(2000);
        const orderId = Math.floor(Math.random() * (1000 - 1) + 1);
        try {
            await sendOrder(orderId)
        } catch (err) {
            console.error(e);
            process.exit(1);
        }
    }
})();

async function sendOrder(orderId) {
    const BINDING_NAME = "checkout";
    const BINDING_OPERATION = "create";
    const client = new DaprClient({
        daprHost,
        daprPort: process.env.DAPR_HTTP_PORT,
        communicationProtocol: CommunicationProtocolEnum.HTTP,
    });
    //Using Dapr SDK to invoke output binding
    const result = await client.binding.send(BINDING_NAME, BINDING_OPERATION, orderId);
    console.log("Sending message: " + orderId);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
```

{{% /tab %}}

{{< /tabpane >}}

You can also invoke the output bindings endpoint using HTTP:

```bash
curl -X POST -H 'Content-Type: application/json' http://localhost:3601/v1.0/bindings/checkout -d '{ "data": 100, "operation": "create" }'
```

Watch this [video](https://www.youtube.com/watch?v=ysklxm81MTs&feature=youtu.be&t=1960) on how to use bi-directional output bindings.

{{< youtube id=ysklxm81MTs start=1960 >}}

## References

- [Binding API]({{% ref bindings_api %}})
- [Binding components]({{% ref bindings %}})
- [Binding detailed specifications]({{% ref supported-bindings %}})
