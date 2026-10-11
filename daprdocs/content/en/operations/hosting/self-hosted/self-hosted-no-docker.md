---
type: docs
title: "How-To: Run Dapr in self-hosted mode without Docker"
linkTitle: "Run without Docker"
weight: 30000
description: "How to deploy and run Dapr in self-hosted mode without Docker installed on the local machine"
---

## Prerequisites

- [Install the Dapr CLI]({{% ref "install-dapr-selfhost.md#installing-dapr-cli" %}})

## Initialize Dapr without containers

The Dapr CLI provides an option to initialize Dapr using slim init, without the default creation of a development environment with a dependency on Docker. To initialize Dapr with slim init, after installing the Dapr CLI, use the following command:

```bash
dapr init --slim
```

Three binaries are installed:
- `daprd`
- `placement`
- `scheduler`

The `placement` binary is needed to enable [actors]({{% ref "actors-overview.md" %}}) in a Dapr self-hosted installation. The `scheduler` binary is needed for the [Jobs API]({{% ref "jobs-overview.md" %}}), actor reminders, and [workflows]({{% ref "workflow-overview.md" %}}).

`dapr init --slim` does not start the `placement` and `scheduler` binaries. You start them yourself, as shown in the following sections.

In slim init mode, no default components (such as Redis) are installed for state management or pub/sub. This means that, aside from [service invocation]({{% ref "service-invocation-overview.md" %}}), no other building block functionality is available "out-of-the-box" on install. Instead, you can set up your own environment and custom components. 

Actor-based service invocation is possible if a state store is configured, as explained in the following sections.

## Perform service invocation
See [the _Hello Dapr slim_ sample](https://github.com/dapr/samples/tree/master/hello-dapr-slim) for an example on how to perform service invocation in slim init mode.

## Enable state management or pub/sub

See documentation around [configuring Redis in self-hosted mode without Docker](https://redis.io/topics/quickstart) to enable a local state store or pub/sub broker for messaging.

## Enable actors

To enable actors:
- Run the Placement service and the Scheduler service locally.
- Enable a [transactional state store that supports ETags]({{% ref "supported-state-stores.md" %}}) to use actors. For example, [Redis configured in self-hosted mode](https://redis.io/topics/quickstart).

By default, the `placement` and `scheduler` binaries are installed in:

- For Linux/MacOS: `/$HOME/.dapr/bin`
- For Windows: `%USERPROFILE%\.dapr\bin`

The Placement service and the Scheduler service both use port 8080 for the health server and port 9090 for metrics by default. If both use the default ports, the second process stops with the error `bind: address already in use`. Start one of them with `--healthz-port` and `--metrics-port` set to free ports, as in the following commands.

{{< tabpane text=true >}}

{{% tab "Linux/MacOS" %}}

Start the Scheduler service in one terminal:

```bash
$HOME/.dapr/bin/scheduler --etcd-data-dir ./scheduler-data
```

Start the Placement service in a second terminal:

```bash
$HOME/.dapr/bin/placement --healthz-port 8081 --metrics-port 9091
```

{{% /tab %}}

{{% tab "Windows" %}}

When running standalone placement on Windows, specify port 6050:

```bash
%USERPROFILE%/.dapr/bin/placement.exe -port 6050

time="2022-10-17T14:56:55.4055836-05:00" level=info msg="starting Dapr Placement Service -- version 1.9.0 -- commit fdce5f1f1b76012291c888113169aee845f25ef8" instance=LAPTOP-OMK50S19 scope=dapr.placement type=log ver=1.9.0
time="2022-10-17T14:56:55.4066226-05:00" level=info msg="log level set to: info" instance=LAPTOP-OMK50S19 scope=dapr.placement type=log ver=1.9.0
time="2022-10-17T14:56:55.4067306-05:00" level=info msg="metrics server started on :9090/" instance=LAPTOP-OMK50S19 scope=dapr.metrics type=log ver=1.9.0
time="2022-10-17T14:56:55.4077529-05:00" level=info msg="Raft server is starting on 127.0.0.1:8201..." instance=LAPTOP-OMK50S19 scope=dapr.placement.raft type=log ver=1.9.0
time="2022-10-17T14:56:55.4077529-05:00" level=info msg="placement service started on port 6050" instance=LAPTOP-OMK50S19 scope=dapr.placement type=log ver=1.9.0
time="2022-10-17T14:56:55.4082772-05:00" level=info msg="Healthz server is listening on :8080" instance=LAPTOP-OMK50S19 scope=dapr.placement type=log ver=1.9.0
time="2022-10-17T14:56:56.8232286-05:00" level=info msg="cluster leadership acquired" instance=LAPTOP-OMK50S19 scope=dapr.placement type=log ver=1.9.0
time="2022-10-17T14:56:56.8232286-05:00" level=info msg="leader is established." instance=LAPTOP-OMK50S19 scope=dapr.placement type=log ver=1.9.0

```

Start the Scheduler service on port 6060. On Windows, `dapr run` uses this Scheduler port by default. The command also sets health and metrics ports that are different from the Placement service ports:

```bash
%USERPROFILE%/.dapr/bin/scheduler.exe --port 6060 --healthz-port 8081 --metrics-port 9091 --etcd-data-dir ./scheduler-data
```

{{% /tab %}}

{{< /tabpane >}}

Now, to run an application with actors enabled, you can follow the sample example created for:
- [java-sdk](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/actors)
- [python-sdk](https://github.com/dapr/python-sdk/tree/master/examples/demo_actor)
- [dotnet-sdk]({{% ref "dotnet-actors-howto.md" %}}) 

Update the state store configuration files to match the Redis host and password with your setup. 

Enable it as a actor state store by making the metadata piece similar to the [sample Java Redis component](https://github.com/dapr/java-sdk/blob/master/examples/components/state/redis.yaml) definition.

```yaml
  - name: actorStateStore
    value: "true"
```

## Clean up

When finished, remove the binaries by following [Uninstall Dapr in a self-hosted environment]({{% ref self-hosted-uninstall %}}) to remove the binaries.

## Next steps
- Run Dapr with [Podman]({{% ref self-hosted-with-podman.md %}}), using the default [Docker]({{% ref install-dapr-selfhost.md %}}), or in an [airgap environment]({{% ref self-hosted-airgap.md %}})
- [Upgrade Dapr in self-hosted mode]({{% ref self-hosted-upgrade %}})
