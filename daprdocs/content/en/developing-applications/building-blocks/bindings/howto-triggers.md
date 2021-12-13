---
type: docs
title: "How-To: Trigger your application with input bindings"
linkTitle: "How-To: Input bindings"
description: "Use Dapr input bindings to trigger event driven applications"
weight: 200
---

Using bindings, your code can be triggered with incoming events from different resources which can be anything: a queue, messaging pipeline, cloud-service, filesystem etc.

This is ideal for event-driven processing, data pipelines or just generally reacting to events and doing further processing.

Dapr bindings allow you to:

* Receive events without including specific SDKs or libraries
* Replace bindings without changing your code
* Focus on business logic and not the event resource implementation

For more info on bindings, read [this overview]({{<ref bindings-overview.md>}}).

## Example:

The below code example loosely describes an application that processes orders. In the example, there is an order processing service which has a Dapr sidecar. The checkout service uses Dapr to trigger the application via an input binding.

<img src="/images/building-block-input-binding-example.png" width=1000 alt="Diagram showing bindings of example service">

## 1. Create a binding

An input binding represents a resource that Dapr uses to read events from and push to your application.

For the purpose of this guide, you'll use a Kafka binding. You can find a list of supported binding components [here]({{< ref setup-bindings >}}).

Create a new binding component with the name of `checkout`.

Inside the `metadata` section, configure Kafka related properties, such as the topic to publish the message to and the broker.

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

## 2. Listen for incoming events (input binding)

Now configure your application to receive incoming events. If using HTTP, you need to listen on a `POST` endpoint with the name of the binding as specified in `metadata.name` in the file. 

Below are code examples that leverage Dapr SDKs to demonstrate an output binding.

{{< tabs Dotnet Java Python Go Javascript>}}

{{% codetab %}}

```csharp
//dependencies
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Mvc;

//code
namespace CheckoutService.controller
{
    [ApiController]
    public class CheckoutServiceController : Controller
    {
        [HttpPost("/checkout")]
        public ActionResult<string> getCheckout([FromBody] int orderId)
        {
            Console.WriteLine("Received Message: " + orderId);
            return "CID" + orderId;
        }
    }
}

```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 --app-ssl dotnet run
```

{{% /codetab %}}

{{% codetab %}}

```java
//dependencies
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Mono;

//code
@RestController
@RequestMapping("/")
public class CheckoutServiceController {
    private static final Logger log = LoggerFactory.getLogger(CheckoutServiceController.class);
        @PostMapping(path = "/checkout")
        public Mono<String> getCheckout(@RequestBody(required = false) byte[] body) {
            return Mono.fromRunnable(() ->
                    log.info("Received Message: " + new String(body)));
        }
}

```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 mvn spring-boot:run
```

{{% /codetab %}}

{{% codetab %}}

```python
#dependencies
import logging
from dapr.ext.grpc import App, BindingRequest

#code
app = App()

@app.binding('checkout')
def getCheckout(request: BindingRequest):
    logging.basicConfig(level = logging.INFO)
    logging.info('Received Message : ' + request.text())

app.run(6002)

```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --app-protocol grpc -- python3 CheckoutService.py
```

{{% /codetab %}}

{{% codetab %}}

```go
//dependencies
import (
	"encoding/json"
	"log"
	"net/http"
	"github.com/gorilla/mux"
)

//code
func getCheckout(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var orderId int
	err := json.NewDecoder(r.Body).Decode(&orderId)
	log.Println("Received Message: ", orderId)
	if err != nil {
		log.Printf("error parsing checkout input binding payload: %s", err)
		w.WriteHeader(http.StatusOK)
		return
	}
}

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/checkout", getCheckout).Methods("POST", "OPTIONS")
	http.ListenAndServe(":6002", r)
}

```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 go run CheckoutService.go
```

{{% /codetab %}}

{{% codetab %}}

```javascript
//dependencies 
import { DaprServer, CommunicationProtocolEnum } from 'dapr-client'; 

//code
const daprHost = "127.0.0.1"; 
const serverHost = "127.0.0.1";
const serverPort = "6002"; 
const daprPort = "3602"; 

start().catch((e) => {
    console.error(e);
    process.exit(1);
});

async function start() {
    const server = new DaprServer(serverHost, serverPort, daprHost, daprPort, CommunicationProtocolEnum.HTTP);
    await server.binding.receive('checkout', async (orderId) => console.log(`Received Message: ${JSON.stringify(orderId)}`));
    await server.startServer();
}

```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 dotnet npm start
```

{{% /codetab %}}

{{< /tabs >}}

### ACK-ing an event

In order to tell Dapr that you successfully processed an event in your application, return a `200 OK` response from your HTTP handler.

### Rejecting an event

In order to tell Dapr that the event was not processed correctly in your application and schedule it for redelivery, return any response other than `200 OK`. For example, a `500 Error`.

### Specifying a custom route

By default, incoming events will be sent to an HTTP endpoint that corresponds to the name of the input binding.
You can override this by setting the following metadata property:

```yaml
name: mybinding
spec:
  type: binding.rabbitmq
  metadata:
  - name: route
    value: /onevent
```

### Event delivery Guarantees
Event delivery guarantees are controlled by the binding implementation. Depending on the binding implementation, the event delivery can be exactly once or at least once.

## References

* [Bindings building block]({{< ref bindings >}})
* [Bindings API]({{< ref bindings_api.md >}})
* [Components concept]({{< ref components-concept.md >}})
* [Supported bindings]({{< ref supported-bindings >}})
