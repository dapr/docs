---
type: docs
title: "CloudEvents in Dapr Pub/Sub"
linkTitle: "CloudEvents"
weight: 2200
description: "Learn why Dapr uses CloudEvents, how they work in Dapr Pub/Sub, and how to disable CloudEvents."
---

To enable message routing and provide additional context with each message, Dapr uses the [CloudEvents 1.0 specification](https://github.com/cloudevents/spec/tree/v1.0) as its message format. Any message sent by an application to a topic using Dapr is automatically wrapped in a CloudEvents envelope, using the [`Content-Type` header value]({{< ref "pubsub-overview.md#content-types" >}}) for `datacontenttype` attribute.

Dapr uses CloudEvents to provide additional context to the event payload, enabling features like:

- Tracing
- Deduplication by message Id
- Content-type for proper deserialization of event data

When adding Dapr to your application, some services may still need to communicate via raw Pub/Sub messages not encapsulated in CloudEvents, due to either compatibility reasons or some apps not using Dapr. Dapr enables apps to [publish and subscribe to raw events]({{< ref "pubsub-cloudevents.md#publishing-raw-messages" >}}) not wrapped in a CloudEvent.

## CloudEvents example

Dapr implements the following CloudEvents fields when creating a message topic.

- `id`
- `source`
- `specversion`
- `type`
- `traceparent`
- `datacontenttype` (optional)

The following example demonstrates an `orders` topic message sent by Dapr that includes a W3C `traceid` unique to the message, the `data` and the fields for the CloudEvent where the data content is serialized as JSON.

```json
{
    "topic": "orders",
    "pubsubname": "order_pub_sub",
    "traceid": "00-113ad9c4e42b27583ae98ba698d54255-e3743e35ff56f219-01",
    "tracestate": "",
    "data": {
    "orderId": 1
    },
    "id": "5929aaac-a5e2-4ca1-859c-edfe73f11565",
    "specversion": "1.0",
    "datacontenttype": "application/json; charset=utf-8",
    "source": "checkout",
    "type": "com.dapr.event.sent",
    "traceparent": "00-113ad9c4e42b27583ae98ba698d54255-e3743e35ff56f219-01"
}
```

As another example of a v1.0 CloudEvent, the following shows data as XML content in a CloudEvent message serialized as JSON:

```json
{
    "specversion" : "1.0",
    "type" : "xml.message",
    "source" : "https://example.com/message",
    "subject" : "Test XML Message",
    "id" : "id-1234-5678-9101",
    "time" : "2020-09-23T06:23:21Z",
    "datacontenttype" : "text/xml",
    "data" : "<note><to>User1</to><from>user2</from><message>hi</message></note>"
}
```



## Publishing raw messages

Dapr apps are able to publish raw events to pub/sub topics without CloudEvent encapsulation, for compatibility with non-Dapr apps.

<img src="/images/pubsub_publish_raw.png" alt="Diagram showing how to publish with Dapr when subscriber does not use Dapr or CloudEvent" width=1000>

{{% alert title="Warning" color="warning" %}}
Not using CloudEvents disables support for tracing, event deduplication per messageId, content-type metadata, and any other features built using the CloudEvent schema.
{{% /alert %}}

To disable CloudEvent wrapping, set the `rawPayload` metadata to `true` as part of the publishing request. This allows subscribers to receive these messages without having to parse the CloudEvent schema.

{{< tabs curl "Python SDK" "PHP SDK">}}

{{% codetab %}}
```bash
curl -X "POST" http://localhost:3500/v1.0/publish/pubsub/TOPIC_A?metadata.rawPayload=true -H "Content-Type: application/json" -d '{"order-number": "345"}'
```
{{% /codetab %}}

{{% codetab %}}
```python
from dapr.clients import DaprClient

with DaprClient() as d:
    req_data = {
        'order-number': '345'
    }
    # Create a typed message with content type and body
    resp = d.publish_event(
        pubsub_name='pubsub',
        topic_name='TOPIC_A',
        data=json.dumps(req_data),
        publish_metadata={'rawPayload': 'true'}
    )
    # Print the request
    print(req_data, flush=True)
```
{{% /codetab %}}

{{% codetab %}}

```php
<?php

require_once __DIR__.'/vendor/autoload.php';

$app = \Dapr\App::create();
$app->run(function(\DI\FactoryInterface $factory) {
    $publisher = $factory->make(\Dapr\PubSub\Publish::class, ['pubsub' => 'pubsub']);
    $publisher->topic('TOPIC_A')->publish('data', ['rawPayload' => 'true']);
});
```

{{% /codetab %}}

{{< /tabs >}}

## Subscribing to raw messages

Dapr apps are also able to subscribe to raw events coming from existing pub/sub topics that do not use CloudEvent encapsulation.

<img src="/images/pubsub_subscribe_raw.png" alt="Diagram showing how to subscribe with Dapr when publisher does not use Dapr or CloudEvent" width=1000>

### Programmatically subscribe to raw events

When subscribing programmatically, add the additional metadata entry for `rawPayload` so the Dapr sidecar automatically wraps the payloads into a CloudEvent that is compatible with current Dapr SDKs.

{{< tabs "Python" "PHP SDK" >}}

{{% codetab %}}

```python
import flask
from flask import request, jsonify
from flask_cors import CORS
import json
import sys

app = flask.Flask(__name__)
CORS(app)

@app.route('/dapr/subscribe', methods=['GET'])
def subscribe():
    subscriptions = [{'pubsubname': 'pubsub',
                      'topic': 'deathStarStatus',
                      'route': 'dsstatus',
                      'metadata': {
                          'rawPayload': 'true',
                      } }]
    return jsonify(subscriptions)

@app.route('/dsstatus', methods=['POST'])
def ds_subscriber():
    print(request.json, flush=True)
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'}

app.run()
```

{{% /codetab %}}
{{% codetab %}}

```php
<?php

require_once __DIR__.'/vendor/autoload.php';

$app = \Dapr\App::create(configure: fn(\DI\ContainerBuilder $builder) => $builder->addDefinitions(['dapr.subscriptions' => [
    new \Dapr\PubSub\Subscription(pubsubname: 'pubsub', topic: 'deathStarStatus', route: '/dsstatus', metadata: [ 'rawPayload' => 'true'] ),
]]));

$app->post('/dsstatus', function(
    #[\Dapr\Attributes\FromBody]
    \Dapr\PubSub\CloudEvent $cloudEvent,
    \Psr\Log\LoggerInterface $logger
    ) {
        $logger->alert('Received event: {event}', ['event' => $cloudEvent]);
        return ['status' => 'SUCCESS'];
    }
);

$app->start();
```
{{% /codetab %}}

{{< /tabs >}}

## Declaratively subscribe to raw events

Similarly, you can subscribe to raw events declaratively by adding the `rawPayload` metadata entry to your Subscription Custom Resource Definition (CRD):

```yaml
apiVersion: dapr.io/v1alpha1
kind: Subscription
metadata:
  name: myevent-subscription
spec:
  topic: deathStarStatus
  route: /dsstatus
  pubsubname: pubsub
  metadata:
    rawPayload: "true"
scopes:
- app1
- app2
```

## Next steps

- Learn more about [publishing and subscribing messages]({{< ref pubsub-overview.md >}})
- List of [pub/sub components]({{< ref supported-pubsub >}})
- Read the [API reference]({{< ref pubsub_api.md >}})



## Custom CloudEvents

Dapr automatically takes the data sent on the publish request and [wraps it in a CloudEvent 1.0 envelope]({{< ref "pubsub-overview.md#cloud-events-message-format" >}}). If you want to use your own custom CloudEvent, make sure to specify the [content type]({{< ref "pubsub-overview.md#content-types" >}}) as `application/cloudevents+json`.

### Example

{{< tabs "Dapr CLI" "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}

Publish a custom CloudEvent to the `orders` topic:

```bash
dapr publish --publish-app-id orderprocessing --pubsub order-pub-sub --topic orders --data '{"specversion" : "1.0", "type" : "com.dapr.cloudevent.sent", "source" : "testcloudeventspubsub", "subject" : "Cloud Events Test", "id" : "someCloudEventId", "time" : "2021-08-02T09:00:00Z", "datacontenttype" : "application/cloudevents+json", "data" : {"orderId": "100"}}'
```

{{% /codetab %}}

{{% codetab %}}

Publish a custom CloudEvent to the `orders` topic:

```bash
curl -X POST http://localhost:3601/v1.0/publish/order-pub-sub/orders -H "Content-Type: application/cloudevents+json" -d '{"specversion" : "1.0", "type" : "com.dapr.cloudevent.sent", "source" : "testcloudeventspubsub", "subject" : "Cloud Events Test", "id" : "someCloudEventId", "time" : "2021-08-02T09:00:00Z", "datacontenttype" : "application/cloudevents+json", "data" : {"orderId": "100"}}'
```

{{% /codetab %}}

{{% codetab %}}

Publish a custom CloudEvent to the `orders` topic:

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/cloudevents+json' -Body '{"specversion" : "1.0", "type" : "com.dapr.cloudevent.sent", "source" : "testcloudeventspubsub", "subject" : "Cloud Events Test", "id" : "someCloudEventId", "time" : "2021-08-02T09:00:00Z", "datacontenttype" : "application/cloudevents+json", "data" : {"orderId": "100"}}' -Uri 'http://localhost:3601/v1.0/publish/order-pub-sub/orders'
```

{{% /codetab %}}

{{< /tabs >}}

## Next steps

- Try out the [Pub/sub Quickstart]({{< ref pubsub-quickstart.md >}})
- List of [Pub/sub components]({{< ref setup-pubsub >}})
- Read the [API reference]({{< ref pubsub_api.md >}})
