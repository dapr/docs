---
type: docs
title: "How-To: Trigger your application with input bindings"
linkTitle: "How-To: Input bindings"
description: "Use Dapr input bindings to trigger event driven applications"
weight: 200
---

With input bindings, you can trigger your application when an event from an external resource occurs. An external resource could be a queue, messaging pipeline, cloud-service, filesystem, etc. An optional payload and metadata may be sent with the request.

Input bindings are ideal for event-driven processing, data pipelines, or generally reacting to events and performing further processing. Dapr input bindings allow you to:

- Receive events without including specific SDKs or libraries
- Replace bindings without changing your code
- Focus on business logic and not the event resource implementation

<img src="/images/howto-triggers/kafka-input-binding.png" width=1000 alt="Diagram showing bindings of example service">

This guide uses a Kafka binding as an example. You can find your preferred binding spec from [the list of bindings components]({{< ref setup-bindings >}}). In this guide:

1. The example invokes the `/binding` endpoint with `checkout`, the name of the binding to invoke.
1. The payload goes inside the mandatory `data` field, and can be any JSON serializable value.
1. The `operation` field tells the binding what action it needs to take. For example, [the Kafka binding supports the `create` operation]({{< ref "kafka.md#binding-support" >}}).
   - You can check [which operations (specific to each component) are supported for every output binding]({{< ref supported-bindings >}}).

{{% alert title="Note" color="primary" %}}
 If you haven't already, [try out the bindings quickstart]({{< ref bindings-quickstart.md >}}) for a quick walk-through on how to use the bindings API.

{{% /alert %}}

## Create a binding

Create a `binding.yaml` file and save to a `components` sub-folder in your application directory.

Create a new binding component named `checkout`. Within the `metadata` section, configure the following Kafka-related properties:

- The topic to which you'll publish the message
- The broker

When creating the binding component, [specify the supported `direction` of the binding]({{< ref "bindings_api.md#binding-direction-optional" >}}). 

{{< tabs "Self-Hosted (CLI)" Kubernetes >}}

{{% codetab %}}

Use the `--resources-path` flag with the `dapr run` command to point to your custom resources directory.

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
    value: input
```

{{% /codetab %}}

{{% codetab %}}

To deploy into a Kubernetes cluster, run `kubectl apply -f binding.yaml`.

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
    value: input
```

{{% /codetab %}}

{{< /tabs >}}

## Listen for incoming events (input binding)

Configure your application to receive incoming events. If you're using HTTP, you need to:
- Listen on a `POST` endpoint with the name of the binding, as specified in `metadata.name` in the `binding.yaml` file. 
- Verify your application allows Dapr to make an `OPTIONS` request for this endpoint.

Below are code examples that leverage Dapr SDKs to demonstrate an output binding.

{{< tabs Dotnet Java Python Go JavaScript>}}

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

{{% /codetab %}}

{{% codetab %}}

```javascript
//dependencies 
import { DaprServer, CommunicationProtocolEnum } from '@dapr/dapr'; 

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
    const server = new DaprServer({
        serverHost,
        serverPort,
        communicationProtocol: CommunicationProtocolEnum.HTTP,
        clientOptions: {
            daprHost,
            daprPort, 
        }
    });
    await server.binding.receive('checkout', async (orderId) => console.log(`Received Message: ${JSON.stringify(orderId)}`));
    await server.startServer();
}

```

{{% /codetab %}}

{{< /tabs >}}

### ACK an event

Tell Dapr you've successfully processed an event in your application by returning a `200 OK` response from your HTTP handler.

### Reject an event

Tell Dapr the event was not processed correctly in your application and schedule it for redelivery by returning any response other than `200 OK`. For example, a `500 Error`.

### Specify a custom route

By default, incoming events will be sent to an HTTP endpoint that corresponds to the name of the input binding. You can override this by setting the following metadata property in `binding.yaml`:

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

- [Bindings building block]({{< ref bindings >}})
- [Bindings API]({{< ref bindings_api.md >}})
- [Components concept]({{< ref components-concept.md >}})
- [Supported bindings]({{< ref supported-bindings >}})