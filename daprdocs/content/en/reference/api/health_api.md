---
type: docs
title: "Health API reference"
linkTitle: "Health API"
description: "Detailed documentation on the health API"
weight: 1000
---

Dapr provides health checking probes that can be used as readiness or liveness of Dapr. 

## Get Dapr health state

Gets the health state for Dapr by either:
- Waiting for a specific health check against `v1.0/healthz/outbound`; or
- Waiting for the Dapr HTTP port to become available

### Wait for Dapr HTTP port to become available

With this behavior, Dapr waits for the Dapr HTTP port to become available to 

#### HTTP Request

```
GET http://localhost:<daprPort>/v1.0/healthz
```

#### HTTP Response Codes

Code | Description
---- | -----------
204  | Dapr is healthy
500  | Dapr is not healthy

#### URL Parameters

Parameter | Description
--------- | -----------
daprPort | The Dapr port

#### Examples

```shell
curl -i http://localhost:3500/v1.0/healthz
```

### Wait for specific health check against `/outbound` path

With this behavior, Dapr waits for a successful response from `v1.0/healthz/outbound`, rather than waiting for the Dapr HTTP port to be available. This provides a more explict implementation that is better isolated from accidental change.

For example, [in the .NET SDK,](https://github.com/dapr/dotnet-sdk/blob/17f849b17505b9a61be1e7bd3e69586718b9fdd3/src/Dapr.Client/DaprClientGrpc.cs#L1758-L1785) if the ordering of a Dapr runtime init ever changed (accidentally or deliberately), and the Dapr HTTP port was open _before_ all components were initialized, this would cause a break in behavior.

#### HTTP Request

```
GET http://localhost:<daprPort>/v1.0/healthz/outbound
```

#### HTTP Response Codes

Code | Description
---- | -----------
204  | Dapr is healthy
500  | Dapr is not healthy

#### URL Parameters

Parameter | Description
--------- | -----------
daprPort | The Dapr port
 
#### Examples

```shell
curl -i http://localhost:3500/v1.0/healthz/outbound
```

## Related articles

- [Sidecar health]({{< ref "sidecar-health.md" >}})
- [App health]({{< ref "app-health.md" >}})