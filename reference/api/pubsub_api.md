# Pub Sub

## Publish a message to a given topic

This endpoint lets you publish data to multiple consumers who are listening on a ```topic```.
Dapr guarantees at least once semantics for this endpoint.

### HTTP Request

```http
POST http://localhost:<daprPort>/v1.0/publish/<pubsubname>/<topic>
```

### HTTP Response codes

Code | Description
---- | -----------
200  | Message delivered
500  | Delivery failed

### URL Parameters

Parameter | Description
--------- | -----------
daprPort | the Dapr port
pubsubname | the name of pubsub component.
topic | the name of the topic

```shell
curl -X POST http://localhost:3500/v1.0/publish/pubsubName/deathStarStatus \
  -H "Content-Type: application/json" \
 -d '{
       "status": "completed"
     }'
```

# Required Application (User Code) Routes

## Provide a route for Dapr to discover topic subscriptions

Dapr will invoke the following endpoint on user code to discover topic subscriptions:

### HTTP Request

```http
GET http://localhost:<appPort>/dapr/subscribe
```

### URL Parameters

Parameter | Description
--------- | -----------
appPort | the application port

### HTTP Response body

A json encoded array of strings.

Example:

```json
[
  {
    "topic": "newOrder",
    "route": "/orders"
  }
]
```

## Provide route(s) for Dapr to deliver topic events

In order to deliver topic events, a `POST` call will be made to user code with the route specified in the subscription response.

The following example illustrates this point, considering a subscription for topic `newOrder` with route `orders`:

### HTTP Request

```http
POST http://localhost:<appPort>/orders
```

### URL Parameters

Parameter | Description
--------- | -----------
appPort | the application port

### HTTP Response body

A JSON encoded payload.

## Message Envelope

Dapr Pub/Sub adheres to version 1.0 of Cloud Events.

## Related links

* [How to consume topics](https://github.com/dapr/docs/tree/master/howto/consume-topic)
* [Sample for pub/sub](https://github.com/dapr/quickstarts/tree/master/pub-sub) 
