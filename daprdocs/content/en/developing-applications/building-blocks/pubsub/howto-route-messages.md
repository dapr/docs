---
type: docs
title: "How-To: Route messages to different event handlers"
linkTitle: "How-To: Route events"
weight: 2100
description: "Learn how to route messages from a topic to different event handlers based on CloudEvent fields"
---

{{% alert title="Preview feature" color="warning" %}}
Pub/Sub message routing is currently in [preview]({{< ref preview-features.md >}}).
{{% /alert %}}

## Introduction

[Content-based routing](https://www.enterpriseintegrationpatterns.com/ContentBasedRouter.html) is a messaging pattern that utilizes a DSL instead of imperative application code. PubSub routing is an implementation of this pattern that allows developers to use expressions to route [CloudEvents](https://cloudevents.io) based on their contents to different URIs/paths and event handlers in your application. If no route matches, then an optional default route is used. This becomes useful as your applications expands to support multiple event versions, or special cases. Routing can be implemented with code; however, keeping routing rules external from the application can improve portability.

This feature is available to both the declarative and programmatic subscription approaches.

## Enable message routing

This is a preview feature. To enable it, add the `PubSub.Routing` feature entry to your application configuration like so:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: pubsubroutingconfig
spec:
  features:
    - name: PubSub.Routing
      enabled: true
```
Learn more about enabling [preview features]({{<ref preview-features>}}).
## Declarative subscription

For declarative subscriptions, you must use `dapr.io/v2alpha1` as the `apiVersion`. Here is an example of `subscriptions.yaml` using routing.

```yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: myevent-subscription
spec:
  pubsubname: pubsub
  topic: inventory
  routes:
    rules:
      - match: event.type == "widget"
        path: /widgets
      - match: event.type == "gadget"
        path: /gadgets
    default: /products
scopes:
  - app1
  - app2
```

## Programmatic subscription

Alternatively, the programattic approach varies slightly in that the `routes` structure is returned instead of `route`. The JSON structure matches the declarative YAML.

{{< tabs Python Node "C#" Go PHP>}}

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
    subscriptions = [
      {
        'pubsubname': 'pubsub',
        'topic': 'inventory',
        'routes': {
          'rules': [
            {
              'match': 'event.type == "widget"',
              'path': '/widgets'
            },
            {
              'match': 'event.type == "gadget"',
              'path': '/gadgets'
            },
          ],
          'default': '/products'
        }
      }]
    return jsonify(subscriptions)

@app.route('/products', methods=['POST'])
def ds_subscriber():
    print(request.json, flush=True)
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'}
app.run()
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
      topic: "inventory",
      routes: {
        rules: [
          {
            match: 'event.type == "widget"',
            path: '/widgets'
          },
          {
            match: 'event.type == "gadget"',
            path: '/gadgets'
          },
        ],
        default: '/products'
      }
    }
  ]);
})

app.post('/products', (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});

app.listen(port, () => console.log(`consumer app listening on port ${port}!`))
```
{{% /codetab %}}

{{% codetab %}}
```csharp
        [Topic("pubsub", "inventory", "event.type ==\"widget\"", 1)]
        [HttpPost("widgets")]
        public async Task<ActionResult<Stock>> HandleWidget(Widget widget, [FromServices] DaprClient daprClient)
        {
            // Logic
            return stock;
        }

        [Topic("pubsub", "inventory", "event.type ==\"gadget\"", 2)]
        [HttpPost("gadgets")]
        public async Task<ActionResult<Stock>> HandleGadget(Gadget gadget, [FromServices] DaprClient daprClient)
        {
            // Logic
            return stock;
        }

        [Topic("pubsub", "inventory")]
        [HttpPost("products")]
        public async Task<ActionResult<Stock>> HandleProduct(Product product, [FromServices] DaprClient daprClient)
        {
            // Logic
            return stock;
        }
```
{{% /codetab %}}

{{% codetab %}}
```golang
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

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

type rule struct {
	Match string `json:"match"`
	Path  string `json:"path"`
}

// This handles /dapr/subscribe
func configureSubscribeHandler(w http.ResponseWriter, _ *http.Request) {
	t := []subscription{
		{
			PubsubName: "pubsub",
			Topic:      "inventory",
			Routes: routes{
				Rules: []rule{
					{
						Match: `event.type == "widget"`,
						Path:  "/widgets",
					},
					{
						Match: `event.type == "gadget"`,
						Path:  "/gadgets",
					},
				},
				Default: "/products",
			},
		},
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(t)
}

func main() {
	router := mux.NewRouter().StrictSlash(true)
	router.HandleFunc("/dapr/subscribe", configureSubscribeHandler).Methods("GET")
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", appPort), router))
}
```
{{% /codetab %}}

{{% codetab %}}
```php
<?php

require_once __DIR__.'/vendor/autoload.php';

$app = \Dapr\App::create(configure: fn(\DI\ContainerBuilder $builder) => $builder->addDefinitions(['dapr.subscriptions' => [
    new \Dapr\PubSub\Subscription(pubsubname: 'pubsub', topic: 'inventory', routes: (
      rules: => [
        ('match': 'event.type == "widget"', path: '/widgets'),
        ('match': 'event.type == "gadget"', path: '/gadgets'),
      ]
      default: '/products')),
]]));
$app->post('/products', function(
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

## Common Expression Language (CEL)

In these examples, depending on the type of the event (`event.type`), the application will be called on `/widgets`, `/gadgets` or `/products`. The expressions are written as [Common Expression Language (CEL)](https://github.com/google/cel-spec) where `event` represents the cloud event. Any of the attributes from the [CloudEvents core specification](https://github.com/cloudevents/spec/blob/v1.0.1/spec.md#required-attributes) can be referenced in the expression.

### Example expressions

Match "important" messages

```javascript
has(event.data.important) && event.data.important == true
```

Match deposits greater than $10000

```javascript
event.type == "deposit" && event.data.amount > 10000
```

Match multiple versions of a message

```javascript
event.type == "mymessage.v1"
```
```javascript
event.type == "mymessage.v2"
```

## CloudEvent attributes

For reference, the following attributes are from the CloudEvents specification.

### Event Data

#### data

As defined by the term Data, CloudEvents MAY include domain-specific information about the occurrence. When present, this information will be encapsulated within `data`.

- Description: The event payload. This specification does not place any restriction on the type of this information. It is encoded into a media format which is specified by the `datacontenttype` attribute (e.g. application/json), and adheres to the `dataschema` format when those respective attributes are present.
- Constraints:
  - OPTIONAL

{{% alert title="Limitation" color="warning" %}}
Currently, it is only possible to access the attributes inside data if it is nested JSON values and not JSON escaped in a string.
{{% /alert %}}

### REQUIRED Attributes

The following attributes are REQUIRED to be present in all CloudEvents:

#### id

- Type: `String`
- Description: Identifies the event. Producers MUST ensure that `source` + `id`
  is unique for each distinct event. If a duplicate event is re-sent (e.g. due
  to a network error) it MAY have the same `id`. Consumers MAY assume that
  Events with identical `source` and `id` are duplicates.
- Constraints:
  - REQUIRED
  - MUST be a non-empty string
  - MUST be unique within the scope of the producer
- Examples:
  - An event counter maintained by the producer
  - A UUID

#### source

- Type: `URI-reference`
- Description: Identifies the context in which an event happened. Often this
  will include information such as the type of the event source, the
  organization publishing the event or the process that produced the event. The
  exact syntax and semantics behind the data encoded in the URI is defined by
  the event producer.

  Producers MUST ensure that `source` + `id` is unique for each distinct event.

  An application MAY assign a unique `source` to each distinct producer, which
  makes it easy to produce unique IDs since no other producer will have the same
  source. The application MAY use UUIDs, URNs, DNS authorities or an
  application-specific scheme to create unique `source` identifiers.

  A source MAY include more than one producer. In that case the producers MUST
  collaborate to ensure that `source` + `id` is unique for each distinct event.

- Constraints:
  - REQUIRED
  - MUST be a non-empty URI-reference
  - An absolute URI is RECOMMENDED
- Examples
  - Internet-wide unique URI with a DNS authority.
    - https://github.com/cloudevents
    - mailto:cncf-wg-serverless@lists.cncf.io
  - Universally-unique URN with a UUID:
    - urn:uuid:6e8bc430-9c3a-11d9-9669-0800200c9a66
  - Application-specific identifiers
    - /cloudevents/spec/pull/123
    - /sensors/tn-1234567/alerts
    - 1-555-123-4567

#### specversion

- Type: `String`
- Description: The version of the CloudEvents specification which the event
  uses. This enables the interpretation of the context. Compliant event
  producers MUST use a value of `1.0` when referring to this version of the
  specification.

  Currently, this attribute will only have the 'major' and 'minor' version
  numbers included in it. This allows for 'patch' changes to the specification
  to be made without changing this property's value in the serialization.
  Note: for 'release candidate' releases a suffix might be used for testing
  purposes.

- Constraints:
  - REQUIRED
  - MUST be a non-empty string

#### type

- Type: `String`
- Description: This attribute contains a value describing the type of event
  related to the originating occurrence. Often this attribute is used for
  routing, observability, policy enforcement, etc. The format of this is
  producer defined and might include information such as the version of the
  `type` - see
  [Versioning of CloudEvents in the Primer](https://github.com/cloudevents/spec/blob/v1.0.1/primer.md#versioning-of-cloudevents)
  for more information.
- Constraints:
  - REQUIRED
  - MUST be a non-empty string
  - SHOULD be prefixed with a reverse-DNS name. The prefixed domain dictates the
    organization which defines the semantics of this event type.
- Examples
  - com.github.pull_request.opened
  - com.example.object.deleted.v2

### OPTIONAL Attributes

The following attributes are OPTIONAL to appear in CloudEvents. See the
[Notational Conventions](https://github.com/cloudevents/spec/blob/v1.0.1/spec.md#notational-conventions) section for more information
on the definition of OPTIONAL.

#### datacontenttype

- Type: `String` per [RFC 2046](https://tools.ietf.org/html/rfc2046)
- Description: Content type of `data` value. This attribute enables `data` to
  carry any type of content, whereby format and encoding might differ from that
  of the chosen event format. For example, an event rendered using the
  [JSON envelope](https://github.com/cloudevents/spec/blob/v1.0.1/json-format.md#3-envelope) format might carry an XML payload
  in `data`, and the consumer is informed by this attribute being set to
  "application/xml". The rules for how `data` content is rendered for different
  `datacontenttype` values are defined in the event format specifications; for
  example, the JSON event format defines the relationship in
  [section 3.1](https://github.com/cloudevents/spec/blob/v1.0.1/json-format.md#31-handling-of-data).

  For some binary mode protocol bindings, this field is directly mapped to the
  respective protocol's content-type metadata property. Normative rules for the
  binary mode and the content-type metadata mapping can be found in the
  respective protocol.

  In some event formats the `datacontenttype` attribute MAY be omitted. For
  example, if a JSON format event has no `datacontenttype` attribute, then it is
  implied that the `data` is a JSON value conforming to the "application/json"
  media type. In other words: a JSON-format event with no `datacontenttype` is
  exactly equivalent to one with `datacontenttype="application/json"`.

  When translating an event message with no `datacontenttype` attribute to a
  different format or protocol binding, the target `datacontenttype` SHOULD be
  set explicitly to the implied `datacontenttype` of the source.

- Constraints:
  - OPTIONAL
  - If present, MUST adhere to the format specified in
    [RFC 2046](https://tools.ietf.org/html/rfc2046)
- For Media Type examples see
  [IANA Media Types](http://www.iana.org/assignments/media-types/media-types.xhtml)

#### dataschema

- Type: `URI`
- Description: Identifies the schema that `data` adheres to. Incompatible
  changes to the schema SHOULD be reflected by a different URI. See
  [Versioning of CloudEvents in the Primer](https://github.com/cloudevents/spec/blob/v1.0.1/primer.md#versioning-of-cloudevents)
  for more information.
- Constraints:
  - OPTIONAL
  - If present, MUST be a non-empty URI

#### subject

- Type: `String`
- Description: This describes the subject of the event in the context of the
  event producer (identified by `source`). In publish-subscribe scenarios, a
  subscriber will typically subscribe to events emitted by a `source`, but the
  `source` identifier alone might not be sufficient as a qualifier for any
  specific event if the `source` context has internal sub-structure.

  Identifying the subject of the event in context metadata (opposed to only in
  the `data` payload) is particularly helpful in generic subscription filtering
  scenarios where middleware is unable to interpret the `data` content. In the
  above example, the subscriber might only be interested in blobs with names
  ending with '.jpg' or '.jpeg' and the `subject` attribute allows for
  constructing a simple and efficient string-suffix filter for that subset of
  events.

- Constraints:
  - OPTIONAL
  - If present, MUST be a non-empty string
- Example:
  - A subscriber might register interest for when new blobs are created inside a
    blob-storage container. In this case, the event `source` identifies the
    subscription scope (storage container), the `type` identifies the "blob
    created" event, and the `id` uniquely identifies the event instance to
    distinguish separate occurrences of a same-named blob having been created;
    the name of the newly created blob is carried in `subject`:
    - `source`: https://example.com/storage/tenant/container
    - `subject`: mynewfile.jpg

#### time

- Type: `Timestamp`
- Description: Timestamp of when the occurrence happened. If the time of the
  occurrence cannot be determined then this attribute MAY be set to some other
  time (such as the current time) by the CloudEvents producer, however all
  producers for the same `source` MUST be consistent in this respect. In other
  words, either they all use the actual time of the occurrence or they all use
  the same algorithm to determine the value used.
- Constraints:
  - OPTIONAL
  - If present, MUST adhere to the format specified in
    [RFC 3339](https://tools.ietf.org/html/rfc3339)

{{% alert title="Limitation" color="warning" %}}
Currently, comparisons to time (e.g. before or after "now") are not supported.
{{% /alert %}}

## Community call demo

Watch [this video](https://www.youtube.com/watch?v=QqJgRmbH82I&t=1063s) on how to use message routing with pub/sub:

<p class="embed-responsive embed-responsive-16by9">
<iframe width="688" height="430" src="https://www.youtube.com/embed/QqJgRmbH82I?start=1063" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</p>

## Next steps

- Try the [Pub/Sub routing sample](https://github.com/dapr/samples/tree/master/pub-sub-routing)
- Learn about [topic scoping]({{< ref pubsub-scopes.md >}})
- Learn about [message time-to-live]({{< ref pubsub-message-ttl.md >}})
- Learn [how to configure Pub/Sub components with multiple namespaces]({{< ref pubsub-namespaces.md >}})
- List of [pub/sub components]({{< ref setup-pubsub >}})
- Read the [API reference]({{< ref pubsub_api.md >}})
