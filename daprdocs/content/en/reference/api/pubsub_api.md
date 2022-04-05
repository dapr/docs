---
type: docs
title: "Pub/sub API reference"
linkTitle: "Pub/Sub API"
description: "Detailed documentation on the pub/sub API"
weight: 300
---

## Publish a message to a given topic

This endpoint lets you publish data to multiple consumers who are listening on a `topic`.
Dapr guarantees At-Least-Once semantics for this endpoint.

### HTTP Request

```
POST http://localhost:<daprPort>/v1.0/publish/<pubsubname>/<topic>[?<metadata>]
```

### HTTP Response codes

Code | Description
---- | -----------
204  | Message delivered
403  | Message forbidden by access controls
404  | No pubsub name or topic given
500  | Delivery failed

### URL Parameters

Parameter | Description
--------- | -----------
`daprPort` | The Dapr port
`pubsubname` | The name of pubsub component
`topic` | The name of the topic
`metadata` | Query parameters for metadata as described below

> Note, all URL parameters are case-sensitive.

```shell
curl -X POST http://localhost:3500/v1.0/publish/pubsubName/deathStarStatus \
  -H "Content-Type: application/json" \
 -d '{
       "status": "completed"
     }'
```

### Headers

The `Content-Type` header tells Dapr which content type your data adheres to when constructing a CloudEvent envelope. The `Content-Type` header value populates the `datacontenttype` field in the CloudEvent.

Unless specified, Dapr assumes `text/plain`. If your content type is JSON, use a `Content-Type` header with the value of `application/json`.

If you want to send your own custom CloudEvent, use the `application/cloudevents+json` value for the `Content-Type` header.

#### Metadata

Metadata can be sent via query parameters in the request's URL. It must be prefixed with `metadata.`, as shown below.

Parameter | Description
--------- | -----------
`metadata.ttlInSeconds` | The number of seconds for the message to expire, as [described here]({{< ref pubsub-message-ttl.md >}})
`metadata.rawPayload` | Boolean to determine if Dapr should publish the event without wrapping it as CloudEvent, as [described here]({{< ref pubsub-raw.md >}})

> Additional metadata parameters are available based on each pubsub component.

## Optional Application (User Code) Routes

### Provide a route for Dapr to discover topic subscriptions

Dapr will invoke the following endpoint on user code to discover topic subscriptions:

#### HTTP Request

```
GET http://localhost:<appPort>/dapr/subscribe
```

#### URL Parameters

Parameter | Description
--------- | -----------
`appPort` | The application port

#### HTTP Response body

A JSON-encoded array of strings.

Example:

```json
[
  {
    "pubsubname": "pubsub",
    "topic": "newOrder",
    "route": "/orders",
    "metadata": {
      "rawPayload": "true",
    }
  }
]
```

> Note, all subscription parameters are case-sensitive.

#### Metadata

Optionally, metadata can be sent via the request body.

Parameter | Description
--------- | -----------
`rawPayload` | boolean to subscribe to events that do not comply with CloudEvent specification, as [described here]({{< ref pubsub-raw.md >}})

### Provide route(s) for Dapr to deliver topic events

In order to deliver topic events, a `POST` call will be made to user code with the route specified in the subscription response.

The following example illustrates this point, considering a subscription for topic `newOrder` with route `orders` on port 3000: `POST http://localhost:3000/orders`

#### HTTP Request

```
POST http://localhost:<appPort>/<path>
```

> Note, all URL parameters are case-sensitive.

#### URL Parameters

Parameter | Description
--------- | -----------
`appPort` | The application port
`path` | Route path from the subscription configuration

#### Expected HTTP Response

An HTTP 2xx response denotes successful processing of message.

For richer response handling, a JSON-encoded payload body with the processing status can be sent:

```json
{
  "status": "<status>"
}
```

Status | Description
--------- | -----------
`SUCCESS` | Message is processed successfully
`RETRY` | Message to be retried by Dapr
`DROP` | Warning is logged and message is dropped
Others | Error, message to be retried by Dapr

Dapr assumes that a JSON-encoded payload response without `status` field or an empty payload responses with HTTP 2xx is a `SUCCESS`.

The HTTP response might be different from HTTP 2xx. The following are Dapr's behavior in different HTTP statuses:

HTTP Status | Description
--------- | -----------
2xx | message is processed as per status in payload (`SUCCESS` if empty; ignored if invalid payload).
404 | error is logged and message is dropped
other | warning is logged and message to be retried

## Message envelope

Dapr Pub/Sub adheres to version 1.0 of CloudEvents.

## Related links

* [How to publish to and consume topics]({{< ref howto-publish-subscribe.md >}})
* [Sample for pub/sub](https://github.com/dapr/quickstarts/tree/master/pub_sub)
