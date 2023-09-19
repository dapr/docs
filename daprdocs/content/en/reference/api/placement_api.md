---
type: docs
title: "Placement API reference"
linkTitle: "Placement API"
description: "Detailed documentation on the Placement API"
weight: 1200
---

Dapr has an HTTP API `/placement/state` for placement service that exposes placement table information. The API is exposed on the sidecar on the same port as the healthz. This is an unauthenticated endpoint, and is disabled by default. 

You need to set `DAPR_PLACEMENT_METADATA_ENABLED` environment or `metadata-enabled` command line args to true to enable it. If you are using helm, set `dapr_placement.metadataEnabled` to true.

## Usecase

The placement table API can be used for retrieving the current placement table, which contains all the actors registered. This can be helpful for debugging and allows tools to extract and present information about actors.

## HTTP Request

```
GET http://localhost:<healthzPort>/placement/state
```

## HTTP Response Codes

Code | Description
---- | -----------
200  | Placement tables information returned
500  | Placement could not return the placement tables information

## HTTP Response Body

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

## Examples

```shell
 curl localhost:8080/placement/state
```

```json
{
	"hostList": [{
		"name": "198.18.0.1:49347",
		"appId": "actor",
		"actorTypes": ["testActorType"],
		"updatedAt": 1690274322325260000
	}],
	"tableVersion": 1
}
```