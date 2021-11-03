---
type: docs
title: "How-To: Trigger your application with input bindings"
linkTitle: "How-To: Triggers"
description: "Use Dapr input bindings to trigger event driven applications"
weight: 200
---

Using bindings, your code can be triggered with incoming events from different resources which can be anything: a queue, messaging pipeline, cloud-service, filesystem etc.

This is ideal for event-driven processing, data pipelines or just generally reacting to events and doing further processing.

Dapr bindings allow you to:

* Receive events without including specific SDKs or libraries
* Replace bindings without changing your code
* Focus on business logic and not the event resource implementation

For more info on bindings, read [this overview]({{<ref bindings-overview.md>}}).

For a quickstart sample showing bindings, visit this [link](https://github.com/dapr/quickstarts/tree/master/bindings).

## 1. Create a binding

An input binding represents an event resource that Dapr uses to read events from and push to your application.

For the purpose of this HowTo, we'll use a Kafka binding. You can find a list of the different binding specs [here]({{< ref supported-bindings >}}).

Create the following YAML file, named binding.yaml, and save this to a `components` sub-folder in your application directory.
(Use the `--components-path` flag with `dapr run` to point to your custom components dir)

*Note: When running in Kubernetes, apply this file to your cluster using `kubectl apply -f binding.yaml`*

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: myevent
  namespace: default
spec:
  type: bindings.kafka
  version: v1
  metadata:
  - name: topics
    value: topic1
  - name: brokers
    value: localhost:9092
  - name: consumerGroup
    value: group1
```

Here, you create a new binding component with the name of `myevent`.

Inside the `metadata` section, configure the Kafka related properties such as the topics to listen on, the brokers and more.

## 2. Listen for incoming events

Now configure your application to receive incoming events. If using HTTP, you need to listen on a `POST` endpoint with the name of the binding as specified in `metadata.name` in the file.  In this example, this is `myevent`.

*The following example shows how you would listen for the event in Node.js, but this is applicable to any programming language*

```javascript
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())

const port = 3000

app.post('/myevent', (req, res) => {
    console.log(req.body)
    res.status(200).send()
})

app.listen(port, () => console.log(`Kafka consumer app listening on port ${port}!`))
```

### ACK-ing an event

In order to tell Dapr that you successfully processed an event in your application, return a `200 OK` response from your HTTP handler.

```javascript
res.status(200).send()
```

### Rejecting an event

In order to tell Dapr that the event wasn't processed correctly in your application and schedule it for redelivery, return any response different from `200 OK`. For example, a `500 Error`.

```javascript
res.status(500).send()
```

### Specifying a custom route

By default, incoming events will be sent to an HTTP endpoint that corresponds to the name of the input binding.
You can override this by setting the following metadata property:

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

* [Bindings building block]({{< ref bindings >}})
* [Bindings API]({{< ref bindings_api.md >}})
* [Components concept]({{< ref components-concept.md >}})
* [Supported bindings]({{< ref supported-bindings >}})
