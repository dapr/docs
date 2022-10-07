---
type: docs
title: "Pluggable components overview"
linkTitle: "Overview"
weight: 4500
description: "Overview of gRPC pluggable components."
---

With pluggable components, Dapr can be extended to use external components that are not natively supported by the Dapr runtime [(supported Dapr components)](https://docs.dapr.io/operations/components/). The external components can leverage existing Dapr building block APIs but are configured differently from built-in Dapr components found in the [Components Contrib repository ](https://github.com/dapr/components-contrib)

<img src="/images/concepts-building-blocks.png" width=400> 


## Pluggable components vs. Built-in components

Dapr provides two pathways for creating new components -- the pluggable component route, or the same route used to create Built-in components found in Dapr's [Components Contrib repository ](https://github.com/dapr/components-contrib). Both options result in components that can leverage Dapr's building block APIs but each have different implementation processes.


|Component details |[Built-in Component](https://github.com/dapr/components-contrib/blob/master/docs/developing-component.md)| Pluggable Components|
|--------------------|:--------|:-----------------------|
| **Language** |Can only be written in Go | [Can be written in any gRPC-supported language](https://grpc.io/docs/what-is-grpc/introduction/#:~:text=Protocol%20buffer%20versions,-While%20protocol%20buffers&text=Proto3%20is%20currently%20available%20in,with%20more%20languages%20in%20development.)   | 
| **Where it runs** |As part of the Dapr executable itself   | As distinct process, container or pod. Runs seperate from Dapr itself | 
| **Integration with Dapr** | Integrated directly into Dapr codebase | Integrates with Dapr via Unix Domain Sockets (using gRPC ) | 
| **Hosting**|Hosted in Dapr repository| Hosted in your own repository | 
| **Distribution**|Distributed with Dapr release (i.e., new features added to component need to be aligned with Dapr releases |Distributed independently from Dapr itself (i.e., new features can be added *whenever* and follow your release cycle).  | 
| **How component is started**|Dapr starts component (automatic) |  User starts component (manual) | 



## When to create a pluggable component
* There are homegrown components you want to use with Dapr APIs and those homegrown cannot be contributed to the project.
* You want to keep your component seperate from the Dapr release process.
* You are not as familiar with Go, or implementing your component in Go is not ideal.


## How pluggable components integrate with Dapr


<img src="/images/pluggable-component-process.png" width=400>

Pluggable components are automatically discovered by creating sockets in a shared volume. The process is the following:
1. The Component listens to an [UDS](https://en.wikipedia.org/wiki/Unix_domain_socket) placed on the shared volume.
2. The Dapr runtime lists all [UDS](https://en.wikipedia.org/wiki/Unix_domain_socket) in the shared volume.
3. The Dapr runtime connects with the socket and uses gRPC reflection to discover all services that such component implements.

A single component can implement multiple [building blocks](http://localhost:1313/concepts/building-blocks-concept/) at once.
[gRPC-based](https://grpc.io/) Dapr components are typically run as containers or processes that communicate with the Dapr main process via [Unix Domain Sockets](https://en.wikipedia.org/wiki/Unix_domain_socket).

## Next Steps
- Developing gRPC Components
- Using gRPC components
