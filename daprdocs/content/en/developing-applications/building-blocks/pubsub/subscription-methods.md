---
type: docs
title: "Declarative, streaming, and programmatic subscription types"
linkTitle: "Subscription types"
weight: 3000
description: "Learn more about the subscription types that allow you to subscribe to message topics."
---

## Pub/sub API subscription types

Dapr applications can subscribe to published topics via three subscription types that support the same features: declarative, streaming and programmatic.

| Subscription type | Description |
| ------------------- | ----------- |
| [**Declarative**]({{< ref "subscription-methods.md#declarative-subscriptions" >}}) | Subscription is defined in an **external file**. The declarative approach removes the Dapr dependency from your code and allows for existing applications to subscribe to topics, without having to change code. |
| [**Streaming**]({{< ref "subscription-methods.md#streaming-subscriptions" >}}) | Subscription is defined in the **application code**. Streaming subscriptions are dynamic, meaning they allow for adding or removing subscriptions at runtime. They do not require a subscription endpoint in your application (that is required by both programmatic and declarative subscriptions), making them easy to configure in code. Streaming subscriptions also do not require an app to be configured with the sidecar to receive messages. |
| [**Programmatic**]({{< ref "subscription-methods.md#programmatic-subscriptions" >}}) | Subscription is defined in the **application code**. The programmatic approach implements the static subscription and requires an endpoint in your code. |

The examples below demonstrate pub/sub messaging between a `checkout` app and an `orderprocessing` app via the `orders` topic. The examples demonstrate the same Dapr pub/sub component used first declaratively, then programmatically.

### Declarative subscriptions

{{% alert title="Note" color="primary" %}}
This feature is currently in preview.
Dapr can be made to "hot reload" declarative subscriptions, whereby updates are picked up automatically without needing a restart.
This is enabled by via the [`HotReload` feature gate]({{< ref "support-preview-features.md" >}}).
To prevent reprocessing or loss of unprocessed messages, in-flight messages between Dapr and your application are unaffected during hot reload events.
{{% /alert %}}

You can subscribe declaratively to a topic using an external component file. This example uses a YAML component file named `subscription.yaml`:

```yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: order
spec:
  topic: orders
  routes:
    default: /orders
  pubsubname: pubsub
scopes:
- orderprocessing
```

Here the subscription called `order`: 
- Uses the pub/sub component called `pubsub` to subscribes to the topic called `orders`.
- Sets the `route` field to send all topic messages to the `/orders` endpoint in the app.
- Sets `scopes` field to scope this subscription for access only by apps with ID `orderprocessing`.

When running Dapr, set the YAML component file path to point Dapr to the component.

{{< tabs ".NET" Java Python JavaScript Go Kubernetes>}}

{{% codetab %}}

```bash
dapr run --app-id myapp --resources-path ./myComponents -- dotnet run
```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr run --app-id myapp --resources-path ./myComponents -- mvn spring-boot:run
```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr run --app-id myapp --resources-path ./myComponents -- python3 app.py
```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr run --app-id myapp --resources-path ./myComponents -- npm start
```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr run --app-id myapp --resources-path ./myComponents -- go run app.go
```

{{% /codetab %}}

{{% codetab %}}

In Kubernetes, apply the component to the cluster:

```bash
kubectl apply -f subscription.yaml
```

{{% /codetab %}}

{{< /tabs >}}

In your application code, subscribe to the topic specified in the Dapr pub/sub component.

{{< tabs ".NET" Java Python JavaScript Go >}}

{{% codetab %}}

```csharp
 //Subscribe to a topic 
[HttpPost("orders")]
public void getCheckout([FromBody] int orderId)
{
    Console.WriteLine("Subscriber received : " + orderId);
}
```

{{% /codetab %}}

{{% codetab %}}

```java
import io.dapr.client.domain.CloudEvent;

 //Subscribe to a topic
@PostMapping(path = "/orders")
public Mono<Void> getCheckout(@RequestBody(required = false) CloudEvent<String> cloudEvent) {
    return Mono.fromRunnable(() -> {
        try {
            log.info("Subscriber received: " + cloudEvent.getData());
        } 
    });
}
```

{{% /codetab %}}

{{% codetab %}}

```python
from cloudevents.sdk.event import v1

#Subscribe to a topic 
@app.route('/orders', methods=['POST'])
def checkout(event: v1.Event) -> None:
    data = json.loads(event.Data())
    logging.info('Subscriber received: ' + str(data))
```

{{% /codetab %}}

{{% codetab %}}

```javascript
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json({ type: 'application/*+json' }));

// listen to the declarative route
app.post('/orders', (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});
```

{{% /codetab %}}

{{% codetab %}}

```go
//Subscribe to a topic
var sub = &common.Subscription{
	PubsubName: "pubsub",
	Topic:      "orders",
	Route:      "/orders",
}

func eventHandler(ctx context.Context, e *common.TopicEvent) (retry bool, err error) {
	log.Printf("Subscriber received: %s", e.Data)
	return false, nil
}
```

{{% /codetab %}}

{{< /tabs >}}

The `/orders` endpoint matches the `route` defined in the subscriptions and this is where Dapr sends all topic messages to.

### Streaming subscriptions

Streaming subscriptions are subscriptions defined in application code that can be dynamically stopped and started at runtime.
Messages are pulled by the application from Dapr. This means no endpoint is needed to subscribe to a topic, and it's possible to subscribe without any app configured on the sidecar at all.
Any number of pubsubs and topics can be subscribed to at once.
As messages are sent to the given message handler code, there is no concept of routes or bulk subscriptions.

> **Note:** Only a single pubsub/topic pair per application may be subscribed at a time.

The example below shows the different ways to stream subscribe to a topic.

{{< tabs Python Go >}}

{{% codetab %}}

You can use the `subscribe` method, which returns a `Subscription` object and allows you to pull messages from the stream by calling the `next_message` method. This runs in and may block the main thread while waiting for messages. 

```python
import time

from dapr.clients import DaprClient
from dapr.clients.grpc.subscription import StreamInactiveError

counter = 0


def process_message(message):
    global counter
    counter += 1
    # Process the message here
    print(f'Processing message: {message.data()} from {message.topic()}...')
    return 'success'


def main():
    with DaprClient() as client:
        global counter

        subscription = client.subscribe(
            pubsub_name='pubsub', topic='orders', dead_letter_topic='orders_dead'
        )

        try:
            while counter < 5:
                try:
                    message = subscription.next_message()

                except StreamInactiveError as e:
                    print('Stream is inactive. Retrying...')
                    time.sleep(1)
                    continue
                if message is None:
                    print('No message received within timeout period.')
                    continue

                # Process the message
                response_status = process_message(message)

                if response_status == 'success':
                    subscription.respond_success(message)
                elif response_status == 'retry':
                    subscription.respond_retry(message)
                elif response_status == 'drop':
                    subscription.respond_drop(message)

        finally:
            print("Closing subscription...")
            subscription.close()


if __name__ == '__main__':
    main()

```

You can also use the `subscribe_with_handler` method, which accepts a callback function executed for each message received from the stream. This runs in a separate thread, so it doesn't block the main thread. 

```python
import time

from dapr.clients import DaprClient
from dapr.clients.grpc._response import TopicEventResponse

counter = 0


def process_message(message):
    # Process the message here
    global counter
    counter += 1
    print(f'Processing message: {message.data()} from {message.topic()}...')
    return TopicEventResponse('success')


def main():
    with (DaprClient() as client):
        # This will start a new thread that will listen for messages
        # and process them in the `process_message` function
        close_fn = client.subscribe_with_handler(
            pubsub_name='pubsub', topic='orders', handler_fn=process_message,
            dead_letter_topic='orders_dead'
        )

        while counter < 5:
            time.sleep(1)

        print("Closing subscription...")
        close_fn()


if __name__ == '__main__':
    main()
```

[Learn more about streaming subscriptions using the Python SDK client.]({{< ref "python-client.md#streaming-message-subscription" >}})

{{% /codetab %}}

{{% codetab %}}

```go
package main

import (
	"context"
	"log"

	"github.com/dapr/go-sdk/client"
)

func main() {
	cl, err := client.NewClient()
	if err != nil {
		log.Fatal(err)
	}

	sub, err := cl.Subscribe(context.Background(), client.SubscriptionOptions{
		PubsubName: "pubsub",
		Topic:      "orders",
	})
	if err != nil {
		panic(err)
	}
	// Close must always be called.
	defer sub.Close()

	for {
		msg, err := sub.Receive()
		if err != nil {
			panic(err)
		}

		// Process the event

		// We _MUST_ always signal the result of processing the message, else the
		// message will not be considered as processed and will be redelivered or
		// dead lettered.
		// msg.Retry()
		// msg.Drop()
		if err := msg.Success(); err != nil {
			panic(err)
		}
	}
}
```

or

```go
package main

import (
	"context"
	"log"

	"github.com/dapr/go-sdk/client"
	"github.com/dapr/go-sdk/service/common"
)

func main() {
	cl, err := client.NewClient()
	if err != nil {
		log.Fatal(err)
	}

	stop, err := cl.SubscribeWithHandler(context.Background(),
		client.SubscriptionOptions{
			PubsubName: "pubsub",
			Topic:      "orders",
		},
		eventHandler,
	)
	if err != nil {
		panic(err)
	}

	// Stop must always be called.
	defer stop()

	<-make(chan struct{})
}

func eventHandler(e *common.TopicEvent) common.SubscriptionResponseStatus {
	// Process message here
    // common.SubscriptionResponseStatusRetry
    // common.SubscriptionResponseStatusDrop
			common.SubscriptionResponseStatusDrop, status)
	}

	return common.SubscriptionResponseStatusSuccess
}
```

{{% /codetab %}}

{{< /tabs >}}

## Demo

Watch [this video for an overview on streaming subscriptions](https://youtu.be/57l-QDwgI-Y?t=841):

<iframe width="560" height="315" src="https://www.youtube.com/embed/57l-QDwgI-Y?si=EJj3uo306vBUvl3Y&amp;start=841" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### Programmatic subscriptions

The dynamic programmatic approach returns the `routes` JSON structure within the code, unlike the declarative approach's `route` YAML structure. 

> **Note:** Programmatic subscriptions are only read once during application start-up. You cannot _dynamically_ add new programmatic subscriptions, only at new ones at compile time.

In the example below, you define the values found in the [declarative YAML subscription](#declarative-subscriptions) above within the application code.

{{< tabs ".NET" Java Python JavaScript Go>}}

{{% codetab %}}

```csharp
[Topic("pubsub", "orders")]
[HttpPost("/orders")]
public async Task<ActionResult<Order>>Checkout(Order order, [FromServices] DaprClient daprClient)
{
    // Logic
    return order;
}
```

or

```csharp
// Dapr subscription in [Topic] routes orders topic to this route
app.MapPost("/orders", [Topic("pubsub", "orders")] (Order order) => {
    Console.WriteLine("Subscriber received : " + order);
    return Results.Ok(order);
});
```

Both of the handlers defined above also need to be mapped to configure the `dapr/subscribe` endpoint. This is done in the application startup code while defining endpoints.

```csharp
app.UseEndpoints(endpoints =>
{
    endpoints.MapSubscribeHandler();
});
```

{{% /codetab %}}

{{% codetab %}}

```java
private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

@Topic(name = "orders", pubsubName = "pubsub")
@PostMapping(path = "/orders")
public Mono<Void> handleMessage(@RequestBody(required = false) CloudEvent<String> cloudEvent) {
  return Mono.fromRunnable(() -> {
    try {
      System.out.println("Subscriber received: " + cloudEvent.getData());
      System.out.println("Subscriber received: " + OBJECT_MAPPER.writeValueAsString(cloudEvent));
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  });
}
```

{{% /codetab %}}

{{% codetab %}}

```python
@app.route('/dapr/subscribe', methods=['GET'])
def subscribe():
    subscriptions = [
      {
        'pubsubname': 'pubsub',
        'topic': 'orders',
        'routes': {
          'rules': [
            {
              'match': 'event.type == "order"',
              'path': '/orders'
            },
          ],
          'default': '/orders'
        }
      }]
    return jsonify(subscriptions)

@app.route('/orders', methods=['POST'])
def ds_subscriber():
    print(request.json, flush=True)
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'}
app.run()
```

{{% /codetab %}}

{{% codetab %}}

```javascript
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json({ type: 'application/*+json' }));

const port = 3000

app.get('/dapr/subscribe', (req, res) => {
  res.json([
    {
      pubsubname: "pubsub",
      topic: "orders",
      routes: {
        rules: [
          {
            match: 'event.type == "order"',
            path: '/orders'
          },
        ],
        default: '/products'
      }
    }
  ]);
})

app.post('/orders', (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});

app.listen(port, () => console.log(`consumer app listening on port ${port}!`))
```

{{% /codetab %}}

{{% codetab %}}

```go
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

const appPort = 3000

type subscription struct {
	PubsubName string            `json:"pubsubname"`
	Topic      string            `json:"topic"`
	Metadata   map[string]string `json:"metadata,omitempty"`
	Routes     routes            `json:"routes"`
}

type routes struct {
	Rules   []rule `json:"rules,omitempty"`
	Default string `json:"default,omitempty"`
}

type rule struct {
	Match string `json:"match"`
	Path  string `json:"path"`
}

// This handles /dapr/subscribe
func configureSubscribeHandler(w http.ResponseWriter, _ *http.Request) {
	t := []subscription{
		{
			PubsubName: "pubsub",
			Topic:      "orders",
			Routes: routes{
				Rules: []rule{
					{
						Match: `event.type == "order"`,
						Path:  "/orders",
					},
				},
				Default: "/orders",
			},
		},
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(t)
}

func main() {
	router := mux.NewRouter().StrictSlash(true)
	router.HandleFunc("/dapr/subscribe", configureSubscribeHandler).Methods("GET")
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", appPort), router))
}
```
{{% /codetab %}}

{{< /tabs >}}

## Next Steps

* Try out the [pub/sub Quickstart]({{< ref pubsub-quickstart.md >}})
* Follow: [How-To: Configure pub/sub components with multiple namespaces]({{< ref pubsub-namespaces.md >}})
* Learn more about [declarative and programmatic subscription methods]({{< ref subscription-methods >}}). 
* Learn about [topic scoping]({{< ref pubsub-scopes.md >}})
* Learn about [message TTL]({{< ref pubsub-message-ttl.md >}})
* Learn more about [pub/sub with and without CloudEvent]({{< ref pubsub-cloudevents.md >}})
* List of [pub/sub components]({{< ref supported-pubsub.md >}})
* Read the [pub/sub API reference]({{< ref pubsub_api.md >}})
