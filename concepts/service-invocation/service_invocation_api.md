# Service Invocation API Specification

Dapr provides users with the ability to call other applications that have unique ids.
This functionality allows apps to interact with one another via named identifiers and puts the burden of service discovery on the Dapr runtime.

## Endpoints

- [Invoke a Method on a Remote Dapr App](#invoke-a-method-on-a-remote-dapr-app)

## Invoke a Method on a Remote Dapr App

This endpoint lets you invoke a method in another Dapr enabled app.

### HTTP Request

```http
POST/GET/PUT/DELETE http://localhost:<daprPort>/v1.0/invoke/<appId>/method/<method-name>
```

### HTTP Response codes

Code | Description
---- | -----------
200  | Request successful
500  | Request failed

### URL Parameters

Parameter | Description
--------- | -----------
daprPort | the Dapr port
appId | the App ID associated with the remote app
method-name | the name of the method or url to invoke on the remote app

### Request Contents

In the request you can pass along headers:

```json
{
  "Content-Type": "application/json"
}
```

Within the body of the request place the data you want to send to the service:

```json
{
  "arg1": 10,
  "arg2": 23,
  "operator": "+"
}
```

### Examples

You can invoke the `calculate` method on the countService service by sending the following:

```shell
curl http://localhost:3500/v1.0/invoke/countService/method/calculate \
  -H "Content-Type: application/json"
  -d '{ "arg1": 10, "arg2": 23, "operator": "+" }'
```

> The response from the remote endpoint will be returned in the request body.
