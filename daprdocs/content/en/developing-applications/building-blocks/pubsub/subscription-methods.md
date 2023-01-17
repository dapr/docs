---
type: docs
title: "Declarative and programmatic subscription methods"
linkTitle: "Subscription methods"
weight: 3000
description: "Learn more about the methods by which Dapr allows you to subscribe to topics."
---

## Pub/sub API subscription methods

Dapr applications can subscribe to published topics via two methods that support the same features: declarative and programmatic.

| Subscription method | Description |
| ------------------- | ----------- |
| [**Declarative**]({{< ref "subscription-methods.md#declarative-subscriptions" >}}) | Subscription is defined in an **external file**. The declarative approach removes the Dapr dependency from your code and allows for existing applications to subscribe to topics, without having to change code. |
| [**Programmatic**]({{< ref "subscription-methods.md#programmatic-subscriptions" >}}) | Subscription is defined in the **application code**. The programmatic approach implements the subscription in your code. |

The examples below demonstrate pub/sub messaging between a `checkout` app and an `orderprocessing` app via the `orders` topic. The examples demonstrate the same Dapr pub/sub component used first declaratively, then programmatically.

### Declarative subscriptions

You can subscribe declaratively to a topic using an external component file. This example uses a YAML component file named `subscription.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Subscription
metadata:
  name: order
spec:
  topic: orders
  route: /checkout
  pubsubname: pubsub
scopes:
- orderprocessing
- checkout
```

Here the subscription called `order`: 
- Uses the pub/sub component called `pubsub` to subscribes to the topic called `orders`.
- Sets the `route` field to send all topic messages to the `/checkout` endpoint in the app.
- Sets `scopes` field to scope this subscription for access only by apps with IDs `orderprocessing` and `checkout`.

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
[HttpPost("checkout")]
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
@PostMapping(path = "/checkout")
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
@app.route('/checkout', methods=['POST'])
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
app.post('/checkout', (req, res) => {
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
	Route:      "/checkout",
}

func eventHandler(ctx context.Context, e *common.TopicEvent) (retry bool, err error) {
	log.Printf("Subscriber received: %s", e.Data)
	return false, nil
}
```

{{% /codetab %}}

{{< /tabs >}}

The `/checkout` endpoint matches the `route` defined in the subscriptions and this is where Dapr sends all topic messages to.

### Programmatic subscriptions

The programmatic approach returns the `routes` JSON structure within the code, unlike the declarative approach's `route` YAML structure. In the example below, you define the values found in the [declarative YAML subscription](#declarative-subscriptions) above within the application code.

{{< tabs ".NET" Java Python JavaScript Go>}}

{{% codetab %}}

```csharp
[Topic("pubsub", "orders")]
[HttpPost("/checkout")]
public async Task<ActionResult<Order>>Checkout(Order order, [FromServices] DaprClient daprClient)
{
    // Logic
    return order;
}
```

or

```csharp
// Dapr subscription in [Topic] routes orders topic to this route
app.MapPost("/checkout", [Topic("pubsub", "orders")] (Order order) => {
    Console.WriteLine("Subscriber received : " + order);
    return Results.Ok(order);
});
```

{{% /codetab %}}

{{% codetab %}}

```java
private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

@Topic(name = "checkout", pubsubName = "pubsub")
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
```

{{% /codetab %}}

{{% codetab %}}

```python
@app.route('/dapr/subscribe', methods=['GET'])
def subscribe():
    subscriptions = [
      {
        'pubsubname': 'pubsub',
        'topic': 'checkout',
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
      topic: "checkout",
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
			Topic:      "checkout",
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
