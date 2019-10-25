# Pub Sub and Broadcast

## Publish a message to a given topic

This endpoint lets you publish a payload to multiple consumers who are listening on a ```topic```.
Dapr guarantees at least once semantics for this endpoint.

### HTTP Request

```POST http://localhost:<daprPort>/v1.0/publish/<topic>```
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

## Broadcast a message to a list of recipients

This endpoint lets you publish a payload to a named list recipients  who are listening on a given ```topic```.
The list of recipients may include the unique identifiers of other apps (used by Dapr for messaging) and also Dapr bindings.

### HTTP Request

```POST http://localhost:<daprPort>/v1.0/publish/<topic>```

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

> Example of publishing a message to another Dapr app:

```shell
curl -X POST http://localhost:3500/v1.0/publish \
	-H "Content-Type: application/json" \
	-d '{
        "topic": "DeathStarStatus",
        "data": {
          "status": "completed"
        },
        "to": [
          "otherApp"
        ]
      }'
```

> Example of publishing a message to an Dapr binding:

```shell
curl -X POST http://localhost:3500/v1.0/publish \
	-H "Content-Type: application/json" \
	-d '{
        "topic": "DeathStarStatus",
        "data": {
          "status": "completed"
        },
        "to": [
          "azure-queues"
        ]
      }'
```

> Example of publishing a message to multiple consumers in parallel:

```shell
curl -X POST http://localhost:3500/v1.0/publish \
	-H "Content-Type: application/json" \
	-d '{
        "eventName": "DeathStarStatus",
        "data": {
          "status": "completed"
        },
        "to": [
          "otherApp",
          "azure-queues"
        ],
        "concurrency": "parallel"
      }'
```

## Handling topic subscriptions

In order to receive topic subscriptions, Dapr will invoke the following endpoint on user code:

### HTTP Request

`GET http://localhost:<appPort>/dapr/subscribe`

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

## Delivering events to subscribers

In order to deliver events to a subscribed application, a `POST` call should be made to user code with the name of the topic as the URL path.

The following example illustrates this point, considering a subscription for topic `TopicA`:

### HTTP Request

`POST http://localhost:<appPort>/TopicA`

### URL Parameters

Parameter | Description
--------- | -----------
appPort | the application port

### HTTP Response body

A JSON encoded payload.

## Message Envelope

Dapr Pub/Sub adheres to version 0.3 of Cloud Events.
