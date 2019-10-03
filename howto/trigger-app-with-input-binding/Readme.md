# Create an event-driven app using Input Bindings

Using bindings, you can author an app that gets triggered with incoming events from different event sources.

This is ideal for event-driven processing, data pipeplines or just generally reacting to events and doing further processing.

For more info on bindings, visit [this](../concepts/bindings/bindings.md) link.<br>
For a complete sample showing bindings, visit this [link](<PLACEHOLDER>).

## 1. Create a binding

An input binding represents an event source that Dapr will use to read events from and push to your app.

For the purpose of this guide, we'll use a Kafka binding. You can find a list of the different binding specs [here](../concepts/bindings//specs).

Create the following YAML file, named binding.yaml:

```
apiVersion: actions.io/v1alpha1
kind: Component
metadata:
  name: myEvent
spec:
  type: bindings.kafka
  metadata:
  - name: topics
    value: topic1
  - name: brokers
    value: localhost:9092
  - name: consumerGroup
    value: group1
```

Here, we create a new binding component with the name of `myEvent`.<br>
Inside the `metadata` section, we configure Kafka related properties such as the topic to listen on, the brokers and more.

## 2. Listen for incoming events

The only thing that remains now is for you to configure your app to receive incoming events.
If using HTTP, you need to listen on a `POST` endpoint with the name of the bindings as specifiied in `metadata.name` in the file from section 1.  In our example, this is `myEvent`.

*The following example shows how you would listen for the event in Node.JS, but this is applicable to any programming language*

```
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())

const port = 3000

app.post('/myEvent', (req, res) => {
    console.log(req.body)
    res.status(200).send()
})

app.listen(port, () => console.log(`Kafka consumer app listening on port ${port}!`))
```

#### Acknowleding an event

In order to tell Dapr that you successfully processed an event, return a `200 OK` response from your HTTP handler.

```
res.status(200).send()
```
#### Rejecting an event

In order to tell Dapr that the event wasn't processed correctly and schedule it for redelivery, return any response different from `200 OK`. For example, a `500 Error`.

```
res.status(500).send()
```
