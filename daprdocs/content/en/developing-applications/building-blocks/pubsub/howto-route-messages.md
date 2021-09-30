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
  topic: deathStarStatus
  routes:
    rules:
      - match: event.type == "rebels.attacking.v3"
        path: /dsstatus.v3
      - match: event.type == "rebels.attacking.v2"
        path: /dsstatus.v2
    default: /dsstatus
scopes:
  - app1
  - app2
```

## Programmatic subscription

Alternatively, the programattic approach varies slightly in that the `routes` structure is returned instead of `route`. The JSON structure matches the declarative YAML.

{{< tabs Python Node Go PHP>}}

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
        'topic': 'deathStarStatus',
        'routes': {
          'rules': [
            {
              'match': 'event.type == "rebels.attacking.v3"',
              'path': '/dsstatus.v3'
            },
            {
              'match': 'event.type == "rebels.attacking.v2"',
              'path': '/dsstatus.v2'
            },
          ],
          'default': '/dsstatus'
        }
      }]
    return jsonify(subscriptions)

@app.route('/dsstatus', methods=['POST'])
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
            topic: "deathStarStatus",
            routes: {
                rules: [
                    {
                        match: 'event.type == "rebels.attacking.v3"',
                        path: '/dsstatus.v3'
                    },
                    {
                        match: 'event.type == "rebels.attacking.v2"',
                        path: '/dsstatus.v2'
                    },
                ],
                default: '/dsstatus'
            }
        }
    ]);
})

app.post('/dsstatus', (req, res) => {
    console.log(req.body);
    res.sendStatus(200);
});

app.listen(port, () => console.log(`consumer app listening on port ${port}!`))
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
			Topic:      "deathStarStatus",
			Routes: routes{
				Rules: []rule{
					{
						Match: `event.type == "rebels.attacking.v3"`,
						Path:  "/dsstatus.v3",
					},
					{
						Match: `event.type == "rebels.attacking.v2"`,
						Path:  "/dsstatus.v2",
					},
				},
				Default: "/dsstatus",
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
    new \Dapr\PubSub\Subscription(pubsubname: 'pubsub', topic: 'deathStarStatus', routes: (
      rules: => [
        ('match': 'event.type == "rebels.attacking.v3"', path: '/dsstatus.v3'),
        ('match': 'event.type == "rebels.attacking.v2"', path: '/dsstatus.v2'),
      ]
      default: '/dsstatus')),
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

In these examples, depending on the type of the event (`event.type`), the application will be called on `/dsstatus.v3`, `/dsstatus.v2` or `/dsstatus`. The expressions are written as [Common Expression Language (CEL)](https://opensource.google/projects/cel) where `event` represents the cloud event. Any of the attributes from the [CloudEvents core specification](https://github.com/cloudevents/spec/blob/v1.0.1/spec.md#required-attributes) can be referenced in the expression. One caveat is that it is only possible to access the attributes inside `event.data` if it is nested JSON

## Next steps

- Try the [Pub/Sub quickstart sample](https://github.com/dapr/quickstarts/tree/master/pub-sub)
- Learn about [topic scoping]({{< ref pubsub-scopes.md >}})
- Learn about [message time-to-live]({{< ref pubsub-message-ttl.md >}})
- Learn [how to configure Pub/Sub components with multiple namespaces]({{< ref pubsub-namespaces.md >}})
- List of [pub/sub components]({{< ref setup-pubsub >}})
- Read the [API reference]({{< ref pubsub_api.md >}})
