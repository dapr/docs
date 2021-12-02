---
type: docs
title: "How-To: Publish a message and subscribe to a topic"
linkTitle: "How-To: Publish & subscribe"
weight: 2000
description: "Learn how to send messages to a topic with one service and subscribe to that topic in another service"
---

## Introduction

Pub/Sub is a common pattern in a distributed system with many services that want to utilize decoupled, asynchronous messaging.
Using Pub/Sub, you can enable scenarios where event consumers are decoupled from event producers.

Dapr provides an extensible Pub/Sub system with At-Least-Once guarantees, allowing developers to publish and subscribe to topics.
Dapr provides components for pub/sub, that enable operators to use their preferred infrastructure, for example Redis Streams, Kafka, etc.

## Content Types

When publishing a message, it's important to specify the content type of the data being sent.
Unless specified, Dapr will assume `text/plain`. When using Dapr's HTTP API, the content type can be set in a `Content-Type` header.
gRPC clients and SDKs have a dedicated content type parameter.

## Example:

<<<<<<< HEAD
The below code example loosely describes an application that processes orders. In the example, there are two services - an order processing service and a checkout service. Both services have Dapr sidecars. The order processing service uses Dapr to publish a message to RabbitMQ and the checkout service subscribes to the topic in the message queue.
=======
The below code examples loosely describes an application that processes orders. In the examples, there are two services - an order processing service and a checkout service. Both services have Dapr sidecars. The order processing service uses Dapr to publish message and the checkout service subscribes to the message in Rabbit mq.
>>>>>>> 0e83af7a (Added pub sub documentation)

<img src="/images/building-block-pub-sub-example.png" width=1000 alt="Diagram showing state management of example service">

## Step 1: Setup the Pub/Sub component
The following example creates applications to publish and subscribe to a topic called `orders`.

The first step is to setup the Pub/Sub component:

{{< tabs "Self-Hosted (CLI)" Kubernetes >}}

{{% codetab %}}
<<<<<<< HEAD
The pubsub.yaml is created by default on your local machine when running `dapr init`. Verify by opening your components file under `%UserProfile%\.dapr\components\pubsub.yaml` on Windows or `~/.dapr/components/pubsub.yaml` on Linux/MacOS.

In this example, RabbitMQ is used for publish and subscribe. Replace `pubsub.yaml` file contents with the below contents.
=======
pubsub.yaml is created by default on a local machine when running `dapr init`. Verify by opening your components file under `%UserProfile%\.dapr\components\pubsub.yaml` on Windows or `~/.dapr/components/pubsub.yaml` on Linux/MacOS.

In this example, rabbit mq is used for publish and subscribe. Replace pubsub.yaml file contents with the below contents.
>>>>>>> 0e83af7a (Added pub sub documentation)

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: order_pub_sub
spec:
  type: pubsub.rabbitmq
  version: v1
  metadata:
  - name: host
    value: "amqp://localhost:5672"
  - name: durable
    value: "false"
  - name: deletedWhenUnused
    value: "false"
  - name: autoAck
    value: "false"
  - name: reconnectWait
    value: "0"
  - name: concurrency
    value: parallel
scopes:
  - orderprocessing
  - checkout
```

You can override this file with another Redis instance or another [pubsub component]({{< ref setup-pubsub >}}) by creating a `components` directory containing the file and using the flag `--components-path` with the `dapr run` CLI command.
{{% /codetab %}}

{{% codetab %}}
To deploy this into a Kubernetes cluster, fill in the `metadata` connection details of your [desired pubsub component]({{< ref setup-pubsub >}}) in the yaml below, save as `pubsub.yaml`, and run `kubectl apply -f pubsub.yaml`.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: order_pub_sub
  namespace: default
spec:
  type: pubsub.rabbitmq
  version: v1
  metadata:
  - name: host
    value: "amqp://localhost:5672"
  - name: durable
    value: "false"
  - name: deletedWhenUnused
    value: "false"
  - name: autoAck
    value: "false"
  - name: reconnectWait
    value: "0"
  - name: concurrency
    value: parallel
scopes:
  - orderprocessing
  - checkout
```
{{% /codetab %}}

{{< /tabs >}}


## Step 2: Subscribe to topics

Dapr allows two methods by which you can subscribe to topics:

- **Declaratively**, where subscriptions are defined in an external file.
- **Programmatically**, where subscriptions are defined in user code.

{{% alert title="Note" color="primary" %}}
 Both declarative and programmatic approaches support the same features. The declarative approach removes the Dapr dependency from your code and allows, for example, existing applications to subscribe to topics, without having to change code. The programmatic approach implements the subscription in your code.

{{% /alert %}}

### Declarative subscriptions

You can subscribe to a topic using the following Custom Resources Definition (CRD). Create a file named `subscription.yaml` and paste the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Subscription
metadata:
  name: order_pub_sub
spec:
  topic: orders
  route: /checkout
  pubsubname: order_pub_sub
scopes:
- orderprocessing
- checkout
```

The example above shows an event subscription to topic `orders`, for the pubsub component `order_pub_sub`.
- The `route` field tells Dapr to send all topic messages to the `/checkout` endpoint in the app.
- The `scopes` field enables this subscription for apps with IDs `orderprocessing` and `checkout`.

Set the component with:

Place the CRD in your `./components` directory. When Dapr starts up, it loads subscriptions along with components.

Note: By default, Dapr loads components from `$HOME/.dapr/components` on MacOS/Linux and `%USERPROFILE%\.dapr\components` on Windows.

You can also override the default directory by pointing the Dapr CLI to a components path:

{{< tabs Dotnet Java Python Go Javascript Kubernetes>}}

{{% codetab %}}

```bash
<<<<<<< HEAD
dapr run --app-id myapp --components-path ./myComponents -- dotnet run
=======
dapr run --app-id myapp --components-path ./myComponents -- <language_specific_command>
>>>>>>> 0e83af7a (Added pub sub documentation)
```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr run --app-id myapp --components-path ./myComponents -- mvn spring-boot:run
```

{{% /codetab %}}

{{% codetab %}}

<<<<<<< HEAD
```bash
dapr run --app-id myapp --components-path ./myComponents -- python3 app.py
```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr run --app-id myapp --components-path ./myComponents -- go run app.go
```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr run --app-id myapp --components-path ./myComponents -- npm start
```

{{% /codetab %}}
=======
Below are code examples that leverage Dapr SDKs to subscribe to a topic.

{{< tabs Dotnet Java Python Go Javascript>}}

{{% codetab %}}

```csharp

//dependencies 
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Mvc;
using Dapr;
using Dapr.Client;

//code
namespace CheckoutService.controller
{
    [ApiController]
    public class CheckoutServiceController : Controller
    {
         //Subscribe to a topic      
        [Topic("order_pub_sub", "orders")]
        [HttpPost("checkout")]
        public void getCheckout([FromBody] int orderId)
        {
            Console.WriteLine("Subscriber received : " + orderId);
        }
    }
}
```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:
>>>>>>> 0e83af7a (Added pub sub documentation)

{{% codetab %}}
In Kubernetes, save the CRD to a file and apply it to the cluster:
```bash
<<<<<<< HEAD
kubectl apply -f subscription.yaml
```
{{% /codetab %}}

{{< /tabs >}}

Below are code examples that leverage Dapr SDKs to subscribe to a topic.

{{< tabs Dotnet Java Python Go Javascript>}}

{{% codetab %}}

```csharp

//dependencies 
using Dapr;
using Dapr.Client;

//code
namespace CheckoutService.controller
{
    [ApiController]
    public class CheckoutServiceController : Controller
    {
         //Subscribe to a topic      
        [Topic("order_pub_sub", "orders")]
        [HttpPost("checkout")]
        public void getCheckout([FromBody] int orderId)
        {
            Console.WriteLine("Subscriber received : " + orderId);
        }
    }
}
```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 --app-ssl dotnet run
```

=======
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 --app-ssl dotnet run
```

>>>>>>> 0e83af7a (Added pub sub documentation)
{{% /codetab %}}

{{% codetab %}}

```java
//dependencies
import io.dapr.Topic;
import io.dapr.client.domain.CloudEvent;
<<<<<<< HEAD
=======
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
>>>>>>> 0e83af7a (Added pub sub documentation)
import reactor.core.publisher.Mono;

//code
@RestController
public class CheckoutServiceController {

    private static final Logger log = LoggerFactory.getLogger(CheckoutServiceController.class);
    //Subscribe to a topic 
    @Topic(name = "orders", pubsubName = "order_pub_sub")
    @PostMapping(path = "/checkout")
    public Mono<Void> getCheckout(@RequestBody(required = false) CloudEvent<String> cloudEvent) {
        return Mono.fromRunnable(() -> {
            try {
                log.info("Subscriber received: " + cloudEvent.getData());
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
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
from cloudevents.sdk.event import v1
from dapr.ext.grpc import App
<<<<<<< HEAD
=======
import logging
import json
>>>>>>> 0e83af7a (Added pub sub documentation)

#code
app = App()
logging.basicConfig(level = logging.INFO)

#Subscribe to a topic 
@app.subscribe(pubsub_name='order_pub_sub', topic='orders')
def mytopic(event: v1.Event) -> None:
    data = json.loads(event.Data())
<<<<<<< HEAD
    logging.info('Subscriber received: ' + str(data))

app.run(6002)
=======
    logging.info('Subscriber received: ' + data)

app.run(60002)
>>>>>>> 0e83af7a (Added pub sub documentation)
```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
<<<<<<< HEAD
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --app-protocol grpc -- python3 CheckoutService.py
=======
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 -- python3 CheckoutService.py
>>>>>>> 0e83af7a (Added pub sub documentation)
```

{{% /codetab %}}

{{% codetab %}}

```go
//dependencies
import (
	"log"
	"net/http"
	"context"

	"github.com/dapr/go-sdk/service/common"
	daprd "github.com/dapr/go-sdk/service/http"
)

//code
var sub = &common.Subscription{
	PubsubName: "order_pub_sub",
	Topic:      "orders",
	Route:      "/checkout",
}

func main() {
	s := daprd.NewService(":6002")
  //Subscribe to a topic 
	if err := s.AddTopicEventHandler(sub, eventHandler); err != nil {
		log.Fatalf("error adding topic subscription: %v", err)
	}
	if err := s.Start(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("error listenning: %v", err)
	}
}

func eventHandler(ctx context.Context, e *common.TopicEvent) (retry bool, err error) {
	log.Printf("Subscriber received: %s", e.Data)
	return false, nil
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

start().catch((e) => {
    console.error(e);
    process.exit(1);
});

async function start(orderId) {
    const server = new DaprServer(
        serverHost, 
        serverPort, 
        daprHost, 
        process.env.DAPR_HTTP_PORT, 
        CommunicationProtocolEnum.HTTP
     );
     //Subscribe to a topic 
    await server.pubsub.subscribe("order_pub_sub", "orders", async (orderId) => {
        console.log(`Subscriber received: ${JSON.stringify(orderId)}`)
    });
    await server.startServer();
}

```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 npm start
```

{{% /codetab %}}

{{< /tabs >}}

The `/checkout` endpoint matches the `route` defined in the subscriptions and this is where Dapr will send all topic messages to.

## Step 3: Publish a topic

To publish a topic you need to run an instance of a Dapr sidecar to use the pubsub Redis component. You can use the default Redis component installed into your local environment.

Start an instance of Dapr with an app-id called `orderprocessing`:

```bash
<<<<<<< HEAD
<<<<<<< HEAD
dapr run --app-id orderprocessing --dapr-http-port 3601
=======
dapr run --app-id orderprocessing --dapr-http-port 3500
>>>>>>> 0e83af7a (Added pub sub documentation)
=======
dapr run --app-id orderprocessing --dapr-http-port 3601
>>>>>>> 3380b73a (Changed port number in the command)
```
{{< tabs "Dapr CLI" "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}

Then publish a message to the `orders` topic:

```bash
<<<<<<< HEAD
dapr publish --publish-app-id orderprocessing --pubsub order_pub_sub --topic orders --data '{"orderId": "100"}'
=======
dapr publish --publish-app-id testpubsub --pubsub pubsub --topic orders --data '{"orderId": "100"}'
>>>>>>> 0e83af7a (Added pub sub documentation)
```
{{% /codetab %}}

{{% codetab %}}
Then publish a message to the `orders` topic:
```bash
<<<<<<< HEAD
curl -X POST http://localhost:3601/v1.0/publish/order_pub_sub/orders -H "Content-Type: application/json" -d '{"orderId": "100"}'
=======
curl -X POST http://localhost:3601/v1.0/publish/pubsub/orders -H "Content-Type: application/json" -d '{"orderId": "100"}'
>>>>>>> 0e83af7a (Added pub sub documentation)
```
{{% /codetab %}}

{{% codetab %}}
Then publish a message to the `orders` topic:
```powershell
<<<<<<< HEAD
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '{"orderId": "100"}' -Uri 'http://localhost:3601/v1.0/publish/order_pub_sub/orders'
=======
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '{"orderId": "100"}' -Uri 'http://localhost:3601/v1.0/publish/pubsub/orders'
>>>>>>> 0e83af7a (Added pub sub documentation)
```
{{% /codetab %}}

{{< /tabs >}}

Dapr automatically wraps the user payload in a Cloud Events v1.0 compliant envelope, using `Content-Type` header value for `datacontenttype` attribute.

Below are code examples that leverage Dapr SDKs to publish a topic.

{{< tabs Dotnet Java Python Go Javascript>}}

{{% codetab %}}

```csharp

//dependencies
<<<<<<< HEAD
using Dapr.Client;
=======
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Dapr.Client;
using Microsoft.AspNetCore.Mvc;
using System.Threading;
>>>>>>> 0e83af7a (Added pub sub documentation)

//code
namespace EventService
{
    class Program
    {
        static async Task Main(string[] args)
        {
          string PUBSUB_NAME = "order_pub_sub";
          string TOPIC_NAME = "orders";
          int orderId = 100;
          CancellationTokenSource source = new CancellationTokenSource();
          CancellationToken cancellationToken = source.Token;
          using var client = new DaprClientBuilder().Build();
<<<<<<< HEAD
          //Using Dapr SDK to publish a topic
=======
          //Using Dapr SDK to publish to a topic
>>>>>>> 0e83af7a (Added pub sub documentation)
          await client.PublishEventAsync(PUBSUB_NAME, TOPIC_NAME, orderId, cancellationToken);
          Console.WriteLine("Published data: " + orderId);
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
import io.dapr.client.domain.Metadata;
import static java.util.Collections.singletonMap;
<<<<<<< HEAD
=======
import org.springframework.boot.autoconfigure.SpringBootApplication;
>>>>>>> 0e83af7a (Added pub sub documentation)

//code
@SpringBootApplication
public class OrderProcessingServiceApplication {

  public static void main(String[] args) throws InterruptedException{
    String MESSAGE_TTL_IN_SECONDS = "1000";
    String TOPIC_NAME = "orders";
    String PUBSUB_NAME = "order_pub_sub";

    int orderId = 100;
    DaprClient client = new DaprClientBuilder().build();
<<<<<<< HEAD
    //Using Dapr SDK to publish a topic
=======
    //Using Dapr SDK to publish to a topic
>>>>>>> 0e83af7a (Added pub sub documentation)
    client.publishEvent(
        PUBSUB_NAME,
        TOPIC_NAME,
        orderId,
        singletonMap(Metadata.TTL_IN_SECONDS, MESSAGE_TTL_IN_SECONDS)).block();
    log.info("Published data:" + orderId);
  }

}
<<<<<<< HEAD

```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

=======

```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

>>>>>>> 0e83af7a (Added pub sub documentation)
```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 mvn spring-boot:run
```

{{% /codetab %}}

{{% codetab %}}

```python
<<<<<<< HEAD
#dependencies  
=======
#dependencies
import random
from time import sleep    
import requests
import logging
import json
>>>>>>> 0e83af7a (Added pub sub documentation)
from dapr.clients import DaprClient

#code
logging.basicConfig(level = logging.INFO)
    
orderId = 100
<<<<<<< HEAD
with DaprClient() as client:
    #Using Dapr SDK to publish a topic
    result = client.publish_event(
        pubsub_name='order_pub_sub',
        topic_name='orders',
        data=json.dumps(orderId),
        data_content_type='application/json',
    )
logging.info('Published data: ' + str(orderId))
    
```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --app-protocol grpc python3 OrderProcessingService.py
=======
    with DaprClient() as client:
        #Using Dapr SDK to publish to a topic
        result = client.publish_event(
            pubsub_name='order_pub_sub',
            topic_name='orders',
            data=json.dumps(orderId),
            data_content_type='application/json',
        )
    logging.info('Published data: ' + str(orderId))
    
```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 -- python3 OrderProcessingService.py
>>>>>>> 0e83af7a (Added pub sub documentation)
```

{{% /codetab %}}

{{% codetab %}}

```go
//dependencies
import (
  "context"
  "log"
  "strconv"
  dapr "github.com/dapr/go-sdk/client"

)

//code
var (
  PUBSUB_NAME = "order_pub_sub"
  TOPIC_NAME  = "orders"
)

func main() {
    orderId := 100
    client, err := dapr.NewClient()
    if err != nil {
      panic(err)
    }
    defer client.Close()
    ctx := context.Background()
<<<<<<< HEAD
<<<<<<< HEAD
    //Using Dapr SDK to publish a topic
=======
    //Using Dapr SDK to publish to a topic
>>>>>>> 0e83af7a (Added pub sub documentation)
=======
    
>>>>>>> 3380b73a (Changed port number in the command)
    if err := client.PublishEvent(ctx, PUBSUB_NAME, TOPIC_NAME, []byte(strconv.Itoa(orderId))); 
    err != nil {
      panic(err)
    }
    log.Println("Published data: " + strconv.Itoa(orderId))
}
    
```
<<<<<<< HEAD

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 go run OrderProcessingService.go
```

{{% /codetab %}}

=======

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 go run OrderProcessingService.go
```

{{% /codetab %}}

>>>>>>> 0e83af7a (Added pub sub documentation)
{{% codetab %}}

```javascript
//dependencies
import { DaprServer, DaprClient, CommunicationProtocolEnum } from 'dapr-client'; 

//code
const daprHost = "127.0.0.1"; 

var main = function() {
<<<<<<< HEAD
<<<<<<< HEAD
    var orderId = 100;
=======
    var orderId = Math.floor(Math.random() * (1000 - 1) + 1);
>>>>>>> 0e83af7a (Added pub sub documentation)
=======
    var orderId = 100;
>>>>>>> 3380b73a (Changed port number in the command)
    start(orderId).catch((e) => {
        console.error(e);
        process.exit(1);
    });
}

async function start(orderId) {
    const client = new DaprClient(daprHost, process.env.DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
    console.log("Published data:" + orderId)
<<<<<<< HEAD
<<<<<<< HEAD
    //Using Dapr SDK to publish a topic
=======
    //Using Dapr SDK to publish to a topic
>>>>>>> 0e83af7a (Added pub sub documentation)
=======
>>>>>>> 3380b73a (Changed port number in the command)
    await client.pubsub.publish("order_pub_sub", "orders", orderId);
}

main();
    
```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 npm start
```

{{% /codetab %}}

{{< /tabs >}}

## Step 4: ACK-ing a message

<<<<<<< HEAD
In order to tell Dapr that a message was processed successfully, return a `200 OK` response. If Dapr receives any other return status code than `200`, or if your app crashes, Dapr will attempt to redeliver the message following at-least-once semantics.
=======
In order to tell Dapr that a message was processed successfully, return a `200 OK` response. If Dapr receives any other return status code than `200`, or if your app crashes, Dapr will attempt to redeliver the message following At-Least-Once semantics.
>>>>>>> 0e83af7a (Added pub sub documentation)

## Sending a custom CloudEvent

Dapr automatically takes the data sent on the publish request and wraps it in a CloudEvent 1.0 envelope.
If you want to use your own custom CloudEvent, make sure to specify the content type as `application/cloudevents+json`.

Read about content types [here](#content-types), and about the [Cloud Events message format]({{< ref "pubsub-overview.md#cloud-events-message-format" >}}).

#### Example

{{< tabs "Dapr CLI" "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}
Publish a custom CloudEvent to the `orders` topic:
```bash
<<<<<<< HEAD
dapr publish --publish-app-id orderprocessing --pubsub order_pub_sub --topic orders --data '{"specversion" : "1.0", "type" : "com.dapr.cloudevent.sent", "source" : "testcloudeventspubsub", "subject" : "Cloud Events Test", "id" : "someCloudEventId", "time" : "2021-08-02T09:00:00Z", "datacontenttype" : "application/cloudevents+json", "data" : {"orderId": "100"}}'
=======
dapr publish --publish-app-id testpubsub --pubsub pubsub --topic orders --data '{"specversion" : "1.0", "type" : "com.dapr.cloudevent.sent", "source" : "testcloudeventspubsub", "subject" : "Cloud Events Test", "id" : "someCloudEventId", "time" : "2021-08-02T09:00:00Z", "datacontenttype" : "application/cloudevents+json", "data" : {"orderId": "100"}}'
>>>>>>> 0e83af7a (Added pub sub documentation)
```
{{% /codetab %}}

{{% codetab %}}
Publish a custom CloudEvent to the `orders` topic:
```bash
<<<<<<< HEAD
curl -X POST http://localhost:3601/v1.0/publish/order_pub_sub/orders -H "Content-Type: application/cloudevents+json" -d '{"specversion" : "1.0", "type" : "com.dapr.cloudevent.sent", "source" : "testcloudeventspubsub", "subject" : "Cloud Events Test", "id" : "someCloudEventId", "time" : "2021-08-02T09:00:00Z", "datacontenttype" : "application/cloudevents+json", "data" : {"orderId": "100"}}'
=======
curl -X POST http://localhost:3601/v1.0/publish/pubsub/orders -H "Content-Type: application/cloudevents+json" -d '{"specversion" : "1.0", "type" : "com.dapr.cloudevent.sent", "source" : "testcloudeventspubsub", "subject" : "Cloud Events Test", "id" : "someCloudEventId", "time" : "2021-08-02T09:00:00Z", "datacontenttype" : "application/cloudevents+json", "data" : {"orderId": "100"}}'
>>>>>>> 0e83af7a (Added pub sub documentation)
```
{{% /codetab %}}

{{% codetab %}}
Publish a custom CloudEvent to the `orders` topic:
```powershell
<<<<<<< HEAD
Invoke-RestMethod -Method Post -ContentType 'application/cloudevents+json' -Body '{"specversion" : "1.0", "type" : "com.dapr.cloudevent.sent", "source" : "testcloudeventspubsub", "subject" : "Cloud Events Test", "id" : "someCloudEventId", "time" : "2021-08-02T09:00:00Z", "datacontenttype" : "application/cloudevents+json", "data" : {"orderId": "100"}}' -Uri 'http://localhost:3601/v1.0/publish/order_pub_sub/orders'
=======
Invoke-RestMethod -Method Post -ContentType 'application/cloudevents+json' -Body '{"specversion" : "1.0", "type" : "com.dapr.cloudevent.sent", "source" : "testcloudeventspubsub", "subject" : "Cloud Events Test", "id" : "someCloudEventId", "time" : "2021-08-02T09:00:00Z", "datacontenttype" : "application/cloudevents+json", "data" : {"orderId": "100"}}' -Uri 'http://localhost:3601/v1.0/publish/pubsub/orders'
>>>>>>> 0e83af7a (Added pub sub documentation)
```
{{% /codetab %}}

{{< /tabs >}}

## Next steps

- Try the [Pub/Sub quickstart sample](https://github.com/dapr/quickstarts/tree/master/pub-sub)
- Learn about [PubSub routing]({{< ref howto-route-messages >}})
- Learn about [topic scoping]({{< ref pubsub-scopes.md >}})
- Learn about [message time-to-live]({{< ref pubsub-message-ttl.md >}})
- Learn [how to configure Pub/Sub components with multiple namespaces]({{< ref pubsub-namespaces.md >}})
- List of [pub/sub components]({{< ref setup-pubsub >}})
- Read the [API reference]({{< ref pubsub_api.md >}})
