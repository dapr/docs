# Pub Sub

## Publish a message to a given topic

This endpoint lets you publish a payload to multiple consumers who are listening on a ```topic```.
Dapr guarantees at least once semantics for this endpoint.

### HTTP Request

```http
POST http://localhost:<daprPort>/v1.0/publish/<topic>
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
topic | the name of the topic

```shell
curl -X POST http://localhost:3500/v1.0/publish/deathStarStatus \
  -H "Content-Type: application/json" \
 -d '{
       "status": "completed"
     }'
```

## Handling topic subscriptions

In order to receive topic subscriptions, Dapr will invoke the following endpoint on user code:

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
"["TopicA","TopicB"]"
```
