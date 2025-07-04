---
type: docs
title: "Pub/sub API reference"
linkTitle: "Pub/Sub API"
description: "Detailed documentation on the pub/sub API"
weight: 200
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

## Publish multiple messages to a given topic

This endpoint lets you publish multiple messages to consumers who are listening on a `topic`.

### HTTP Request

```
POST http://localhost:<daprPort>/v1.0-alpha1/publish/bulk/<pubsubname>/<topic>[?<metadata>]
```

The request body should contain a JSON array of entries with:
- Unique entry IDs
- The event to publish
- The content type of the event

If the content type for an event is not `application/cloudevents+json`, it is auto-wrapped as a CloudEvent (unless `metadata.rawPayload` is set to `true`).

Example:

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/publish/bulk/pubsubName/deathStarStatus \
  -H 'Content-Type: application/json' \
  -d '[
        {
            "entryId": "ae6bf7c6-4af2-11ed-b878-0242ac120002",
            "event":  "first text message",
            "contentType": "text/plain"
        },
        {
            "entryId": "b1f40bd6-4af2-11ed-b878-0242ac120002",
            "event":  {
                "message": "second JSON message"   
            },
            "contentType": "application/json"
        },
      ]'
```

### Headers

The `Content-Type` header should always be set to `application/json` since the request body is a JSON array.

### URL Parameters

|**Parameter**|**Description**|
|--|--|
|`daprPort`|The Dapr port|
|`pubsubname`|The name of pub/sub component|
|`topic`|The name of the topic|
|`metadata`|Query parameters for [metadata]({{< ref "pubsub_api.md#metadata" >}})|

### Metadata

Metadata can be sent via query parameters in the request's URL. It must be prefixed with `metadata.`, as shown in the table below.

|**Parameter**|**Description**|
|--|--|
|`metadata.rawPayload`|Boolean to determine if Dapr should publish the messages without wrapping them as CloudEvent.|
|`metadata.maxBulkPubBytes`|Maximum bytes to publish in a bulk publish request.|


#### HTTP Response

|**HTTP Status**|**Description**|
|--|--|
|204|All messages delivered|
|400|Pub/sub does not exist|
|403|Forbidden by access controls|
|500|At least one message failed to be delivered|

In case of a 500 status code, the response body will contain a JSON object containing a list of entries that failed to be delivered. For example from our request above, if the entry with event `"first text message"` failed to be delivered, the response would contain its entry ID and an error message from the underlying pub/sub component.

```json
{
  "failedEntries": [
    {
      "entryId": "ae6bf7c6-4af2-11ed-b878-0242ac120002",
      "error": "some error message"
    },
  ],
  "errorCode": "ERR_PUBSUB_PUBLISH_MESSAGE"
}
```

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
    "routes": {
      "rules": [
        {
          "match": "event.type == order",
          "path": "/orders"
        }
      ]
      "default" : "/otherorders"
    },
    "metadata": {
      "rawPayload": "true"
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

In order to deliver topic events, a `POST` call will be made to user code with the route specified in the subscription response. Under `routes`, you can provide [rules that match a certain condition to a specific path when a message topic is received.]({{< ref "howto-route-messages.md" >}}) You can also provide a default route for any rules that do not have a specific match.

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

## Subscribe multiple messages from a given topic

This allows you to subscribe to multiple messages from a broker when listening to a `topic`.

In order to receive messages in a bulk manner for a topic subscription, the application:

- Needs to opt for `bulkSubscribe` while sending list of topics to be subscribed to
- Optionally, can configure `maxMessagesCount` and/or `maxAwaitDurationMs`
Refer to the [Send and receive messages in bulk]({{< ref pubsub-bulk.md >}}) guide for more details on how to opt-in.

#### Expected HTTP Response for Bulk Subscribe

An HTTP 2xx response denotes that entries (individual messages) inside this bulk message have been processed by the application and Dapr will now check each EntryId status.
A JSON-encoded payload body with the processing status against each entry needs to be sent:

```json
{
  "statuses": 
  [ 
    {
    "entryId": "<entryId1>",
    "status": "<status>"
    }, 
    {
    "entryId": "<entryId2>",
    "status": "<status>"
    } 
  ]
}
```

> Note: If an EntryId status is not found by Dapr in a response received from the application, that entry's status is considered `RETRY`.

Status | Description
--------- | -----------
`SUCCESS` | Message is processed successfully
`RETRY` | Message to be retried by Dapr
`DROP` | Warning is logged and message is dropped

The HTTP response might be different from HTTP 2xx. The following are Dapr's behavior in different HTTP statuses:

HTTP Status | Description
--------- | -----------
2xx | message is processed as per status in payload.
404 | error is logged and all messages are dropped
other | warning is logged and all messages to be retried

## Message envelope

Dapr pub/sub adheres to [version 1.0 of CloudEvents](https://github.com/cloudevents/spec/blob/v1.0/spec.md).

## Related links

* [How to publish to and consume topics]({{< ref howto-publish-subscribe.md >}})
* [Sample for pub/sub](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub)
