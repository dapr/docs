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
Dapr provides different implementation of the underlying system, and allows operators to bring in their preferred infrastructure, for example Redis Streams, Kafka, etc.

## Step 1: Setup the Pub/Sub component

The first step is to setup the Pub/Sub component:

{{< tabs "Self-Hosted (CLI)" Kubernetes >}}

{{% codetab %}}
Redis Streams is installed by default on a local machine when running `dapr init`.

Verify by opening your components file under `%UserProfile%\.dapr\components\pubsub.yaml` on Windows or `~/.dapr/components/pubsub.yaml` on Linux/MacOS:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.redis
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
```

You can override this file with another Redis instance or another [pubsub component]({{< ref setup-pubsub >}}) by creating a `components` directory containing the file and using the flag `--components-path` with the `dapr run` CLI command.
{{% /codetab %}}

{{% codetab %}}
To deploy this into a Kubernetes cluster, fill in the `metadata` connection details of your [desired pubsub component]({{< ref setup-pubsub >}}) in the yaml below, save as `pubsub.yaml`, and run `kubectl apply -f pubsub.yaml`.

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
{{% /codetab %}}

{{< /tabs >}}

## Step 2: Publish a topic

To publish a message to a topic, invoke the following endpoint on a Dapr instance:

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}
Begin by ensuring a Dapr sidecar is running:
```bash
dapr --app-id myapp --port 3500 run
```
Then publish a message to the `deathStarStatus` topic:
```bash
curl -X POST http://localhost:3500/v1.0/publish/pubsub/deathStarStatus -H "Content-Type: application/json" -d '{"status": "completed"}'
```
{{% /codetab %}}

{{% codetab %}}
Begin by ensuring a Dapr sidecar is running:
```bash
dapr --app-id myapp --port 3500 run
```
Then publish a message to the `deathStarStatus` topic:
```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '{"status": "completed"}' -Uri 'http://localhost:3500/v1.0/publish/pubsub/deathStarStatus'
```
{{% /codetab %}}

{{< /tabs >}}

Dapr automatically wraps the user payload in a Cloud Events v1.0 compliant envelope.

## Step 3: Subscribe to topics

Dapr allows two methods by which you can subscribe to topics:
- **Declaratively**, where subscriptions are are defined in an external file.
- **Programatically**, where subscriptions are defined in user code

### Declarative subscriptions

You can subscribe to a topic using the following Custom Resources Definition (CRD):

```yaml
apiVersion: dapr.io/v1alpha1
kind: Subscription
metadata:
  name: myevent-subscription
spec:
  topic: deathStarStatus
  route: /dsstatus
  pubsubname: pubsub
scopes:
- app1
- app2
```

The example above shows an event subscription to topic `deathStarStatus`, for the pubsub component `pubsub`.
The `route` field tells Dapr to send all topic messages to the `/dsstatus` endpoint in the app.

The `scopes` field enables this subscription for apps with IDs `app1` and `app2`.

Set the component with:
{{< tabs "Self-Hosted (CLI)" Kubernetes>}}

{{% codetab %}}
Place the CRD in your `./components` directory. When Dapr starts up, it will load subscriptions along with components.

You can also override the default directory by pointing the Dapr CLI to a components path:

```bash
dapr run --app-id myapp --components-path ./myComponents -- python3 myapp.py
```

*Note: By default, Dapr loads components from `$HOME/.dapr/components` on MacOS/Linux and `%USERPROFILE%\.dapr\components` on Windows. If you place the subscription in a custom components path, make sure the Pub/Sub component is present also.*
{{% /codetab %}}

{{% codetab %}}
In Kubernetes, save the CRD to a file and apply it to the cluster:

```bash
kubectl apply -f subscription.yaml
```
{{% /codetab %}}

{{< /tabs >}}

#### Example

After setting up the subscription above, download this javascript into a `app1.js` file:

```javascript
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())

const port = 3000

app.post('/dsstatus', (req, res) => {
    res.sendStatus(200);
});

app.listen(port, () => console.log(`consumer app listening on port ${port}!`))
```
Run this app with:

```bash
dapr --app-id app1 --app-port 3000 run node app1.js
```

### Programmatic subscriptions 

To subscribe to topics, start a web server in the programming language of your choice and listen on the following `GET` endpoint: `/dapr/subscribe`.
The Dapr instance will call into your app at startup and expect a JSON response for the topic subscriptions with:
- `pubsubname`: Which pub/sub component Dapr should use
- `topic`: Which topic to subscribe to
- `route`: Which endpoint for Dapr to call on when a message comes to that topic

#### Example

*Note: The following example is written in Node.js, but can be in any programming language*

```javascript
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())

const port = 3000

app.get('/dapr/subscribe', (req, res) => {
    res.json([
        {
            pubsubname: "pubsub",
            topic: "deathStarStatus",
            route: "dsstatus"        
        }
    ]);
})

app.post('/dsstatus', (req, res) => {
    res.sendStatus(200);
});

app.listen(port, () => console.log(`consumer app listening on port ${port}!`))
```

The `/dsstatus` endpoint matches the `route` defined in the subscriptions and this is where Dapr will send all topic messages to.

## Step 4: ACK-ing a message

In order to tell Dapr that a message was processed successfully, return a `200 OK` response. If Dapr receives any other return status code than `200`, or if your app crashes, Dapr will attempt to redeliver the message following At-Least-Once semantics.

#### Example

*Note: The following example is written in Node.js, but can be in any programming language*
```javascript
app.post('/dsstatus', (req, res) => {
    res.sendStatus(200);
});
```