---
type: docs
title: "Placement API reference"
linkTitle: "Placement API"
description: "Detailed documentation on the Placement API"
weight: 1200
---

Dapr has an HTTP API `/placement/state` for Placement service that exposes placement table information. The API is exposed on the sidecar on the same port as the healthz. This is an unauthenticated endpoint, and is disabled by default. 

To enable the placement metadata in self-hosted mode you can either set`DAPR_PLACEMENT_METADATA_ENABLED` environment variable or `metadata-enabled` command line args on the Placement service to `true` to. See [how to run the Placement service in self-hosted mode]({{< ref "self-hosted-no-docker.md#enable-actors" >}}).

{{% alert title="Important" color="warning" %}}
When running placement in [multi-tenant mode]({{< ref namespaced-actors.md >}}), disable the `metadata-enabled` command line args to prevent different namespaces from seeing each other's data.
{{% /alert %}}

If you are using Helm for deployment of the Placement service on Kubernetes then to enable the placement metadata, set `dapr_placement.metadataEnabled` to `true`.

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
            "namespace": "ns1",
            "appId": "actor1",
            "actorTypes": ["testActorType1", "testActorType3"],
            "updatedAt": 1690274322325260000
        },
        {
            "name": "198.18.0.2:49347",
            "namespace": "ns2",
            "appId": "actor2",
            "actorTypes": ["testActorType2"],
            "updatedAt": 1690274322325260000
        },
        {
            "name": "198.18.0.3:49347",
            "namespace": "ns2",
            "appId": "actor2",
            "actorTypes": ["testActorType2"],
            "updatedAt": 1690274322325260000
        }
    ],
    "tableVersion": 1
}
```