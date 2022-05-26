---
type: docs
title: "How-To: Route messages to different event handlers"
linkTitle: "How-To: Route events"
weight: 2300
description: "Learn how to route messages from a topic to different event handlers based on CloudEvent fields"
---

{{% alert title="Preview feature" color="warning" %}}
Pub/sub message routing is currently in [preview]({{< ref preview-features.md >}}).
{{% /alert %}}

Pub/sub routing is an implementation of [content-based routing](https://www.enterpriseintegrationpatterns.com/ContentBasedRouter.html), a messaging pattern that utilizes a DSL instead of imperative application code. With pub/sub routing, you use expressions to route [CloudEvents](https://cloudevents.io) (based on their contents) to different URIs/paths and event handlers in your application. If no route matches, then an optional default route is used. This proves useful as your applications expand to support multiple event versions or special cases.

While routing can be implemented with code, keeping routing rules external from the application can improve portability.

This feature is available to both the [declarative and programmatic subscription approaches]({{< ref subscription-methods.md >}}).

## Enable message routing

To enable this preview feature, add the `PubSub.Routing` feature entry to your application configuration:

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

Learn more about enabling [preview features]({{< ref preview-features >}}).

## Declarative subscription

For declarative subscriptions, use `dapr.io/v2alpha1` as the `apiVersion`. Here is an example of `subscriptions.yaml` using routing:

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

In the programmatic approach, the `routes` structure is returned instead of `route`. The JSON structure matches the declarative YAML:

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

In these examples, depending on the `event.type`, the application will be called on:

- `/widgets`
- `/gadgets`
- `/products`

The expressions are written as [Common Expression Language (CEL)](https://github.com/google/cel-spec) where `event` represents the cloud event. Any of the attributes from the [CloudEvents core specification](https://github.com/cloudevents/spec/blob/v1.0.1/spec.md#required-attributes) can be referenced in the expression.

### Example expressions

Match "important" messages:

```javascript
has(event.data.important) && event.data.important == true
```

Match deposits greater than $10,000:

```javascript
event.type == "deposit" && event.data.amount > 10000
```

Match multiple versions of a message:

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

As defined by the term **data**, CloudEvents _may_ include domain-specific information about the occurrence. When present, this information will be encapsulated within `data`.

- **Description:** The event payload. This specification places no restriction on the information type. It is encoded into a media format, specified by the `datacontenttype` attribute (e.g. application/json), and adheres to the `dataschema` format when those respective attributes are present.
- **Constraints:**
  - OPTIONAL

{{% alert title="Limitation" color="warning" %}}
Currently, you can only access the attributes inside data if it is nested JSON values and not JSON escaped in a string.
{{% /alert %}}

### REQUIRED Attributes

The following attributes are **required** in all CloudEvents:

#### id

- **Type:** `String`
- **Description:** Identifies the event. Producers _must_ ensure that `source` + `id`
  are unique for each distinct event. If a duplicate event is re-sent (e.g. due
  to a network error), it may have the same `id`. Consumers may assume that
  events with identical `source` and `id` are duplicates.
- **Constraints:**
  - REQUIRED
  - Must be a non-empty string
  - Must be unique within the scope of the producer
- **Examples:**
  - An event counter maintained by the producer
  - A UUID

#### source

- **Type:** `URI-reference`
- **Description:** Identifies the context in which an event happened. Often this includes information such as:
  - The type of the event source
  - The organization publishing the event
  - The process that produced the event  
  
  The exact syntax and semantics behind the data encoded in the URI is defined by the event producer.

  Producers _must_ ensure that `source` + `id` are unique for each distinct event.

  An application may:
  - Assign a unique `source` to each distinct producer, making it easier to produce unique IDs and preventing other producers from having the same `source`. 
  - Use UUIDs, URNs, DNS authorities, or an application-specific scheme to create unique `source` identifiers.

  A source may include more than one producer. In this case, the producers _must_ collaborate to ensure that `source` + `id` are unique for each distinct event.

- **Constraints:**
  - REQUIRED
  - Must be a non-empty URI-reference
  - An absolute URI is RECOMMENDED
- **Examples:**
  - Internet-wide unique URI with a DNS authority:
    - https://github.com/cloudevents
    - mailto:cncf-wg-serverless@lists.cncf.io
  - Universally-unique URN with a UUID:
    - urn:uuid:6e8bc430-9c3a-11d9-9669-0800200c9a66
  - Application-specific identifiers:
    - /cloudevents/spec/pull/123
    - /sensors/tn-1234567/alerts
    - 1-555-123-4567

#### specversion

- **Type:** `String`
- **Description:** The version of the CloudEvents specification used by the event. This enables the interpretation of the context. Compliant event producers _must_ use a value of `1.0` when referring to this version of the specification.

  Currently, this attribute only includes the 'major' and 'minor' version numbers. This allows patch changes to the specification to be made without changing this property's value in the serialization.

  Note: for 'release candidate' releases, a suffix might be used for testing
  purposes.

- **Constraints:**
  - REQUIRED
  - Must be a non-empty string

#### type

- **Type:** `String`
- **Description:** Contains a value describing the event type related to the originating occurrence. Often, this attribute is used for routing, observability, policy enforcement, etc. The format is producer-defined and might include information like the version of the `type`. See [Versioning of CloudEvents in the Primer](https://github.com/cloudevents/spec/blob/v1.0.1/primer.md#versioning-of-cloudevents) for more information.
- **Constraints:**
  - REQUIRED
  - Must be a non-empty string
  - Should be prefixed with a reverse-DNS name. The prefixed domain dictates the
    organization, which defines the semantics of this event type.
- **Examples:**
  - com.github.pull_request.opened
  - com.example.object.deleted.v2

### OPTIONAL Attributes

The following attributes are **optional** to appear in CloudEvents. See the [Notational Conventions](https://github.com/cloudevents/spec/blob/v1.0.1/spec.md#notational-conventions) section for more information on the definition of OPTIONAL.

#### datacontenttype

- **Type:** `String` per [RFC 2046](https://tools.ietf.org/html/rfc2046)
- **Description:** Content type of `data` value. This attribute enables `data` to carry any type of content, whereby format and encoding might differ from that of the chosen event format.

  For example, an event rendered using the [JSON envelope](https://github.com/cloudevents/spec/blob/v1.0.1/json-format.md#3-envelope) format might carry an XML payload in `data`. The consumer is informed by this attribute being set to `"application/xml"`. 

  The rules for how `data` content is rendered for different `datacontenttype` values are defined in the event format specifications. For example, the JSON event format defines the relationship in [section 3.1](https://github.com/cloudevents/spec/blob/v1.0.1/json-format.md#31-handling-of-data).

  For some binary mode protocol bindings, this field is directly mapped to the respective protocol's content-type metadata property. You can find normative rules for the binary mode and the content-type metadata mapping in the respective protocol.

  In some event formats, you may omit the `datacontenttype` attribute. For example, if a JSON format event has no `datacontenttype` attribute, it's implied that the `data` is a JSON value conforming to the `"application/json"` media type. In other words: a JSON-format event with no `datacontenttype` is exactly equivalent to one with `datacontenttype="application/json"`.

  When translating an event message with no `datacontenttype` attribute to a different format or protocol binding, the target `datacontenttype` should be set explicitly to the implied `datacontenttype` of the source.

- **Constraints:**
  - OPTIONAL
  - If present, must adhere to the format specified in [RFC 2046](https://tools.ietf.org/html/rfc2046)
- For Media Type examples, see [IANA Media Types](http://www.iana.org/assignments/media-types/media-types.xhtml)

#### dataschema

- **Type:** `URI`
- **Description:** Identifies the schema that `data` adheres to. Incompatible changes to the schema should be reflected by a different URI. See [Versioning of CloudEvents in the Primer](https://github.com/cloudevents/spec/blob/v1.0.1/primer.md#versioning-of-cloudevents) for more information.
- **Constraints:**
  - OPTIONAL
  - If present, must be a non-empty URI

#### subject

- **Type:** `String`
- **Description:** This describes the event subject in the context of the event producer (identified by `source`). In publish-subscribe scenarios, a subscriber will typically subscribe to events emitted by a `source`. The `source` identifier alone might not be sufficient as a qualifier for any specific event if the `source` context has internal sub-structure.

  Identifying the subject of the event in context metadata (opposed to only in the `data` payload) is helpful in generic subscription filtering scenarios, where middleware is unable to interpret the `data` content. In the above example, the subscriber might only be interested in blobs with names ending with '.jpg' or '.jpeg'. With the `subject` attribute, you can construct a simple and efficient string-suffix filter for that subset of events.

- **Constraints:**
  - OPTIONAL
  - If present, must be a non-empty string
- **Example:**  
  A subscriber might register interest for when new blobs are created inside a blob-storage container. In this case: 
  - The event `source` identifies the subscription scope (storage container)
  - The event `type` identifies the "blob created" event
  - The event `id` uniquely identifies the event instance to distinguish separately created occurrences of a same-named blob.  
  
  The name of the newly created blob is carried in `subject`:
  - `source`: https://example.com/storage/tenant/container
  - `subject`: mynewfile.jpg

#### time

- **Type:** `Timestamp`
- **Description:** Timestamp of when the occurrence happened. If the time of the occurrence cannot be determined, then this attribute may be set to some other time (such as the current time) by the CloudEvents producer. However, all producers for the same `source` _must_ be consistent in this respect. In other words, either they all use the actual time of the occurrence or they all use the same algorithm to determine the value used.
- **Constraints:**
  - OPTIONAL
  - If present, must adhere to the format specified in [RFC 3339](https://tools.ietf.org/html/rfc3339)

{{% alert title="Limitation" color="warning" %}}
Currently, comparisons to time (e.g. before or after "now") are not supported.
{{% /alert %}}

## Community call demo

Watch [this video](https://www.youtube.com/watch?v=QqJgRmbH82I&t=1063s) on how to use message routing with pub/sub:

<p class="embed-responsive embed-responsive-16by9">
<iframe width="688" height="430" src="https://www.youtube.com/embed/QqJgRmbH82I?start=1063" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</p>

## Next steps

- Try the [pub/sub routing sample](https://github.com/dapr/samples/tree/master/pub-sub-routing).
- Learn about [topic scoping]({{< ref pubsub-scopes.md >}}) and [message time-to-live]({{< ref pubsub-message-ttl.md >}}).
- [Configure pub/sub components with multiple namespaces]({{< ref pubsub-namespaces.md >}}).
- Review the list of [pub/sub components]({{< ref setup-pubsub >}}).
- Read the [API reference]({{< ref pubsub_api.md >}}).
