---
type: docs
title: "Quickstart: Publish and Subscribe"
linkTitle: "Publish and Subscribe"
weight: 70
description: "Get started with Dapr's Publish and Subscribe building block"
---

Let's take a look at Dapr's [Publish and Subscribe (Pub/sub) building block]({{< ref pubsub >}}). In this quickstart, you will set up a publisher microservice and a subscriber microservice to demonstrate how Dapr enables a Pub/sub pattern.

1. Using a publisher service, developers can repeatedly publish messages to a topic.
1. [A Pub/sub component](https://docs.dapr.io/concepts/components-concept/#pubsub-brokers) queues or brokers those messages (using Redis Streams, RabbitMQ, Kafka, etc.).
1. The subscriber to that topic pulls messages from the queue and processes them.

Select your preferred language-specific Dapr SDK before proceeding with the quickstart.

{{< tabs "Python" ".NET" "JavaScript" >}}
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

Or:

```bash
python -m pip install -r requirements.txt
```

### Step 2: View the Pub/sub component

When you run `dapr init`, Dapr creates a default Redis `pubsub.yaml` and runs a Redis container on your local machine. Verify by finding the YAML file in your components directory:

- On Windows, under `%UserProfile%\.dapr\components\pubsub.yaml`
- On Linux/MacOS, under `~/.dapr/components/pubsub.yaml`

The Redis `pubsub.yaml` file included for this quickstart contains the following:

{{< tabs "Self-Hosted (CLI)" "Kubernetes" >}}

{{% codetab %}}

In the YAML file:

- `metadata/name` is how your application talks to the component.
- `spec/metadata` defines the connection to the instance of the component.
- `scopes` specify which application can use the component.

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

{{% /codetab %}}

{{% codetab %}}

In the YAML file:

- `metadata/name` is how your application talks to the component.
- `spec/metadata` defines the connection to the instance of the component.
- `scopes` specify which application can use the component.

Run `kubectl apply -f pubsub.yaml` to apply the following:

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
    value: redis-master.default.svc.cluster.local:6379
  - name: redisPassword
    value: ""
scopes:
  - orderprocessing
  - checkout
```

{{% /codetab %}}

{{< /tabs >}}

### Step 3: Subscribe to topics

Navigate to the directory containing your subscriber application.

```bash
cd pub_sub/python
```

With the following command, run the CheckoutService.py service alongside a Dapr sidecar.

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --app-protocol grpc --components-path ../components  python3 CheckoutService.py
```

In the CheckoutService.py subscriber, we're subscribing to the Redis instance called `order_pub_sub` (as defined in the `pubsub.yaml` component) and topic `orders`.
  
```py
from cloudevents.sdk.event import v1
from dapr.ext.grpc import App
import logging

import json

app = App()

logging.basicConfig(level = logging.INFO)

@app.subscribe(pubsub_name='order_pub_sub', topic='orders')
def mytopic(event: v1.Event) -> None:
    data = json.loads(event.Data())
    logging.info('Subscriber received: ' + str(data))

app.run(6002)
```

This enables your app code to talk to the Redis component instance through the Dapr sidecar. With the `pubsub.yaml` component, you can easily swap out underlying components without application code changes.

### Step 4: Publish a topic

Navigate to the directory holding the OrderProcessingService.py publisher.

```bash
cd pub_sub/python
```

With the following command, run the OrderProcessingService.py service alongside a Dapr sidecar.

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --app-protocol grpc --components-path ../components  python3 OrderProcessingService.py
```
In the OrderProcessingService.py publisher, we're publishing the orderId message to the Redis instance called `order_pub_sub` (as defined in the `pubsub.yaml` component) and topic `orders`. As soon as the OrderProcessingService.py starts, it publishes in a loop:  
```python
import random
from time import sleep    
import requests
import logging
import json
from dapr.clients import DaprClient

logging.basicConfig(level = logging.INFO)
while True:
    sleep(random.randrange(50, 5000) / 1000)
    orderId = random.randint(1, 1000)
    PUBSUB_NAME = 'order_pub_sub'
    TOPIC_NAME = 'orders'
    with DaprClient() as client:
        result = client.publish_event(
            pubsub_name=PUBSUB_NAME,
            topic_name=TOPIC_NAME,
            data=json.dumps(orderId),
            data_content_type='application/json',
        )
    logging.info('Published data: ' + str(orderId))
```

Notice the publisher pushes a random number to the Dapr sidecar while the subscriber receives it.

Publisher output:

<img src="/images/pubsub-quickstart/pubsub-python-publisher-output.png" width=600>

<br>

Subscriber output:

<img src="/images/pubsub-quickstart/pubsub-python-subscriber-output.png" width=600>

Dapr automatically wraps the user payload in a Cloud Events v1.0 compliant envelope, using `Content-Type` header value for `data_content_type` attribute.

{{% /codetab %}}

 <!-- .NET -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [.NET and ASP.NET Core installed](https://dotnet.microsoft.com/en-us/download/dotnet/5.0/runtime).
- [Latest NuGet package installed](https://www.nuget.org/downloads).
- [Docker Desktop](https://www.docker.com/products/docker-desktop).

### Step 1: Set up the environment

Clone the sample we've set up:

```bash
git clone https://github.com/dapr/quickstarts.git
```

Navigate to the Pub/sub C# project directory:

```bash
cd pub_sub/csharp
```

### Step 2: View the Pub/sub component

When you run `dapr init`, Dapr creates a default Redis `pubsub.yaml` and runs a Redis container on your local machine. Verify by finding the YAML file in your components directory:

- On Windows, under `%UserProfile%\.dapr\components\pubsub.yaml`
- On Linux/MacOS, under `~/.dapr/components/pubsub.yaml`

The Redis `pubsub.yaml` file included for this quickstart contains the following:

{{< tabs "Self-Hosted (CLI)" "Kubernetes" >}}

{{% codetab %}}

In the YAML file:

- `metadata/name` is how your application talks to the component.
- `spec/metadata` defines the connection to the instance of the component.
- `scopes` specify which application can use the component.

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

{{% /codetab %}}

{{% codetab %}}

In the YAML file:

- `metadata/name` is how your application talks to the component.
- `spec/metadata` defines the connection to the instance of the component.
- `scopes` specify which application can use the component.

Run `kubectl apply -f pubsub.yaml` to apply the following:

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
    value: redis-master.default.svc.cluster.local:6379
  - name: redisPassword
    value: ""
scopes:
  - orderprocessing
  - checkout
```

{{% /codetab %}}

{{< /tabs >}}

### Step 3: Subscribe to topics

Navigate to the directory containing your subscriber application.

```bash
cd pub_sub/csharp/CheckoutService/Controllers
```

With the following command, run the CheckoutServiceController.cs service alongside a Dapr sidecar.

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 --app-ssl --components-path ../../components dotnet run
```

In the CheckoutServiceController.cs subscriber, we're subscribing to the Redis instance called `order_pub_sub` (as defined in the `pubsub.yaml` component) and topic `orders`.
```cs
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Mvc;
using Dapr;
using Dapr.Client;

namespace CheckoutService.controller
{
    [ApiController]
    public class CheckoutServiceController : Controller
    {
        [Topic("order_pub_sub", "orders")]
        [HttpPost("checkout")]
        public void getCheckout([FromBody] int orderId)
        {
            Console.WriteLine("Subscriber received : " + orderId);
        }
    }
}
```
This enables your app code to talk to the Redis component instance through the Dapr sidecar. With the `pubsub.yaml` component, you can easily swap out underlying components without application code changes.

### Step 4: Publish a topic

Navigate to the directory holding the "Order Processing Service" Program.cs publisher.

```bash
cd pub_sub/csharp/OrderProcessingService
```

With the following command, run Program.cs service alongside a Dapr sidecar.

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --app-ssl --components-path ../../components dotnet run
```

In the Program.cs publisher, we're publishing the orderId message to the Redis instance called `order_pub_sub` (as defined in the `pubsub.yaml` component) and topic `orders`. As soon as the OrderProcessingService.py starts, it publishes in a loop:

```cs
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Dapr.Client;
using Microsoft.AspNetCore.Mvc;
using System.Threading;

namespace EventService
{
    class Program
    {
        static async Task Main(string[] args)
        {
           string PUBSUB_NAME = "order_pub_sub";
           string TOPIC_NAME = "orders";
           while(true) {
                System.Threading.Thread.Sleep(5000);
                Random random = new Random();
                int orderId = random.Next(1,1000);
                CancellationTokenSource source = new CancellationTokenSource();
                CancellationToken cancellationToken = source.Token;
                using var client = new DaprClientBuilder().Build();
                await client.PublishEventAsync(PUBSUB_NAME, TOPIC_NAME, orderId, cancellationToken);
                Console.WriteLine("Published data: " + orderId);
           }
        }
    }
}
```

Notice the publisher pushes a random number to the Dapr sidecar while the subscriber receives it.

Publisher output:

<img src="/images/pubsub-quickstart/pubsub-dotnet-publisher-output.png" width=600>

<br>

Subscriber output:

<img src="/images/pubsub-quickstart/pubsub-dotnet-subscriber-output.png" width=600>

Dapr automatically wraps the user payload in a Cloud Events v1.0 compliant envelope, using `Content-Type` header value for `data_content_type` attribute.

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

### Step 2: View the Pub/sub component

When you run `dapr init`, Dapr creates a default Redis `pubsub.yaml` and runs a Redis container on your local machine. Verify by finding the YAML file in your components directory:

- On Windows, under `%UserProfile%\.dapr\components\pubsub.yaml`
- On Linux/MacOS, under `~/.dapr/components/pubsub.yaml`

The Redis `pubsub.yaml` file included for this quickstart contains the following:

{{< tabs "Self-Hosted (CLI)" "Kubernetes" >}}

{{% codetab %}}

In the YAML file:

- `metadata/name` is how your application talks to the component.
- `spec/metadata` defines the connection to the instance of the component.
- `scopes` specify which application can use the component.

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

{{% /codetab %}}

{{% codetab %}}

In the YAML file:

- `metadata/name` is how your application talks to the component.
- `spec/metadata` defines the connection to the instance of the component.
- `scopes` specify which application can use the component.

Run `kubectl apply -f pubsub.yaml` to apply the following:

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
    value: redis-master.default.svc.cluster.local:6379
  - name: redisPassword
    value: ""
scopes:
  - orderprocessing
  - checkout
```

{{% /codetab %}}

{{< /tabs >}}

### Step 3: Subscribe to topics

Navigate to the directory containing the subscriber.

```bash
cd pub_sub/javascript/CheckoutService
```

With the following command, run the CheckoutService/server.js service alongside a Dapr sidecar and run .

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 --components-path ../../components npm start
```

In the CheckoutService/server.js subscriber, we're subscribing to the Redis instance called `order_pub_sub` (as defined in the `pubsub.yaml` component) and topic `orders`.

```js
import { DaprServer, CommunicationProtocolEnum } from 'dapr-client'; 

const daprHost = "127.0.0.1"; 
const serverHost = "127.0.0.1";
const serverPort = "6002"; 

start().catch((e) => {
    console.error(e);
    process.exit(1);
});

async function start(orderId) {
    const PUBSUB_NAME = "order_pub_sub"
    const TOPIC_NAME  = "orders"
    const server = new DaprServer(
        serverHost, 
        serverPort, 
        daprHost, 
        process.env.DAPR_HTTP_PORT, 
        CommunicationProtocolEnum.HTTP
     );
    await server.pubsub.subscribe(PUBSUB_NAME, TOPIC_NAME, async (orderId) => {
        console.log(`Subscriber received: ${JSON.stringify(orderId)}`)
    });
    await server.startServer();
}
```

This enables your app code to talk to the Redis component instance through the Dapr sidecar. With the pubsub.yaml component, you can easily swap out underlying components without application code changes.

### Step 4: Publish a topic

Navigate to the directory holding the publisher.

```bash
cd pub_sub/javascript/OrderProcessingService
```

With the following command, run the OrderProcessingService/server.js service alongside a Dapr sidecar.

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --components-path ../../components npm start
```

In the OrderProcessingService/server.js publisher, we're publishing the orderId message to the Redis instance called `order_pub_sub` (as defined in the `pubsub.yaml` component) and topic `orders`. As soon as the OrderProcessingService.py starts, it publishes in a loop:  

```js
import { DaprServer, DaprClient, CommunicationProtocolEnum } from 'dapr-client'; 

const daprHost = "127.0.0.1"; 

var main = function() {
    for(var i=0;i<10;i++) {
        sleep(5000);
        var orderId = Math.floor(Math.random() * (1000 - 1) + 1);
        start(orderId).catch((e) => {
            console.error(e);
            process.exit(1);
        });
    }
}

async function start(orderId) {
    const client = new DaprClient(daprHost, process.env.DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
    console.log("Published data:" + orderId)
    await client.pubsub.publish("order_pub_sub", "orders", orderId);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();
```

Notice the publisher pushes a random number to the Dapr sidecar while the subscriber receives it.

Publisher output:

<img src="/images/pubsub-quickstart/pubsub-js-publisher-output.png" width=600>

<br>

Subscriber output:

<img src="/images/pubsub-quickstart/pubsub-js-subscriber-output.png" width=600>

Dapr automatically wraps the user payload in a Cloud Events v1.0 compliant envelope, using `Content-Type` header value for `data_content_type` attribute.

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