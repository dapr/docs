# Use Pub/Sub to consume messages from topics

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
  name: messagebus
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

## Consume messages

To consume messages from a topic, start a web server in the programming language of your choice and listen on a `POST` endpoint with the route path you specified when subscribing.

*Note: The following example is written in node, but can be in any programming language*

```javascript
app.get('/dapr/subscribe', (req, res) => {
    res.json([
        {
            topic: "onCreated",
            route: "custom/path"
        }
    ]);
})

app.post('/custom/path', (req, res) => {
    console.log(req.body)
    res.status(200).send()
})
```

### ACK-ing a message

In order to tell Dapr that a message was processed successfully, return a `200 OK` response:

```javascript
res.status(200).send()
```

### Schedule a message for redelivery

If Dapr receives any other return status code than `200`, or if your app crashes, Dapr will attempt to redeliver the message following At-Least-Once semantics.
