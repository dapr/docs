# Use Pub/Sub to consume messages from topics

Pub/Sub is a very common pattern in a distributed system with many services that want to utilize decoupled, asynchronous messaging.
Using Pub/Sub, you can enable scenarios where event consumers are decoupled from event producers.

Dapr provides an extensible Pub/Sub system with At-Least-Once guarantees, allowing developers to publish and subscribe to topics.
Dapr provides different implementation of the underlying system, and allows operators to bring in their preferred infrastructure, for example Redis Streams, Kafka, etc.

## Setup the Pub Sub component

The first step is to setup the Pub/Sub component.
For this guide, we'll use Redis Streams, which is also installed by default on a local machine when running `dapr init`.

*Note: When running Dapr locally, a pub/sub component YAML will automatically be created if it doesn't exist in a directory called `components` in your current working directory.*

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
The Dapr instance will call into your app, and expect a JSON value of an array of topics.

*Note: The following example is written in node (express.js < 4.16), but can be in any programming language*

<pre>
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())

const port = 3000

<b>app.get('/dapr/subscribe', (req, res) => {
    res.json([
        'topic1'
    ])
})</b>

app.listen(port, () => console.log(`consumer app listening on port ${port}!`))
</pre>

**NOTE:** For node/express > 4.16 you will need to add the following:
1. ```app.use(express.json())``` as ```body-parser``` has been added back into express.js > v.4.16
2. You must add ```{type: ["application/json", "application/cloudevents+json"]}``` into the above ```express.json()``` to properly accept the pub/sub ```content-type``` that Dapr will POST to you your endpoint (e.g. ```POST /topic1```) when receiving a pub/sub
3. Depending on how you expect/know what is being recieved you may want to add a middleware call that will check the content type and add mutate ```req.body = req.body.data``` as this would be the expected data payload from the message.  Dapr conforms/leverages [CloudEvents Spec](https://cloudevents.io) and will also deliver additional useful properties as part of the original ```req.body``` and may/may not be what you expect.

<pre>
// Example - presuming app.js is your entry point add the following in your middleware calls:
// ...
app.use(express.json({type: ["application/json", "application/cloudevents+json"]}));
app.use(function(req, res, next){
    if(req.headers["content-type"] == "application/cloudevents+json") {
        req.body = req.body.data
    }
    next();
});
//...
</pre>

## Consume messages

To consume messages from a topic, start a web server in the programming language of your choice and listen on a `POST` endpoint with the route name that corresponds to the topic.

For example, in order to receive messages for  `topic1`, have your endpoint listen on `/topic1`.

*Note: The following example is written in node, but can be in any programming language*

```javascript
app.post('/topic1', (req, res) => {
    console.log(req.body)
    res.status(200).send()
})
```

NOTE: Express

### ACK-ing a message

In order to tell Dapr that a message was processed successfully, return a `200 OK` response:

```javascript
res.status(200).send()
```

### Schedule a message for redelivery

If Dapr receives any other return status code than `200`, or if your app crashes, Dapr will attempt to redeliver the message following At-Least-Once semantics.
