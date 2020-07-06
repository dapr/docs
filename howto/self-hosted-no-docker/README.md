# Self hosted mode without Docker
This article provides guidance on running Dapr in self-hosted mode without Docker. 

## Prerequisites
- [Dapr CLI](../../getting-started/environment-setup.md#installing-dapr-cli)

## Initialize Dapr without docker
Dapr CLI provide command line arguments to initialize Dapr [without dependency](../../getting-started/environment-setup.md#Install-Dapr-runtime-using-the-CLI-(without-docker)) on Docker. 

In this mode two different binaries are installed `daprd` and `placement`. The `placement` binary is needed to enable [actors](../../concepts/actors/README.md) in Dapr. 

In this mode only limited functionality of Dapr is available out of box. Namely [Service Invocation](../../concepts/service-invocation/README.md) and Actor based Service Invocation.

## Service Invocation
Samples [repo](https://github.com/dapr/samples/tree/master/11.hello-dapr-slim) has a complete sample on how to perform service invocation in this mode. 

## Enabling Statestore

See configuring Redis in self hosted mode [without docker](../../howto/configure-redis/README.md) to enable state store. 

## Enabling Actors

Run the Placement service locally to enable actor placement. Also a [transactoinal state store](#Enabling-Statestore) must be enabled for actors. 

By default for Linux/MacOS the `placement` binary is installed in `/usr/local/bin` or for Windows at `c:\dapr`.

```bash
$ placement

INFO[0000] starting Dapr Placement Service -- version 0.8.0 -- commit 74db927  instance=host.localhost.name scope=dapr.placement type=log ver=0.8.0
INFO[0000] log level set to: info                        instance=host.localhost.name scope=dapr.placement type=log ver=0.8.0
INFO[0000] metrics server started on :9090/              instance=host.localhost.name scope=dapr.metrics type=log ver=0.8.0
INFO[0000] placement Service started on port 50005       instance=host.localhost.name scope=dapr.placement type=log ver=0.8.0
INFO[0000] Healthz server is listening on :8080          instance=host.localhost.name scope=dapr.placement type=log ver=0.8.0

```

From here on you can follow the sample example created for the [java-sdk](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/actors/http) for running an application with Actors enabled. 

Update the [Redis component](https://github.com/dapr/java-sdk/blob/master/examples/components/redis.yaml) host and password to match the statestore setup that you have.

The logs of the Placement service are updated whenever a host that uses actors is added or removed similar to the following output: 

```
INFO[0446] host added: 192.168.1.6                       instance=host.localhost.name scope=dapr.placement type=log ver=0.8.0
INFO[0450] host removed: 192.168.1.6                     instance=host.localhost.name scope=dapr.placement type=log ver=0.8.0
```

## Cleanup

Follow the uninstall [instructions](../../getting-started/environment-setup.md#Uninstall-Dapr-in-self-hosted-mode-(without-docker)) to remove the binaries.
