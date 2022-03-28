---
type: docs
title: "Name resolution provider component specs"
linkTitle: "Name resolution"
weight: 5000
description: The supported name resolution providers that interface with Dapr service invocation
no_list: true
---

The following components provide name resolution for the service invocation building block.

Table captions:

> `Status`: [Component certification]({{<ref "certification-lifecycle.md">}}) status
  - [Alpha]({{<ref "certification-lifecycle.md#alpha">}})
  - [Beta]({{<ref "certification-lifecycle.md#beta">}})
  - [Stable]({{<ref "certification-lifecycle.md#stable">}})
> `Since`: defines from which Dapr Runtime version, the component is in the current status

> `Component version`: defines the version of the component

### Generic

| Name                                            | Status  | Component version | Since |
|-------------------------------------------------|:-------:|:-----------------:|:-----:|
| [HashiCorp Consul]({{< ref setup-nr-consul.md >}}) | Alpha   | v1                | 1.2   |

### Self-Hosted

| Name | Status | Component version | Since |
|------|:------:|:-----------------:|:-----:|
| [mDNS]({{< ref nr-mdns.md >}}) | Stable| v1 | 1.0 |

### Kubernetes

| Name       | Status | Component version | Since |
|------------|:------:|:-----------------:|:-----:|
| [Kubernetes]({{< ref nr-kubernetes.md >}}) | Stable| v1 | 1.0 |
