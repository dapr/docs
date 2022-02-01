---
type: docs
title: "Quickstart: Publish and Subscribe"
linkTitle: "Publish and Subscribe"
weight: 70
description: "Get started with Dapr's Publish and Subscribe building block"
---

Let's take a look at Dapr's [Publish and Subscribe (Pub/sub) building block]({{< ref pubsub >}}). In this quickstart, you will run a publisher microservice and a subscriber microservice to demonstrate how Dapr enables a Pub/sub pattern.

1. Using a publisher service, developers can repeatedly publish messages to a topic.
1. [A Pub/sub component](https://docs.dapr.io/concepts/components-concept/#pubsub-brokers) queues or brokers those messages. Our example below uses Redis, you can use RabbitMQ, Kafka, etc.
1. The subscriber to that topic pulls messages from the queue and processes them.

Select your preferred language-specific Dapr SDK before proceeding with the quickstart.

{{< tabs "Python" "JavaScript" ".NET" >}}
 <!-- Python -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Python 3.7+ installed](https://www.python.org/downloads/).
- [Docker Desktop](https://www.docker.com/products/docker-desktop).

### Step 1: Set up the environment

Clone the sample we've provided.

```bash
git clone https://github.com/dapr/quickstarts.git
```

Navigate to the Pub/sub python project directory:

```bash
cd pub_sub/python
```

Install the dependencies:

```bash
pip3 install -r requirements.txt
```

### Step 2: Publish a topic

Navigate to the `checkout` directory.

```bash
cd checkout
```

Run the `checkout` publisher service alongside a Dapr sidecar.

```bash
dapr run --app-id checkout --components-path ../components  python3 app.py
```

In the `checkout` publisher, we're publishing the orderId message to the Redis instance called `order_pub_sub` [(as defined in the `pubsub.yaml` component)]({{< ref "#pubsubyaml-component-file" >}}) and topic `orders`. As soon as the service starts, it publishes in a loop:

```python
from dapr.clients import DaprClient
import json
import time
import random
import logging

logging.basicConfig(level=logging.INFO)

while True:
    order = {"orderid": random.randint(1, 1000)}

    with DaprClient() as client:
        result = client.publish_event(  # publish an event using Dapr pub-sub
            pubsub_name="order_pub_sub",
            topic_name="orders",
            data=json.dumps(order),
            data_content_type="application/json",
        )

    logging.info("Published data: " + json.dumps(order))
    time.sleep(1)
```

### Step 3: Subscribe to topics

In a new terminal window, navigate to the `order-processor` directory.

```bash
cd order-processor
```

Run the `order-processor` subscriber service alongside a Dapr sidecar.

```bash
dapr run --app-id order-processor --app-port 5001 --components-path ../components  python3 app.py
```

In the `order-processor` subscriber, we're subscribing to the Redis instance called `order_pub_sub` [(as defined in the `pubsub.yaml` component)]({{< ref "#pubsubyaml-component-file" >}}) and topic `orders`. This enables your app code to talk to the Redis component instance through the Dapr sidecar.

```py
import flask
from flask import request, jsonify
# from cloudevents.sdk.event import v1
# from dapr.ext.grpc import App
import json

app = flask.Flask(__name__)
# app = App()
# @app.subscribe(pubsub_name='order_pub_sub', topic='orders')
# def orders_subscribe(event: v1.Event) -> None:
#     data = json.loads(event.Data())
#     logging.info('Subscriber received: ' + str(data))
#     return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}


@app.route('/dapr/subscribe', methods=['GET'])
def subscribe():
    subscriptions = [{'pubsubname': 'order_pub_sub', 'topic': 'orders', 'route': 'orders'}]
    return jsonify(subscriptions)


@app.route('/orders', methods=['POST'])
def a_subscriber():
    print(f'orders: {request.json}', flush=True)
    print('Received message "{}" on topic "{}"'.format(request.json['data']['orderid'], request.json['topic']), flush=True)
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 


app.run(port=5001)
```

### Step 4: View the Pub/sub outputs

Notice, as specified in the code above, the publisher pushes a random number to the Dapr sidecar while the subscriber receives it.

Publisher output:

<img src="/images/pubsub-quickstart/pubsub-python-publisher-output.png" width=600 style="padding-bottom:15px;">

Subscriber output:

<img src="/images/pubsub-quickstart/pubsub-python-subscriber-output.png" width=600 style="padding-bottom:25px;">

#### `pubsub.yaml` component file

When you run `dapr init`, Dapr creates a default Redis `pubsub.yaml` and runs a Redis container on your local machine, located:

- On Windows, under `%UserProfile%\.dapr\components\pubsub.yaml`
- On Linux/MacOS, under `~/.dapr/components/pubsub.yaml`

With the `pubsub.yaml` component, you can easily swap out underlying components without application code changes.

The Redis `pubsub.yaml` file included for this quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: order_pub_sub
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
scopes:
  - orderprocessing
  - checkout
```

In the YAML file:

- `metadata/name` is how your application talks to the component.
- `spec/metadata` defines the connection to the instance of the component.
- `scopes` specify which application can use the component.

{{% /codetab %}}

 <!-- JavaScript -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Latest Node.js installed](https://nodejs.org/en/download/).
- [Docker Desktop](https://www.docker.com/products/docker-desktop).

### Step 1: Set up the environment

Clone the sample we've set up:

```bash
git clone https://github.com/dapr/quickstarts.git
```

Navigate to the Pub/sub C# project directory:

```bash
cd pub_sub/javascript
```

Install `dapr-client`:

```bash
npm install dapr-client
```

Verify you have the following files included in the service directories:

- `package.json`
- `package-lock.json`

### Step 2: Publish a topic

Navigate to the `checkout` directory.

```bash
cd checkout
```

Run the `checkout` publisher service alongside a Dapr sidecar.

```bash
dapr run --app-id checkout --app-port 6001 --dapr-grpc-port 3601 --dapr-grpc-port 60001 --components-path ../../components npm start
```

In the `checkout` publisher service, we're publishing the orderId message to the Redis instance called `order_pub_sub` [(as defined in the `pubsub.yaml` component)]({{< ref "#pubsubyaml-component-file" >}}) and topic `orders`. As soon as the service starts, it publishes in a loop:  

```js
import { DaprClient } from 'dapr-client';
import { v4 as uuidv4 } from 'uuid';

const SIDECAR_HOST = process.env.SIDECAR_HOST || "127.0.0.1";
const SIDECAR_PORT = process.env.SIDECAR_PORT || 3500;

async function main() {
  const client = new DaprClient(SIDECAR_HOST, SIDECAR_PORT);

  while (true) {
    await client.pubsub.publish("order_pub_sub", "orders", { orderId: uuidv4() });
    await sleep(1000);
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(e => console.error(e)) 
```

### Step 3: Subscribe to topics

Navigate to the `order-processor` directory.

```bash
cd order-processor
```

Run the `order-processor` subscriber service alongside a Dapr sidecar.

```bash
dapr run --app-id order-processor --app-port 6002 --dapr-grpc-port 3602 --dapr-grpc-port 60002 --components-path ../../components npm start
```

In the `order-processor` subscriber, we're subscribing to the Redis instance called `order_pub_sub` [(as defined in the `pubsub.yaml` component)]({{< ref "#pubsubyaml-component-file" >}}) and topic `orders`. This enables your app code to talk to the Redis component instance through the Dapr sidecar.

```js
// Order Processing = Server which processes items
// Checkout will do the pub sub
import { DaprServer } from 'dapr-client';

const SIDECAR_HOST = process.env.SIDECAR_HOST || "127.0.0.1";
const SIDECAR_PORT = process.env.SIDECAR_PORT || 3500;
const SERVER_HOST = process.env.SERVER_HOST || "127.0.0.1";
const SERVER_PORT = process.env.SERVER_PORT || 5000;

async function main() {
  const server = new DaprServer(SERVER_HOST, SERVER_PORT, SIDECAR_HOST, SIDECAR_PORT);
  server.pubsub.subscribe("order_pub_sub", "orders", (data) => console.log(data));
  await server.start();
}

main().catch(e => console.error(e)); 
```

### Step 4: View the Pub/sub outputs

Notice, as specified in the code above, the publisher pushes a random number to the Dapr sidecar while the subscriber receives it.

Publisher output:

<img src="/images/pubsub-quickstart/pubsub-js-publisher-output.png" width=600 style="padding-bottom:15px;">

Subscriber output:

<img src="/images/pubsub-quickstart/pubsub-js-subscriber-output.png" width=600 style="padding-bottom:25px;">

#### `pubsub.yaml` component file

When you run `dapr init`, Dapr creates a default Redis `pubsub.yaml` and runs a Redis container on your local machine, located:

- On Windows, under `%UserProfile%\.dapr\components\pubsub.yaml`
- On Linux/MacOS, under `~/.dapr/components/pubsub.yaml`

With the `pubsub.yaml` component, you can easily swap out underlying components without application code changes.

The Redis `pubsub.yaml` file included for this quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: order_pub_sub
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
scopes:
  - orderprocessing
  - checkout
```

In the YAML file:

- `metadata/name` is how your application talks to the component.
- `spec/metadata` defines the connection to the instance of the component.
- `scopes` specify which application can use the component.

{{% /codetab %}}

 <!-- .NET -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [.NET SDK or .NET 6 SDK installed](https://dotnet.microsoft.com/en-us/download).
- [Docker Desktop](https://www.docker.com/products/docker-desktop).

### Step 1: Set up the environment

Clone the sample we've set up:

```bash
git clone https://github.com/dapr/quickstarts.git
```

In a terminal window, navigate to the Pub/sub C# project directory:

```bash
cd pub_sub/csharp
```

Recall NuGet packages:

```bash
dotnet restore
dotnet build
```

### Step 2: Publish a topic

Navigate to the `checkout` publisher directory.

```bash
cd checkout
```

Run the `checkout` publisher service alongside a Dapr sidecar.

```bash
dapr run --app-id checkout --components-path ../../components dotnet run
```

In the `checkout` publisher, we're publishing the orderId message to the Redis instance called `order_pub_sub` [(as defined in the `pubsub.yaml` component)]({{< ref "#pubsubyaml-component-file" >}}) and topic `orders`. As soon as the service starts, it publishes in a loop:

```cs
// Publisher
using System;
using Dapr.Client;
using System.Threading;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;


while(true) {
    Random random = new Random();
    var order = new Order(random.Next(1,1000));
    var data = JsonSerializer.Serialize<Order>(order);
    CancellationTokenSource source = new CancellationTokenSource();
    CancellationToken cancellationToken = source.Token;
    using var client = new DaprClientBuilder().Build();
    await client.PublishEventAsync("order_pub_sub", "orders", data, cancellationToken);
    Console.WriteLine("Published data: " + data);
    System.Threading.Thread.Sleep(1000);
}

public record Order([property: JsonPropertyName("orderid")] int order_id);
```

### Step 3: Subscribe to topics

In a new terminal window, navigate to the `order-processor` directory.

```bash
cd pub_sub/csharp/order-processor
```

Run the `order-processor` subscriber service alongside a Dapr sidecar.

```bash
dapr run --app-id order-processor --components-path ../../components --app-port 5001 dotnet run
```

In the `order-processor` subscriber, we're subscribing to the Redis instance called `order_pub_sub` [(as defined in the `pubsub.yaml` component)]({{< ref "#pubsubyaml-component-file" >}}) and topic `orders`. This enables your app code to talk to the Redis component instance through the Dapr sidecar.

```cs
// Subscriber
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseDeveloperExceptionPage();
}

app.MapGet("/dapr/subscribe", () => {
    var subscriptions = "[{'pubsubname': 'order_pub_sub', 'topic': 'orders', 'route': 'orders'}]";
    return subscriptions;
});

app.MapPost("/orders", (Order order) => {
    Console.WriteLine("Subscriber received : " + order.ToString());
    return Results.Ok(order.ToString());
});

        // [Topic("order_pub_sub", "orders")]
        // [HttpPost("order-processor")]
        // public HttpResponseMessage getCheckout([FromBody] int orderId)
        // {
        //     Console.WriteLine("Subscriber received : " + orderId);
        //     return new HttpResponseMessage(HttpStatusCode.OK);
        // }

await app.RunAsync();

app.Run();

public record Order([property: JsonPropertyName("orderid")] int order_id);
```

### Step 4: View the Pub/sub outputs

Notice, as specified in the code above, the publisher pushes a random number to the Dapr sidecar while the subscriber receives it.

Publisher output:

<img src="/images/pubsub-quickstart/pubsub-dotnet-publisher-output.png" width=600 style="padding-bottom:15px;">

Subscriber output:

<img src="/images/pubsub-quickstart/pubsub-dotnet-subscriber-output.png" width=600 style="padding-bottom:25px;">

#### `pubsub.yaml` component file

When you run `dapr init`, Dapr creates a default Redis `pubsub.yaml` and runs a Redis container on your local machine, located:

- On Windows, under `%UserProfile%\.dapr\components\pubsub.yaml`
- On Linux/MacOS, under `~/.dapr/components/pubsub.yaml`

With the `pubsub.yaml` component, you can easily swap out underlying components without application code changes.

The Redis `pubsub.yaml` file included for this quickstart contains the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: order_pub_sub
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
scopes:
  - orderprocessing
  - checkout
```

In the YAML file:

- `metadata/name` is how your application talks to the component.
- `spec/metadata` defines the connection to the instance of the component.
- `scopes` specify which application can use the component.

{{% /codetab %}}

{{< /tabs >}}

## Next steps

- Learn about [Pub/sub routing]({{< ref howto-route-messages >}})
- Learn about [topic scoping]({{< ref pubsub-scopes.md >}})
- Learn about [message time-to-live]({{< ref pubsub-message-ttl.md >}})
- Learn [how to configure Pub/sub components with multiple namespaces]({{< ref pubsub-namespaces.md >}})
- List of [Pub/sub components]({{< ref setup-pubsub >}})
- Read the [API reference]({{< ref pubsub_api.md >}})

{{< button text="Explore Dapr tutorials  >>" page="getting-started/tutorials/_index.md" >}}