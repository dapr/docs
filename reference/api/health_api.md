# Dapr health API reference

Dapr provides health checking probes that can be used as readiness or liveness of Dapr.

### Get Dapr health state

Gets the health state for Dapr.

#### HTTP Request

```http
GET http://localhost:<daprPort>/v1.0/healthz
```

#### HTTP Response Codes

Code | Description
---- | -----------
200  | dapr is healthy
500  | dapr is not healthy

#### URL Parameters

Parameter | Description
--------- | -----------
daprPort | The Dapr port.

#### Examples

```shell
curl http://localhost:3500/v1.0/healthz
```

