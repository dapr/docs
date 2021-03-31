---
type: docs
title: "Dapr & service meshes"
linkTitle: "Service meshes"
weight: 700
description: >
  How Dapr compares to, and works with service meshes
---

Dapr uses the sidecar architecture, running as a separate process alongside the application and includes features such as network security and distributed tracing. This often raises the question - how does Dapr compares to service mesh solutions such as Linkerd and Istio?

## How Dapr and service meshes compare
While Dapr and service meshes do offer some overlapping capabilities, **Dapr is not a service mesh**. Unlike a service mesh which is focused on networking concerns, Dapr is focused on providing building blocks that make it easier for developers to build microservices. Dapr is developer-centric versus service meshes being infrastructure-centric. 

In most cases, developers do not need to be aware that the application they are building will be deployed in an environment which includes a service mesh since a service mesh intercepts network traffic. Service meshes are mostly managed and deployed by system operators. However, Dapr building block APIs are very much intended to be used by developers explicitly in their code.

Some common capabilities Dapr shares with service meshes include:
- Secure service-to-service communication through mTLS encryption
- Metric collection
- Distributed tracing
- Resiliency through retries

However, Dapr does not provide capabilities for traffic behavior such as routing or traffic splitting. Dapr does provide application level building blocks for state management, pub/sub messaging, actors and more.

The illustration below captures some of the overlapping features and unique capabilities Dapr and service meshes offer:

<img src="/images/service-mesh.png" width=1000>

## Using Dapr together with a service mesh
Dapr can work well with service meshes. In the case where both are deployed together, both a Dapr and service mesh sidecar will be running in the application environment. In those cases, it is recommended to ensure only Dapr or only the service mesh perform mTLS encryption and distributed tracing.

Watch these recordings from the Dapr community calls showing presentations on running Dapr together with service meshes:
- General overview and a demo of [Dapr and Linkerd](https://youtu.be/xxU68ewRmz8?t=142)
- Demo of running [Dapr and Istio](https://youtu.be/ngIDOQApx8g?t=335)

## When to choose using Dapr, a service mesh or both
Should you be using Dapr, a service mesh or both? The answer depends on your requirements. If, for example, you are looking to use Dapr for one or more building blocks such as state management or pub/sub and considering using a service mesh just for network security or observability, you may find that Dapr is a good fit and a service mesh is not required.

If however, you need advanced, fine grained networking control, you would probably benefit from using a service mesh. 

In some cases, where you require capabilities that are unique to both you will find it useful to leverage both Dapr and a service mesh - as mentioned above, there is no limitation for using both.
