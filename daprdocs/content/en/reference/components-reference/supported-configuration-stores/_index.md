---
type: docs
title: "Configuration store component specs"
linkTitle: "Configuration stores"
weight: 4500
description: The supported configuration stores that interface with Dapr
aliases:
  - "/operations/components/setup-secret-store/supported-configuration-stores/"
no_list: true
---

Table captions:

> `Status`: [Component certification]({{<ref "certification-lifecycle.md">}}) status
  - [Alpha]({{<ref "certification-lifecycle.md#alpha">}})
  - [Beta]({{<ref "certification-lifecycle.md#beta">}})
  - [Stable]({{<ref "certification-lifecycle.md#stable">}})
> `Since`: defines from which Dapr Runtime version, the component is in the current status

> `Component version`: defines the version of the component

### Generic

| Name                                                              | Status                       | Component version | Since |
|-------------------------------------------------------------------|------------------------------| ---------------- |-- |
| [Redis]({{< ref redis-configuration-store.md >}})                 | Alpha                        | v1 | 1.5 |


