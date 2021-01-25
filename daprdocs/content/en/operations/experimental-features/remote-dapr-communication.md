---
type: docs
title: "Deploy and run Dapr with a remote application"
linkTitle: "Connecting to remote application"
weight: 2000
description: "How to get Dapr up and running with a remote application"
---

{{% alert title="Network Based communication" color="warning" %}}
When Dapr is deployed in this fashion, it is breaking away from a sidecar based local communication architecture. Hence the calls from `daprd` container to the application and vice versa will be over a network. Since it is over a network, without proper encrytion of the channel between the `daprd` container and the application or proper isolation of the network, it will be possible to intercept the communication between them. This feature is not suitable for a zero-trust network. The application and daprd process needs to be run in a trusted environment or there needs to be options for another application encrypting/decrypting the communication or hardware based encryption should be avaiable. 
{{% /alert %}}

This is an experimental feature in Dapr, which allows `daprd` container, which is usually a sidecar to a running application, to consider a remote application as the application to communicate with. This opens up the possibility of a Dapr enabled application to run completely separately from the `daprd` sidecar container. Similar to the sidecar scenario where a local channel is opened between the application and the Dapr sidecar for communication, in this case, an over the network channel is opened up between the running application and the `daprd` container.

This is enabled through the use of an annotation for Dapr in Kubernetes and through the use of an environment variable for Dapr running in self-hosted mode. 

## Running in Kubernetes

The annotation `dapr.io/app-host` is used to signify the IP address/DNS hostname of the application that `daprd` container needs to connect to. Since Dapr is based off of a sidecar based architecture and this is an addition on top of it, Dapr will still run with a blank app which will not communicate with Dapr but rather facilitate the injection of Dapr sidecar and the other normal Dapr operations. Dapr sidecar when this annotation is given will consider the application pointed to by the `app-host` configuration to be the Dapr enabled application. 

```yml
  annotations:
    dapr.io/enabled: "true"
    dapr.io/app-id: "nodeapp"
    dapr.io/app-port: "3000"
    dapr.io/app-host: <REMOTE_APP>
    dapr.io/config: "tracing"
```

> The `<REMOTE_APP>` can be either an IP address or a resolvable DNS hostname.

## Running in self-hosted mode

The environment variable `APPLICATION_HOST` is used to signify the IP address/DNS hostname of the application that `daprd` container needs to connect to in a self-hosted environment. Once the environment variable is set, a simple dapr run without the actual `application` run command can be used to start `daprd` process to connect to a remote running Dapr enabled application. Example:

```bash
export APPLICATION_HOST="<REMOTE_APP>"
dapr run --app-id testapp --app-port 3000
```

> The `<REMOTE_APP>` can be either an IP address or a resolvable DNS hostname.
