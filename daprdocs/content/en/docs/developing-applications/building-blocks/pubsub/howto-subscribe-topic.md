---
title: "How-To: Subscribe to a topic"
linkTitle: "How-To: Subscribe"
weight: 3000
description: "Consume messages from topics"
---

Pub/Sub is a very common pattern in a distributed system with many services that want to utilize decoupled, asynchronous messaging.
Using Pub/Sub, you can enable scenarios where event consumers are decoupled from event producers.

Dapr provides an extensible Pub/Sub system with At-Least-Once guarantees, allowing developers to publish and subscribe to topics.
Dapr provides different implementation of the underlying system, and allows operators to bring in their preferred infrastructure, for example Redis Streams, Kafka, etc.

Watch this [video](https://www.youtube.com/watch?v=NLWukkHEwGA&feature=youtu.be&t=1052) on how to consume messages from topics.

## Setup the Pub Sub component

The first step is to setup the Pub/Sub component.
For this guide, we'll use Redis Streams, which is also installed by default on a local machine when running `dapr init`.

*Note: When running Dapr locally, a pub/sub component YAML is automatically created for you locally. To override, create a `components` directory containing the file and use the flag `--components-path` with the `dapr run` CLI command.*

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
  namespace: default
spec:
  type: pubsub.redis
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
```

To deploy this into a Kubernetes cluster, fill in the `metadata` connection details in the yaml, and run `kubectl apply -f pubsub.yaml`.

## Subscribe to topics

Dapr allows two methods by which you can subscribe to topics: programatically, where subscriptions are defined in user code and declaratively, where subscriptions are are defined in an external file.

### Declarative subscriptions

You can subscribe to a topic using the following Custom Resources Definition (CRD):

```yaml
apiVersion: dapr.io/v1alpha1
kind: Subscription
metadata:
  name: myevent-subscription
spec:
  topic: newOrder
  route: /orders
  pubsubname: kafka
scopes:
- app1
- app2
```

The example above shows an event subscription to topic `newOrder`, for the pubsub component `kafka`.
The `route` field tells Dapr to send all topic messages to the `/orders` endpoint in the app.

The `scopes` field enables this subscription for apps with IDs `app1` and `app2`.

An example of a node.js app that receives events from the subscription:

```javascript
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())

const port = 3000

app.post('/orders', (req, res) => {
    res.sendStatus(200);
});

app.listen(port, () => console.log(`consumer app listening on port ${port}!`))
```

#### Subscribing on Kubernetes

In Kubernetes, save the CRD to a file and apply it to the cluster:

```
kubectl apply -f subscription.yaml
```

#### Subscribing in Self Hosted

When running Dapr in Self-hosted, either locally or on a VM, put the CRD in your `./components` directory.
When Dapr starts up, it will load subscriptions along with components.

The following example shows how to point the Dapr CLI to a components path:

```
dapr run --app-id myapp --components-path ./myComponents -- python3 myapp.py
```

*Note: By default, Dapr loads components from $HOME/.dapr/components on MacOS/Linux and %USERPROFILE%\.dapr\components on Windows. If you place the subscription in a custom components path, make sure the Pub/Sub component is present also.*

### Programmatic subscriptions 

To subscribe to topics, start a web server in the programming language of your choice and listen on the following `GET` endpoint: `/dapr/subscribe`.
The Dapr instance will call into your app, and expect a JSON response for the topic subscriptions.

*Note: The following example is written in node, but can be in any programming language*

<pre>
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())

const port = 3000

<b>app.get('/dapr/subscribe', (req, res) => {
    res.json([
        {
            pubsubname: "pubsub",
            topic: "newOrder",
            route: "orders"        
        }
    ]);
})</b>

app.post('/orders', (req, res) => {
    res.sendStatus(200);
});

app.listen(port, () => console.log(`consumer app listening on port ${port}!`))
</pre>

In the payload returned to Dapr, `topic` tells Dapr which topic to subscribe to, `route` tells Dapr which endpoint to call on when a message comes to that topic, and `pubsubName` tells Dapr which pub/sub component it should use. In this example this is `pubsub` as this is the name of the component we outlined above.

The `/orders` endpoint matches the `route` defined in the subscriptions and this is where Dapr will send all topic messages to.

### ACK-ing a message

In order to tell Dapr that a message was processed successfully, return a `200 OK` response:

```javascript
res.status(200).send()
```

### Schedule a message for redelivery

If Dapr receives any other return status code than `200`, or if your app crashes, Dapr will attempt to redeliver the message following At-Least-Once semantics.
