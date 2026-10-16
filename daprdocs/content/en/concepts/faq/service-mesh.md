---
type: docs
title: "Dapr and service meshes"
linkTitle: "Service meshes"
weight: 200
description: >
  How Dapr compares to and works with service meshes
---

Dapr uses a sidecar architecture, running as a separate process alongside the application and includes features such as service invocation, network security, and [distributed tracing](https://middleware.io/blog/what-is-distributed-tracing/). This often raises the question: how does Dapr compare to service mesh solutions such as [Linkerd](https://linkerd.io/), [Istio](https://istio.io/) and [Open Service Mesh](https://openservicemesh.io/) among others?

## How Dapr and service meshes compare
While Dapr and service meshes do offer some overlapping capabilities, **Dapr is not a service mesh**, where a service mesh is defined as a *networking* service mesh. Unlike a service mesh which is focused on networking concerns, Dapr is focused on providing building blocks that make it easier for developers to build applications as microservices. Dapr is developer-centric, versus service meshes which are infrastructure-centric.

In most cases, developers do not need to be aware that the application they are building will be deployed in an environment which includes a service mesh, since a service mesh intercepts network traffic. Service meshes are mostly managed and deployed by system operators, whereas Dapr building block APIs are intended to be used by developers explicitly in their code.

Some common capabilities that Dapr shares with service meshes include:
- Secure service-to-service communication with mTLS encryption
- Service-to-service metric collection
- Service-to-service distributed tracing
- Resiliency through retries

 Importantly, Dapr provides service discovery and invocation via names, which is a developer-centric concern. This means that through Dapr's service invocation API, developers call a method on a service name, whereas service meshes deal with network concepts such as IP addresses and DNS addresses. However, Dapr does not provide capabilities for traffic behavior such as routing or traffic splitting. Traffic routing is often addressed with ingress proxies to an application and does not have to use a service mesh. In addition, Dapr provides other application-level building blocks for state management, pub/sub messaging, actors, and more.

Another difference between Dapr and service meshes is observability (tracing and metrics). Service meshes operate at the network level and trace the network calls between services. Dapr does this with service invocation. Moreover, Dapr also provides observability (tracing and metrics) over pub/sub calls using trace IDs written into the Cloud Events envelope. This means that metrics and tracing with Dapr is more extensive than with a service mesh for applications that use both service-to-service invocation and pub/sub to communicate.

The illustration below captures the overlapping features and unique capabilities that Dapr and service meshes offer:

<img src="/images/service-mesh.png" width=1000>

## Using Dapr with a service mesh
Dapr does work with service meshes. In the case where both are deployed together, both Dapr and service mesh sidecars are running in the application environment. In this case, it is recommended to configure only Dapr or only the service mesh to perform mTLS encryption and distributed tracing.

Watch these recordings from the Dapr community calls showing presentations on running Dapr together with different service meshes:
- General overview and a demo of [Dapr and Linkerd](https://youtu.be/xxU68ewRmz8?t=142)
- Demo of running [Dapr and Istio](https://youtu.be/ngIDOQApx8g?t=335)

### Protocol declarations on Dapr Services in Kubernetes

Every Kubernetes Service that Dapr creates sets the [`appProtocol`](https://kubernetes.io/docs/concepts/services-networking/service/#application-protocol) field on each of its ports. This covers the control plane Services that the Dapr Helm chart installs, and the `<app-id>-dapr` Service that the Dapr operator creates for each Dapr-enabled application. A service mesh such as Istio reads this field to select the protocol of a port, instead of detecting the protocol from the traffic or from the port name.

Ports that carry gRPC inside Dapr mTLS declare `tls`, not `grpc`. Istio treats `appProtocol: grpc` as plaintext HTTP/2 (h2c). If these ports declared `grpc`, the mesh proxy would parse the TLS bytes as HTTP/2 and break the connection.

| Service | Ports | `appProtocol` |
|---------|-------|---------------|
| `<app-id>-dapr` | `dapr-http`, `dapr-metrics` | `http` |
| `<app-id>-dapr` | `dapr-grpc` | `grpc` |
| `<app-id>-dapr` | `dapr-internal` | `tls` when mTLS is enabled in the `daprsystem` Configuration, otherwise `grpc` |
| `dapr-api` | `grpc`, `legacy` | `tls` |
| `dapr-webhook` | webhook port (443) | `https` |
| `dapr-sentry` | `grpc` | `tls` |
| `dapr-sentry` | `oidc` | `https` when `dapr_sentry.oidc.tls.enabled` is `true`, otherwise `http` |
| `dapr-placement-server` | `api`, `raft-node` | `tls` |
| `dapr-scheduler-server` | `api`, `etcd-peer` | `tls` |
| `dapr-scheduler-server` | `etcd-client` | `tcp` |
| `dapr-sidecar-injector` | `https` | `https` |
| All control plane Services | `metrics` | `http` |

{{% alert title="Note" color="primary" %}}
Dapr sets `appProtocol` from version 1.19. On earlier versions the field is not set, and Istio falls back to protocol detection. Some Dapr control plane ports are named `grpc` but carry TLS, so name-based detection can classify them incorrectly on those versions.
{{% /alert %}}

## When to use Dapr or a service mesh or both
Should you be using Dapr, a service mesh, or both? The answer depends on your requirements. If, for example, you are looking to use Dapr for one or more building blocks such as state management or pub/sub, and you are considering using a service mesh just for network security or observability, you may find that Dapr is a good fit and that a service mesh is not required.

Typically you would use a service mesh with Dapr where there is a corporate policy that traffic on the network must be encrypted for all applications. For example, you may be using Dapr in only part of your application, and other services and processes that are not using Dapr in your application also need their traffic encrypted. In this scenario a service mesh is the better option, and most likely you should use mTLS and distributed tracing on the service mesh and disable this on Dapr.

If you need traffic splitting for A/B testing scenarios you would benefit from using a service mesh, since Dapr does not provide these capabilities.

In some cases, where you require capabilities that are unique to both, you will find it useful to leverage both Dapr and a service mesh; as mentioned above, there is no limitation to using them together.
