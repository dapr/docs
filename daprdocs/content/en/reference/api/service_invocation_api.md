---
type: docs
title: "Service invocation API reference"
linkTitle: "Service invocation API"
description: "Detailed documentation on the service invocation API"
weight: 100
---

Dapr provides users with the ability to call other applications that have unique ids.
This functionality allows apps to interact with one another via named identifiers and puts the burden of service discovery on the Dapr runtime.

## Invoke a method on a remote dapr app

This endpoint lets you invoke a method in another Dapr enabled app.

### HTTP Request

```
PATCH/POST/GET/PUT/DELETE http://localhost:<daprPort>/v1.0/invoke/<appId>/method/<method-name>
```

### HTTP Response codes

When a service invokes another service with Dapr, the status code of the called service will be returned to the caller.
If there's a network error or other transient error, Dapr will return a `500` error with the detailed error message.

In case a user invokes Dapr over HTTP to talk to a gRPC enabled service, an error from the called gRPC service will return as `500` and a successful response will return as `200OK`.

Code | Description
---- | -----------
XXX  | Upstream status returned
400  | Method name not given
403  | Invocation forbidden by access control
500  | Request failed

### URL Parameters

Parameter | Description
--------- | -----------
daprPort | the Dapr port
appId | the App ID associated with the remote app
method-name | the name of the method or url to invoke on the remote app

> Note, all URL parameters are case-sensitive.

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

### Request received by invoked service

Once your service code invokes a method in another Dapr enabled app, Dapr will send the request, along with the headers and body, to the app on the `<method-name>` endpoint.

The Dapr app being invoked will need to be listening for and responding to requests on that endpoint.

### Cross namespace invocation

On hosting platforms that support namespaces, Dapr app IDs conform to a valid FQDN format that includes the target namespace.
For example, the following string contains the app ID (`myApp`) in addition to the namespace the app runs in (`production`).

```
myApp.production
```

#### Namespace supported platforms

- Kubernetes

### Examples

You can invoke the `add` method on the `mathService` service by sending the following:

```shell
curl http://localhost:3500/v1.0/invoke/mathService/method/add \
  -H "Content-Type: application/json"
  -d '{ "arg1": 10, "arg2": 23}'
```

The `mathService` service will need to be listening on the `/add` endpoint to receive and process the request.

For a Node app this would look like:

```js
app.post('/add', (req, res) => {
  let args = req.body;
  const [operandOne, operandTwo] = [Number(args['arg1']), Number(args['arg2'])];

  let result = operandOne + operandTwo;
  res.send(result.toString());
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
```

> The response from the remote endpoint will be returned in the response body.

In case when your service listens on a more nested path (e.g. `/api/v1/add`), Dapr implements a full reverse proxy so you can append all the necessary path fragments to your request URL like this:

`http://localhost:3500/v1.0/invoke/mathService/method/api/v1/add`

In case you are invoking `mathService` on a different namespace, you can use the following URL:

`http://localhost:3500/v1.0/invoke/mathService.testing/method/api/v1/add`

In this URL, `testing` is the namespace that `mathService` is running in.

## Next Steps
- [How-To: Invoke and discover services]({{< ref howto-invoke-discover-services.md >}})
