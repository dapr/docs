# Bindings

Dapr provides bi-directional binding capabilities for applications and a consistent approach to interacting with different cloud/on-premise services or systems.
Developers can invoke output bindings using the Dapr API, and have the Dapr runtime trigger an application with input bindings.

Examples for bindings include ```Kafka```, ```Rabbit MQ```, ```Azure Event Hubs```, ```AWS SQS```, ```GCP Storage``` to name a few.

## Contents

- [Bindings Structure](#bindings-structure)
- [Invoking Service Code Through Input Bindings](#invoking-service-code-through-input-bindings)
- [Sending Messages to Output Bindings](#sending-messages-to-output-bindings)

## Bindings Structure

A Dapr Binding yaml file has the following structure:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.<TYPE>
  metadata:
  - name: <NAME>
    value: <VALUE>
```

The ```metadata.name``` is the name of the binding.

If running self hosted locally, place this file in your `components` folder next to your state store and message queue yml configurations.

If running on kubernetes apply the component to your cluster.

> **Note:** In production never place passwords or secrets within Dapr component files. For information on securely storing and retrieving secrets using secret stores refer to [Setup Secret Store](../../../howto/setup-secret-store)

## Invoking Service Code Through Input Bindings

A developer who wants to trigger their app using an input binding can listen on a ```POST``` http endpoint with the route name being the same as ```metadata.name```.

On startup Dapr sends a ```OPTIONS``` request to the ```metadata.name``` endpoint and expects a different status code as ```NOT FOUND (404)``` if this application wants to subscribe to the binding.

The ```metadata``` section is an open key/value metadata pair that allows a binding to define connection properties, as well as custom properties unique to the component implementation.

### Examples

For example, here's how a Python application subscribes for events from ```Kafka``` using a Dapr API compliant platform. Note how the metadata.name value `kafkaevent` in the components matches the POST route name in the Python code.

#### Kafka Component

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafkaevent
  namespace: default
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

### Binding endpoints

Bindings are discovered from component yaml files. Dapr calls this endpoint on startup to ensure that app can handle this call. If the app doesn't have the endpoint, Dapr ignores it.
 
#### HTTP Request

```http
OPTIONS http://localhost:<appPort>/<name>
```

#### HTTP Response codes

Code | Description
---- | -----------
404  | Application does not want to bind to the binding
all others  | Application wants to bind to the binding

#### URL Parameters

Parameter | Description
--------- | -----------
appPort | the application port
name | the name of the binding

### Binding payload

In order to deliver binding inputs, a POST call is made to user code with the name of the binding as the URL path.
 
#### HTTP Request

```http
POST http://localhost:<appPort>/<name>
```

#### HTTP Response codes

Code | Description
---- | -----------
200  | Application processed the input binding successfully

#### URL Parameters

Parameter | Description
--------- | -----------
appPort | the application port
name | the name of the binding

#### HTTP Response body (optional)

Optionally, a response body can be used to directly bind input bindings with state stores or output bindings.

**Example:**
Dapr stores ```stateDataToStore``` into a state store named "stateStore".
Dapr sends ```jsonObject``` to the output bindings named "storage" and "queue" in parallel.
If ```concurrency``` is not set, it is sent out sequential (the example below shows these operations are done in parallel)

```json
{
    "storeName": "stateStore",
    "state": stateDataToStore,
    
    "to": ['storage', 'queue'],
    "concurrency": "parallel",
    "data": jsonObject,
}
```

## Sending Messages to Output Bindings

This endpoint lets you invoke an Dapr output binding.

### HTTP Request

```http
POST/GET/PUT/DELETE http://localhost:<daprPort>/v1.0/bindings/<name>
```

### HTTP Response codes

Code | Description
---- | -----------
200  | Request successful
500  | Request failed

### Payload

The bindings endpoint receives the following JSON payload:

```json
{
  "data": "",
  "metadata": {
    "": ""
  }
}
```

The `data` field takes any JSON serializable value and acts as the payload to be sent to the output binding.
The metadata is an array of key/value pairs and allows you to set binding specific metadata for each call.

### URL Parameters

Parameter | Description
--------- | -----------
daprPort | the Dapr port
name | the name of the output binding to invoke

### Examples

```shell
curl -X POST http://localhost:3500/v1.0/bindings/myKafka \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        },
        "metadata": {
          "key": "redis-key-1"
        }
      }'
```

### Common metadata values

There are common metadata properties which are support accross multiple binding components. The list below illustrates them:

|Property|Description|Binding definition|Available in
|-|-|-|-|
|ttlInSeconds|Defines the time to live in seconds for the message|If set in the binding definition will cause all messages to have a default time to live. The message ttl overrides any value in the binding definition.|RabbitMQ, Azure Service Bus, Azure Storage Queue|
