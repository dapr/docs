# Bindings

Dapr provides bi-directional binding capabilities for applications and a consistent approach to interacting with different cloud/on-premise services or systems.
Developers can invoke output bindings using the Dapr API, and have the Dapr runtime trigger an application with input bindings.

Examples for bindings include ```Kafka```, ```Rabbit MQ```, ```Azure Event Hubs```, ```AWS SQS```, ```GCP Storage``` to name a few.

An Dapr Binding has the following structure:

```
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.<TYPE>
  metadata:
  - name: <NAME>
    value: <VALUE>
```

The ```metadata.name``` is the name of the binding. A developer who wants to trigger her app using an input binding can listen on a ```POST``` http endpoint with the route name being the same as ```metadata.name```.

the ```metadata``` section is an open key/value metadata pair that allows a binding to define connection properties, as well as custom properties unique to the implementation.

For example, here's how a Python application subscribes for events from ```Kafka``` using an Dapr API compliant platform:

#### Kafka Component

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafkaevent
spec:
  type: bindings.kafka
  metadata:
  - name: brokers
    value: "http://localhost:5050"
  - name: topics
    value: "someTopic"
  - name: publishTopic
    value: "someTopic2"
  - name: consumerGroup
    value: "group1"
```

#### Python Code

```python
from flask import Flask
app = Flask(__name__)

@app.route("/kafkaevent", methods=['POST'])
def incoming():
    print("Hello from Kafka!", flush=True)

    return "Kafka Event Processed!"
```

## Sending messages to output bindings

This endpoint lets you invoke an Dapr output binding.

### HTTP Request

`POST/GET/PUT/DELETE http://localhost:<daprPort>/v1.0/bindings/<name>`

### HTTP Response codes

Code | Description
---- | -----------
200  | Request successful
500  | Request failed

### Payload

The bindings endpoint receives the following JSON payload:

```
{
  "data": "",
  "metadata": [
    "": ""
  ]
}
```

The `data` field takes any JSON serializable value and acts as the payload to be sent to the output binding.
The metadata is an array of key/value pairs and allows to set binding specific metadata for each call.

### URL Parameters

Parameter | Description
--------- | -----------
daprPort | the Dapr port
name | the name of the binding to invoke

```shell
curl -X POST http://localhost:3500/v1.0/bindings/myKafka \
	-H "Content-Type: application/json" \
	-d '{
        "data": {
          "message": "Hi"
        },
        "metadata": [
          "key": "redis-key-1"
        ]
      }'
```
