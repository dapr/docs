---
type: docs
title: "Health API reference"
linkTitle: "Health API"
description: "Detailed documentation on the health API"
weight: 1000
---

Dapr provides health checking probes that can be used as readiness or liveness of Dapr and for initialization readiness from SDKs. 

## Get Dapr health state

Gets the health state for Dapr by either:
- Check for sidecar health
- Check for the sidecar health, including component readiness, used during initialization.

### Wait for Dapr HTTP port to become available

Wait for all components to be initialized, the Dapr HTTP port to be available _and_ the app channel is initialized. For example, this endpoint is used with Kubernetes liveness probes.

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

Wait for all components to be initialized, the Dapr HTTP port to be available, however the app channel is not yet established. This endpoint enables your application to perform calls on the Dapr sidecar APIs before the app channel is initalized, for example reading secrets with the secrets API. For example used in the Dapr SDKs `waitForSidecar` method (for example .NET and Java SDKs) to check sidecar is initialized correctly ready for any calls.

For example, the [Java SDK]({{< ref "java-client.md#wait-for-sidecar" >}}) and [the .NET SDK]({{< ref "dotnet-client.md#wait-for-sidecar" >}}) uses this endpoint for initialization. 

Currently, the `v1.0/healthz/outbound` endpoint is supported in the:
- [.NET SDK]({{< ref "dotnet-client.md#wait-for-sidecar" >}})
- [Java SDK]({{< ref "java-client.md#wait-for-sidecar" >}})
- [Python SDK]({{< ref "python-client.md#health-timeout" >}})
- [JavaScript SDK](https://github.com/dapr/js-sdk/blob/4189a3d2ad6897406abd766f4ccbf2300c8f8852/src/interfaces/Client/IClientHealth.ts#L14)

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
