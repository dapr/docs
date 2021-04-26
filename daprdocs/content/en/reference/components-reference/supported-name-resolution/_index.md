---
type: docs
title: "Name resolution component specs"
linkTitle: "Name resolution"
weight: 5000
description: The supported name resolution providers that interface with Dapr
no_list: true
---

Table captions:

> `Status`: [Component certification]({{<ref "certification-lifecycle.md">}}) status
  - [Alpha]({{<ref "certification-lifecycle.md#alpha">}})
  - [Beta]({{<ref "certification-lifecycle.md#beta">}})
  - [GA]({{<ref "certification-lifecycle.md#general-availability-ga">}})
> `Since`: defines from which Dapr Runtime version, the component is in the current status

> `Component version`: defines the version of the component

### Generic

| Name                                                              | Status                       | Component version | Since |
|-------------------------------------------------------------------|------------------------------| ---------------- |-- |
| [HashiCorp Consul]({{< ref setup-consul.md >}}) | Alpha   | v1 | 1.2 |

### Self-Hosted

| Name                                                     | Status | Component version | Since |
|----------------------------------------------------------|--------| -------------------| ---- |
| mDNS | GA  | v1 | 1.0 |

### Kubernetes

| Name                                                     | Status | Component version | Since |
|----------------------------------------------------------|--------| -------------------| ---- |
| Kubernetes | GA  | v1 | 1.0 |
