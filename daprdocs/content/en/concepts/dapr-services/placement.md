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

There is an [HTTP API `/placement/state` for placement service]({{< ref placement_api.md >}}) that exposes placement table information. The API is exposed on the sidecar on the same port as the healthz. This is an unauthenticated endpoint, and is disabled by default. You need to set `DAPR_PLACEMENT_METADATA_ENABLED` environment or `metadata-enabled` command line args to true to enable it. If you are using helm you just need to set `dapr_placement.metadataEnabled` to true.

### Usecase:
The placement table API can be used for retrieving the current placement table, which contains all the actors registered. This can be helpful for debugging and allows tools to extract and present information about actors.

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
actorTypes | json string array | List of actor types it hosts.
updatedAt | timestamp | Timestamp of the actor registered/updated.

### Examples

```shell
 curl localhost:8080/placement/state
```

```json
{
	"hostList": [{
			"name": "198.18.0.1:49347",
			"appId": "actor1",
			"actorTypes": ["testActorType1", "testActorType3"],
			"updatedAt": 1690274322325260000
		},
		{
			"name": "198.18.0.2:49347",
			"appId": "actor2",
			"actorTypes": ["testActorType2"],
			"updatedAt": 1690274322325260000
		},
		{
			"name": "198.18.0.3:49347",
			"appId": "actor2",
			"actorTypes": ["testActorType2"],
			"updatedAt": 1690274322325260000
		}
	],
	"tableVersion": 1
}
```

## Related links

[Learn more about the Placement API.]({{< ref placement_api.md >}})