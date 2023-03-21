---
type: docs
title: "RabbitMQ"
linkTitle: "RabbitMQ"
description: "Detailed documentation on the RabbitMQ pubsub component"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-rabbitmq/"
---

## Component format

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: rabbitmq-pubsub
spec:
  type: pubsub.rabbitmq
  version: v1
  metadata:
  - name: host
    value: "amqp://localhost:5672"
  - name: consumerID
    value: myapp
  - name: durable
    value: false
  - name: deletedWhenUnused
    value: false
  - name: autoAck
    value: false
  - name: deliveryMode
    value: 0
  - name: requeueInFailure
    value: false
  - name: prefetchCount
    value: 0
  - name: reconnectWait
    value: 0
  - name: concurrencyMode
    value: parallel
  - name: publisherConfirm
    value: false
  - name: enableDeadLetter # Optional enable dead Letter or not
    value: true
  - name: maxLen # Optional max message count in a queue
    value: 3000
  - name: maxLenBytes # Optional maximum length in bytes of a queue.
    value: 10485760
  - name: exchangeKind
    value: fanout
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| host               | Y        | Connection-string for the rabbitmq host  | `amqp://user:pass@localhost:5672`
| consumerID         | N        | Consumer ID a.k.a consumer tag organizes one or more consumers into a group. Consumers with the same consumer ID work as one virtual consumer, i.e. a message is processed only once by one of the consumers in the group. If the consumer ID is not set, the dapr runtime will set it to the dapr application ID. |
| durable            | N        | Whether or not to use [durable](https://www.rabbitmq.com/queues.html#durability) queues. Defaults to `"false"`  | `"true"`, `"false"`
| deletedWhenUnused  | N        | Whether or not the queue should be configured to [auto-delete](https://www.rabbitmq.com/queues.html) Defaults to `"true"` | `"true"`, `"false"`
| autoAck  | N        | Whether or not the queue consumer should [auto-ack](https://www.rabbitmq.com/confirms.html) messages. Defaults to `"false"` | `"true"`, `"false"`
| deliveryMode  | N        | Persistence mode when publishing messages. Defaults to `"0"`. RabbitMQ treats `"2"` as persistent, all other numbers as non-persistent | `"0"`, `"2"`
| requeueInFailure  | N        | Whether or not to requeue when sending a [negative acknowledgement](https://www.rabbitmq.com/nack.html) in case of a failure. Defaults to `"false"` | `"true"`, `"false"`
| prefetchCount  | N        | Number of messages to [prefetch](https://www.rabbitmq.com/consumer-prefetch.html). Consider changing this to a non-zero value for production environments. Defaults to `"0"`, which means that all available messages will be pre-fetched. | `"2"`
| publisherConfirm  | N        | If enabled, client waits for [publisher confirms](https://www.rabbitmq.com/confirms.html#publisher-confirms) after publishing a message. Defaults to `"false"` | `"true"`, `"false"`
| reconnectWait  | N        | How long to wait (in seconds) before reconnecting if a connection failure occurs | `"0"`
| concurrencyMode | N        | `parallel` is the default, and allows processing multiple messages in parallel (limited by the `app-max-concurrency` annotation, if configured). Set to `single` to disable parallel processing. In most situations there's no reason to change this. | `parallel`, `single`
| enableDeadLetter      | N        | Enable forwarding Messages that cannot be handled to a dead-letter topic. Defaults to `"false"` | `"true"`, `"false"` |
| maxLen      | N        | The maximum number of messages of a queue and its dead letter queue (if dead letter enabled). If both `maxLen` and `maxLenBytes` are set then both will apply; whichever limit is hit first will be enforced.  Defaults to no limit. | `"1000"` |
| maxLenBytes      | N        | Maximum length in bytes of a queue and its dead letter queue (if dead letter enabled). If both `maxLen` and `maxLenBytes` are set then both will apply; whichever limit is hit first will be enforced.  Defaults to no limit. | `"1048576"` |
| exchangeKind      | N        | Exchange kind of the rabbitmq exchange.  Defaults to `"fanout"`. | `"fanout"`,`"topic"` |
| caCert | Required for using TLS | Input/Output | Certificate Authority (CA) certificate in PEM format for verifying server TLS certificates. | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`
| clientCert  | Required for using TLS | Input/Output | TLS client certificate in PEM format. Must be used with `clientKey`. | `"-----BEGIN CERTIFICATE-----\n<base64-encoded DER>\n-----END CERTIFICATE-----"`
| clientKey | Required for using TLS | Input/Output | TLS client key in PEM format. Must be used with `clientCert`. Can be `secretKeyRef` to use a secret reference. | `"-----BEGIN RSA PRIVATE KEY-----\n<base64-encoded PKCS8>\n-----END RSA PRIVATE KEY-----"`


## Communication using TLS

To configure communication using TLS, ensure that the RabbitMQ nodes have TLS enabled and provide the `caCert`, `clientCert`, `clientKey` metadata in the component configuration. For example:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: rabbitmq-pubsub
spec:
  type: pubsub.rabbitmq
  version: v1
  metadata:
  - name: host
    value: "amqps://localhost:5671"
  - name: consumerID
    value: myapp
  - name: durable
    value: false
  - name: deletedWhenUnused
    value: false
  - name: autoAck
    value: false
  - name: deliveryMode
    value: 0
  - name: requeueInFailure
    value: false
  - name: prefetchCount
    value: 0
  - name: reconnectWait
    value: 0
  - name: concurrencyMode
    value: parallel
  - name: publisherConfirm
    value: false
  - name: enableDeadLetter # Optional enable dead Letter or not
    value: true
  - name: maxLen # Optional max message count in a queue
    value: 3000
  - name: maxLenBytes # Optional maximum length in bytes of a queue.
    value: 10485760
  - name: exchangeKind
    value: fanout
  - name: caCert
    value: ${{ myLoadedCACert }}
  - name: clientCert
    value: ${{ myLoadedClientCert }}
  - name: clientKey
    secretKeyRef:
      name: myRabbitMQClientKey
      key: myRabbitMQClientKey
```

Note that while the `caCert` and `clientCert` values may not be secrets, they can be referenced from a Dapr secret store as well for convenience.

### Enabling message delivery retries

The RabbitMQ pub/sub component has no built-in support for retry strategies. This means that the sidecar sends a message to the service only once. When the service returns a result, the message will be marked as consumed regardless of whether it was processed correctly or not. Note that this is common among all Dapr PubSub components and not just RabbitMQ.
Dapr can try redelivering a message a second time, when `autoAck` is set to `false` and `requeueInFailure` is set to `true`.

To make Dapr use more sophisticated retry policies, you can apply a [retry resiliency policy]({{< ref "policies.md#retries" >}}) to the RabbitMQ pub/sub component.

There is a crucial difference between the two ways to retry messages:

1. When using `autoAck = false` and `requeueInFailure = true`, RabbitMQ is the one responsible for re-delivering messages and _any_ subscriber can get the redelivered message. If you have more than one instance of your consumer, then it’s possible that another consumer will get it. This is usually the better approach because if there’s a transient failure, it’s more likely that a different worker will be in a better position to successfully process the message.
2. Using Resiliency makes the same Dapr sidecar retry redelivering the messages. So it will be the same Dapr sidecar and the same app receiving the same message.

## Create a RabbitMQ server

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
You can run a RabbitMQ server locally using Docker:

```bash
docker run -d --hostname my-rabbit --name some-rabbit rabbitmq:3
```

You can then interact with the server using the client port: `localhost:5672`.
{{% /codetab %}}

{{% codetab %}}
The easiest way to install RabbitMQ on Kubernetes is by using the [Helm chart](https://github.com/helm/charts/tree/master/stable/rabbitmq):

```bash
helm install rabbitmq stable/rabbitmq
```

Look at the chart output and get the username and password.

This will install RabbitMQ into the `default` namespace. To interact with RabbitMQ, find the service with: `kubectl get svc rabbitmq`.

For example, if installing using the example above, the RabbitMQ server client address would be:

`rabbitmq.default.svc.cluster.local:5672`
{{% /codetab %}}

{{< /tabs >}}

## Use topic exchange to route messages

Setting `exchangeKind` to `"topic"` uses the topic exchanges, which are commonly used for the multicast routing of messages.
Messages with a `routing key` will be routed to one or many queues based on the `routing key` defined in the metadata when subscribing.
The routing key is defined by the `routingKey` metadata. For example, if an app is configured with a routing key `keyA`:

```
apiVersion: dapr.io/v1alpha1
kind: Subscription
metadata:
  name: orderspubsub
spec:
  topic: B
  route: /B
  pubsubname: pubsub
  metadata:
    routingKey: keyA
```

It will receive messages with routing key `keyA`, and messages with other routing keys are not received.

```
// publish messages with routing key `keyA`, and these will be received by the above example.
client.PublishEvent(context.Background(), "pubsub", "B", []byte("this is a message"), dapr.PublishEventWithMetadata(map[string]string{"routingKey": "keyA"}))
// publish messages with routing key `keyB`, and these will not be received by the above example.
client.PublishEvent(context.Background(), "pubsub", "B", []byte("this is another message"), dapr.PublishEventWithMetadata(map[string]string{"routingKey": "keyB"}))
```

### Bind multiple `routingKey`

Multiple routing keys can be separated by commas.  
The example below binds three `routingKey`: `keyA`, `keyB`, and `""`. Note the binding method of empty keys.

```yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: orderspubsub
spec:
  topic: B
  routes: 
    default: /B
  pubsubname: pubsub
  metadata:
    routingKey: keyA,keyB,
```


For more information see [rabbitmq exchanges](https://www.rabbitmq.com/tutorials/amqp-concepts.html#exchanges).

## Use priority queues

Dapr supports RabbitMQ [priority queues](https://www.rabbitmq.com/priority.html). To set a priority for a queue, use the `maxPriority` topic subscription metadata.

### Declarative priority queue example

```yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: pubsub
spec:
  topic: checkout
  routes: 
    default: /orders
  pubsubname: order-pub-sub
  metadata:
    maxPriority: 3
```

### Programmatic priority queue example

{{< tabs Python JavaScript Go>}}

{{% codetab %}}

```python
@app.route('/dapr/subscribe', methods=['GET'])
def subscribe():
    subscriptions = [
      {
        'pubsubname': 'pubsub',
        'topic': 'checkout',
        'routes': {
          'default': '/orders'
        },
        'metadata': {'maxPriority': '3'}
      }
    ]
    return jsonify(subscriptions)
```

{{% /codetab %}}

{{% codetab %}}

```javascript
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json({ type: 'application/*+json' }));

const port = 3000

app.get('/dapr/subscribe', (req, res) => {
  res.json([
    {
      pubsubname: "pubsub",
      topic: "checkout",
      routes: {
        default: '/orders'
      },
      metadata: {
        maxPriority: '3'
      }
    }
  ]);
})
```

{{% /codetab %}}

{{% codetab %}}

```go
package main

	"encoding/json"
	"net/http"

const appPort = 3000

type subscription struct {
	PubsubName string            `json:"pubsubname"`
	Topic      string            `json:"topic"`
	Metadata   map[string]string `json:"metadata,omitempty"`
	Routes     routes            `json:"routes"`
}

type routes struct {
	Rules   []rule `json:"rules,omitempty"`
	Default string `json:"default,omitempty"`
}

// This handles /dapr/subscribe
func configureSubscribeHandler(w http.ResponseWriter, _ *http.Request) {
	t := []subscription{
		{
			PubsubName: "pubsub",
			Topic:      "checkout",
			Routes: routes{
				Default: "/orders",
			},
      Metadata: map[string]string{
        "maxPriority": "3"
      },
		},
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(t)
}
```
{{% /codetab %}}

{{< /tabs >}}

### Setting a priority when publishing a message

To set a priority on a message, add the publish metadata key `maxPriority` to the publish endpoint or SDK method.

{{< tabs "HTTP API (Bash)" Python JavaScript Go>}}

{{% codetab %}}

```bash
curl -X POST http://localhost:3601/v1.0/publish/order-pub-sub/orders?metadata.maxPriority=3 -H "Content-Type: application/json" -d '{"orderId": "100"}'
```

{{% /codetab %}}

{{% codetab %}}

```python
with DaprClient() as client:
        result = client.publish_event(
            pubsub_name=PUBSUB_NAME,
            topic_name=TOPIC_NAME,
            data=json.dumps(orderId),
            data_content_type='application/json',
            metadata= { 'maxPriority': '3' })
```

{{% /codetab %}}

{{% codetab %}}

```javascript
await client.pubsub.publish(PUBSUB_NAME, TOPIC_NAME, orderId, { 'maxPriority': '3' });
```

{{% /codetab %}}

{{% codetab %}}

```go
client.PublishEvent(ctx, PUBSUB_NAME, TOPIC_NAME, []byte(strconv.Itoa(orderId)), map[string]string{"maxPriority": "3"})
```
{{% /codetab %}}

{{< /tabs >}}

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}}) in the Related links section
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [Pub/Sub building block]({{< ref pubsub >}})
