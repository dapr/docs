---
type: docs
title: "How-To: Run Dapr in self-hosted mode without Docker"
linkTitle: "Run without Docker"
weight: 30000
description: "How to deploy and run Dapr in self-hosted mode without Docker installed on the local machine"
---

This article provides guidance on running Dapr in self-hosted mode without Docker.

## Prerequisites

- [Dapr CLI]({{< ref "install-dapr-selfhost.md#installing-dapr-cli" >}})

## Initialize Dapr without containers

The Dapr CLI provides an option to initialize Dapr using slim init, without the default creation of a development environment which has a dependency on Docker. To initialize Dapr with slim init, after installing the Dapr CLI use the following command:

```bash
dapr init --slim
```

In this mode two different binaries are installed `daprd` and `placement`. The `placement` binary is needed to enable [actors]({{< ref "actors-overview.md" >}}) in a Dapr self-hosted installation.

In this mode no default components such as Redis are installed for state management or pub/sub. This means, that aside from [Service Invocation]({{< ref "service-invocation-overview.md" >}}), no other building block functionality is available on install out of the box. Users are free to setup their own environment and custom components. Furthermore, actor based service invocation is possible if a state store is configured as explained in the following sections.

## Service invocation
See [this sample](https://github.com/dapr/samples/tree/master/hello-dapr-slim) for an example on how to perform service invocation in this mode.

## Enabling state management or pub/sub

See configuring Redis in self-hosted mode [without docker](https://redis.io/topics/quickstart) to enable a local state store or pub/sub broker for messaging.

## Enabling actors

The placement service must be run locally to enable actor placement. Also, a [transactional state store that supports ETags]({{< ref "supported-state-stores.md" >}}) must be enabled to use actors, for example, [Redis configured in self-hosted mode](https://redis.io/topics/quickstart).

By default for Linux/MacOS the `placement` binary is installed in `/$HOME/.dapr/bin` or for Windows at `%USERPROFILE%\.dapr\bin`.

```bash
$ $HOME/.dapr/bin/placement

INFO[0000] starting Dapr Placement Service -- version 1.0.0-rc.1 -- commit 13ae49d  instance=Nicoletaz-L10.redmond.corp.microsoft.com scope=dapr.placement type=log ver=1.0.0-rc.1
INFO[0000] log level set to: info                        instance=Nicoletaz-L10.redmond.corp.microsoft.com scope=dapr.placement type=log ver=1.0.0-rc.1
INFO[0000] metrics server started on :9090/              instance=Nicoletaz-L10.redmond.corp.microsoft.com scope=dapr.metrics type=log ver=1.0.0-rc.1
INFO[0000] Raft server is starting on 127.0.0.1:8201...  instance=Nicoletaz-L10.redmond.corp.microsoft.com scope=dapr.placement.raft type=log ver=1.0.0-rc.1
INFO[0000] placement service started on port 50005       instance=Nicoletaz-L10.redmond.corp.microsoft.com scope=dapr.placement type=log ver=1.0.0-rc.1
INFO[0000] Healthz server is listening on :8080          instance=Nicoletaz-L10.redmond.corp.microsoft.com scope=dapr.placement type=log ver=1.0.0-rc.1
INFO[0001] cluster leadership acquired                   instance=Nicoletaz-L10.redmond.corp.microsoft.com scope=dapr.placement type=log ver=1.0.0-rc.1
INFO[0001] leader is established.                        instance=Nicoletaz-L10.redmond.corp.microsoft.com scope=dapr.placement type=log ver=1.0.0-rc.1

```

From here on you can follow the sample example created for the [java-sdk](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/actors), [python-sdk](https://github.com/dapr/python-sdk/tree/master/examples/demo_actor) or [dotnet-sdk]({{< ref "dotnet-actors-howto.md" >}}) for running an application with Actors enabled.

Update the state store configuration files to have the Redis host and password match the setup that you have. Additionally to enable it as a actor state store have the metadata piece added similar to the [sample Java Redis component](https://github.com/dapr/java-sdk/blob/master/examples/components/state/redis.yaml) definition.

```yaml
  - name: actorStateStore
    value: "true"
```


## Cleanup

Follow the uninstall [instructions]({{< ref "install-dapr-selfhost.md#uninstall-dapr-in-a-self-hosted-mode" >}}) to remove the binaries.
