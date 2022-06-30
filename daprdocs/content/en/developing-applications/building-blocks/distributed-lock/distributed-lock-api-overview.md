---
type: docs
title: "Distributed lock overview"
linkTitle: "Overview"
weight: 1000
description: "Overview of the distributed lock API building block"
---

## Introduction
Locks are used to provide mutually exclusive access to a resource. For example, you can use a lock to:

- Provide exclusive access to a database row, table, or an entire database
- Lock reading messages from a queue in a sequential manner

Any resource that is shared where updates occur can be the target for a lock. Locks are usually used on operations that mutate state, not on reads.

Each lock has a name. The application determines the resources that the named lock accesses. Typically, multiple instances of the same application (multiple applications with the same app ID) use this named lock to exclusively access the resource and perform updates. 

For example, in the competing consumer pattern, multiple instances of an application access a queue. You can decide that you want to lock the queue while the application is running its business logic.

In the diagram below, two instances of the same application, `App1`, use the [Redis lock component]({{< ref redis-lock >}}) to take a lock on a shared resource. 

- The first app instance acquires the named lock and gets exclusive access to the resource for updates. 
- The second app instance is unable to acquire the lock and therefore is not allowed to access the resource until the lock is released, either:
   - Explicitly by the application through the unlock API, or 
   - After a period of time, due to a lease timeout. 

<img src="/images/lock-overview.png" width=900>

*This API is currently in `Alpha` state.

## Features

### Mutually exclusive access to a resource
At any given moment, only one application can hold a named lock.

### Deadlock free using leases
Dapr distributed locks use a lease-based locking mechanism. If an application acquires a lock and then encounters an exception and cannot free the lock, the lock is automatically released after a period of time using a lease. This prevents resource deadlocks in the event of application failures.

## Next steps
Follow these guides on:
- [How-To: Use distributed locks in your application]({{< ref howto-use-distributed-lock.md >}})

