---
type: docs
title: "Pub/Sub without CloudEvents"
linkTitle: "Pub/Sub without CloudEvents"
weight: 6000
description: "Use Pub/Sub without CloudEvents." 
---

## Introduction

Dapr uses CloudEvents to provide additional context to the event payload, enabling features like:
* Tracing
* Deduplication by message Id
* Content-type for proper deserialization of event's data

For more information about CloudEvent, please check the [official specification](https://github.com/cloudevents/spec).

When adopting Dapr to an application, it might happen that other publisher or subscriber apps do not use Dapr and still require to communicate via Pub/Sub. For this reason, since version 1.2, Dapr enables apps to publish and subscribe to events that are not wrapped in a CloudEvent.

> Not using CloudEvent automatically disables support for tracing, deduplication per message Id, content-type metadata and any other feature built on top of the CloudEvent schema.

## Publish example

To disable CloudEvent wrapping, set the `rawPayload` metadata as part of the publishing request. This will enable subscribers to receive these messages without having to parsing the CloudEvent schema.

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
        topic='TOPIC_A',
        data=json.dumps(req_data),
        metadata=(
                     ('rawPayload', 'true')
                 )
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

# Subscribe example

When subscribing, add the additional metadata entry for `rawPayload` and Dapr sidecar will automatically wrap the payloads into a CloudEvent that is compatible with current Dapr SDKs.

{{< tabs "Python SDK" "PHP SDK" >}}

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

$app->start();
```
{{% /codetab %}}

{{< /tabs >}}


## Related links

- Learn more about [how to publish and subscribe]({{< ref howto-publish-subscribe.md >}})
- List of [pub/sub components]({{< ref supported-pubsub >}})
- Read the [API reference]({{< ref pubsub_api.md >}})
