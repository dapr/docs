---
type: docs
title: "Dapr Placement control plane service overview"
linkTitle: "Placement"
description: "Overview of the Dapr placement service"
---

The Dapr Placement service is used to calculate and distribute distributed hash tables for the location of [Dapr actors]({{< ref actors >}}) running in [self-hosted mode]({{< ref self-hosted >}}) or on [Kubernetes]({{< ref kubernetes >}}). This hash table maps actor IDs to pods or processes so a Dapr application can communicate with the actor.Anytime a Dapr application activates a Dapr actor, the placement updates the hash tables with the latest actor locations.

## Self-hosted mode

The placement service Docker container is started automatically as part of [`dapr init`]({{< ref self-hosted-with-docker.md >}}). It can also be run manually as a process if you are running in [slim-init mode]({{< ref self-hosted-no-docker.md >}}).

## Kubernetes mode

The placement service is deployed as part of `dapr init -k`, or via the Dapr Helm charts. For more information on running Dapr on Kubernetes, visit the [Kubernetes hosting page]({{< ref kubernetes >}}).

## Placement tables

There is an HTTP API `/placement/state` for placement service that exposes the placement table. The API is exposed on the healthz server. Since this is an unauthenticated endpoint, so it is disabled by default, you need to set `DAPR_PLACEMENT_METADATA_ENABLED` environment or `tls-enabled` command line args to true to enable it.

### Usecase:
The placement table API can be used for retrieving the current placement table, which contains all the actors registered. This can be helpful for debugging and also allow other tools (Dashboard) to extract and present for information about Actors.

### HTTP Request

```
GET http://localhost:<healthzPort>/placement/state
```

### HTTP Response Codes

Code | Description
---- | -----------
200  | Placement tables information returned
500  | Placement could not return the placement tables information

### HTTP Response Body

**Placement tables API Response Object**

Name                   | Type                                                                  | Description
----                   | ----                                                                  | -----------
tableVersion           | int                                                                   | The placement table version
hostList               | [Actor Host Info](#actorhostinfo)[]                                   | A json array of registered actors host info.

<a id="actorhostinfo"></a>**Actor Host Info**

Name  | Type    | Description
----  | ----    | -----------
name  | string  | The host:port address of the actor.
appId | string  | app id.
entities | json string array | List of actor types it hosts.
updatedAt | timestamp | Timestamp of the actor registered/updated.

### Examples

```shell
 curl localhost:8080/placement/state
```

```json
{
	"hostList": [{
		"name": "198.18.0.1:49347",
		"appId": "actor",
		"entities": ["testActorType"],
		"updatedAt": 1690274322325260000
	}],
	"tableVersion": 1
}
```
