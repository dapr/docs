# Self hosted mode without containers

This article provides guidance on running Dapr in self-hosted mode without Docker.

## Prerequisites

- [Dapr CLI](../../getting-started/environment-setup.md#installing-dapr-cli)

## Initialize Dapr without containers

The Dapr CLI provides an option to initialize Dapr using slim init, without the default creation of a development environment which has a dependency on Docker. To initialize Dapr with slim init, after installing the Dapr CLI use the following command:

```bash
dapr init --slim
```

In this mode two different binaries are installed `daprd` and `placement`. The `placement` binary is needed to enable [actors](../../concepts/actors/README.md) in a Dapr self-hosted installation. 

In this mode no default components such as Redis are installed for state managment or pub/sub. This means, that aside from [Service Invocation](../../concepts/service-invocation/README.md), no other building block functionality is availble on install out of the box. Users are free to setup their own environemnt and custom components. Furthermore, actor based service invocation is possible if a statestore is configured as explained in the following sections.

## Service invocation
See [this sample](https://github.com/dapr/samples/tree/master/11.hello-dapr-slim) for an example on how to perform service invocation in this mode. 

## Enabling state management or pub/sub

See configuring Redis in self hosted mode [without docker](../../howto/configure-redis/README.md#Self-Hosted-Mode-without-Containers) to enable a local state store or pub/sub broker for messaging. 

## Enabling actors

The placement service must be run locally to enable actor placement. Also a [transactoinal state store](#Enabling-state-management-or-pub/sub) must be enabled for actors. 

By default for Linux/MacOS the `placement` binary is installed in `/usr/local/bin` or for Windows at `c:\dapr`.

```bash
$ /usr/local/bin/placement

INFO[0000] starting Dapr Placement Service -- version 0.8.0 -- commit 74db927  instance=host.localhost.name scope=dapr.placement type=log ver=0.8.0
INFO[0000] log level set to: info                        instance=host.localhost.name scope=dapr.placement type=log ver=0.8.0
INFO[0000] metrics server started on :9090/              instance=host.localhost.name scope=dapr.metrics type=log ver=0.8.0
INFO[0000] placement Service started on port 50005       instance=host.localhost.name scope=dapr.placement type=log ver=0.8.0
INFO[0000] Healthz server is listening on :8080          instance=host.localhost.name scope=dapr.placement type=log ver=0.8.0

```

From here on you can follow the sample example created for the [java-sdk](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/actors/http), [python-sdk](https://github.com/dapr/python-sdk/tree/master/examples/demo_actor) or [dotnet-sdk](https://github.com/dapr/dotnet-sdk/tree/master/samples/Actor) for running an application with Actors enabled. 

Update the state store configuration files to have the Redis host and password match the setup that you have. Additionally to enable it as a actor state store have the metadata piece added similar to the [sample Java Redis component](https://github.com/dapr/java-sdk/blob/master/examples/components/redis.yaml) definition.

```yaml
  - name: actorStateStore
    value: "true"
```

The logs of the placement service are updated whenever a host that uses actors is added or removed similar to the following output: 

```
INFO[0446] host added: 192.168.1.6                       instance=host.localhost.name scope=dapr.placement type=log ver=0.8.0
INFO[0450] host removed: 192.168.1.6                     instance=host.localhost.name scope=dapr.placement type=log ver=0.8.0
```

## Cleanup

Follow the uninstall [instructions](../../getting-started/environment-setup.md#Uninstall-Dapr-in-self-hosted-mode-(without-docker)) to remove the binaries.
