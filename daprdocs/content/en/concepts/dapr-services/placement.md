---
type: docs
title: "Dapr Placement control plane service overview"
linkTitle: "Placement"
description: "Overview of the Dapr Placement service"
---

{{% alert title="Deprecation notice" color="warning" %}}
Starting with Dapr v1.19, actor placement can be served by the [Scheduler service]({{% ref scheduler %}}), enabled by the opt-in flag `global.scheduler.placement.enabled=true` (`false` by default). The standalone Placement service is planned for deprecation in Dapr v1.21, when the Scheduler serves actor placement by default.
{{% /alert %}}

The Dapr Placement service is used to calculate and distribute distributed hash tables for the location of [Dapr actors]({{% ref actors %}}) running in [self-hosted mode]({{% ref self-hosted %}}) or on [Kubernetes]({{% ref kubernetes %}}). Grouped by namespace, the hash tables map actor types to pods or processes so a Dapr application can communicate with the actor. Anytime a Dapr application activates a Dapr actor, the Placement service updates the hash tables with the latest actor location.

## Self-hosted mode

The Placement service Docker container is started automatically as part of [`dapr init`]({{% ref self-hosted-with-docker %}}), unless you initialize with `dapr init --scheduler-placement`, which has the [Scheduler service serve actor placement](#serving-placement-from-the-scheduler-service) instead. It can also be run manually as a process if you are running in [slim-init mode]({{% ref self-hosted-no-docker %}}).

## Kubernetes mode

The Placement service is deployed as part of `dapr init -k`, or via the Dapr Helm charts. You can run Placement in high availability (HA) mode. [Learn more about setting HA mode in your Kubernetes service.]({{% ref "kubernetes-production#individual-service-ha-helm-configuration" %}})

Alternatively, actor placement can be served by the [Scheduler service]({{% ref scheduler %}}) instead of the standalone Placement service. See [Serving placement from the Scheduler service](#serving-placement-from-the-scheduler-service).

For more information on running Dapr on Kubernetes, visit the [Kubernetes hosting page]({{% ref kubernetes %}}).

## Serving placement from the Scheduler service

The Scheduler service can serve actor placement itself, so the standalone Placement service does not run.

In Kubernetes mode, set the Helm value:

```
global.scheduler.placement.enabled=true
```

With this setting, the Placement StatefulSet is not deployed and the Scheduler runs with `--placement-enabled=true`.

In self-hosted mode, initialize Dapr with `dapr init --scheduler-placement` (requires Dapr 1.19 or later). The Placement container is not started, and the CLI starts the Scheduler container with `--placement-enabled=true` for you. No further configuration is needed. Only in [slim-init mode]({{% ref self-hosted-no-docker %}}), where you start the binaries yourself, the flag skips installing the Placement binary and you pass `--placement-enabled=true` when running the Scheduler binary. Applications and sidecars need no configuration of their own: each sidecar takes actor placement from whichever service the control plane advertises, so the cluster always has exactly one placement authority. Toggling the setting in either direction requires no sidecar restarts.

The two services place actors with different algorithms: the Placement service uses a consistent hash ring, while the Scheduler uses rendezvous hashing. Both give the same guarantees (every sidecar deterministically agrees on a single host for each actor ID, and ownership spreads across hosts), but the resulting actor-to-host assignments differ. Switching the placement authority in either direction therefore reassigns actors once: affected actors are deactivated and reactivate on their new hosts with their state intact, as in any actor rebalance.

{{% alert title="Important" color="warning" %}}
Complete your Dapr version rollout before enabling this setting. Sidecars running an older Dapr version can only use the Placement service: with it undeployed, their Actor and Workflow APIs stall until the pod is upgraded to a version that supports scheduler placement. No actor state is lost. The Scheduler also withholds serving placement while any connected sidecar runs an older Dapr version, keeping a single placement authority throughout the rollout.
{{% /alert %}}

The [`/placement/state` API](#placement-tables) is only available from the standalone Placement service and is not served by the Scheduler.

## Placement tables

There is an [HTTP API `/placement/state` for Placement service]({{% ref placement_api %}}) that exposes placement table information. The API is exposed on the sidecar on the same port as the healthz. This is an unauthenticated endpoint, and is disabled by default. You need to set `DAPR_PLACEMENT_METADATA_ENABLED` environment or `metadata-enabled` command line args to true to enable it. If you are using helm you just need to set `dapr_placement.metadataEnabled` to true.

{{% alert title="Important" color="warning" %}}
When deploying actors into different namespaces ({{% ref namespaced-actors %}}), it is recommended to disable the `metadata-enabled` if you want to prevent retrieving actors from all namespaces. The metadata endpoint is scoped to all namespaces.
{{% /alert %}}

### Usecase:
The placement table API can be used to retrieve the current placement table, which contains all the actors registered across all namespaces. This is helpful for debugging and allowing tools to extract and present information about actors.

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

## Disabling the Placement service


The Placement service can be disabled with the following setting:


```
global.actors.enabled=false
```

The Placement service is not deployed with this setting in Kubernetes mode. This not only disables actor deployment, but also disables workflows, given that workflows use actors. This setting only applies in Kubernetes mode, however initializing Dapr with `--slim` excludes the Placement service from being deployed in self-hosted mode. 

The Placement service is also not deployed when actor placement is served by the Scheduler service (`global.scheduler.placement.enabled=true`). Actors and workflows keep working in that case. See [Serving placement from the Scheduler service](#serving-placement-from-the-scheduler-service).


For more information on running Dapr on Kubernetes, visit the [Kubernetes hosting page](https://docs.dapr.io/operations/hosting/kubernetes/).

## Related links

[Learn more about the Placement API.]({{% ref placement_api %}})
