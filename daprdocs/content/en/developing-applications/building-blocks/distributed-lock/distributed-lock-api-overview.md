---
type: docs
title: "Distributed lock overview"
linkTitle: "Overview"
weight: 1000
description: "Overview of the distributed lock API building block"
---

## Introduction
Locks are used to provide mutually exclusive access to a resource. For example, you can use a lock to provide exclusive access to a row in a table, a table or even an entire database. Or a lock could be used to lock reading message from a queue in a sequential manner. A lock has a name and it is up to the application to determine the resources that this named lock accesses. Typically you have multiple instance of the same application (multiple applications with the same app ID) which use this named lock to exclusively access the resource to perform updates. Locks are not normally used on reads, only on operations that mutate state.

The diagram belows shows an example of two instances of the same application, `App1`, using the [Redis lock component]({{< ref redis-lock >}}) to take a lock on a shared resource. The first app intance acquires the named lock, and gets exclusive access to the resource for updates. The second app instance is unable to aquire the lock and therefore is not allowed to access the resource, until the lock is released, either explicitly by the application or is released after a period of time, due to a lease timeout. 

<img src="/images/lock-overview.png" width=900>

*This API is currently in `Alpha` state.

## Features

### Mutually exclusive access to a resource
At any given moment, only one application can hold a named lock.

### Deadlock free using leases
Dapr distributed locks use a lease-based locking mechanism. If an application acquires a lock and then encounters an exception and cannot free the lock, the lock is automatically released after a period of time using a lease. This prevents resource deadlocks in the even of application failures.

## Next steps
Follow these guides on:
- [How-To: Use distributed locks in your application]({{< ref howto-use-distributed-lock.md >}})

