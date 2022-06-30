---
type: docs
title: "Distributed lock overview"
linkTitle: "Overview"
weight: 1000
description: "Overview of the distributed lock API building block"
---

## Introduction

<img src="/images/distributed-lock-api-overview.png" width=900>

*This API is currently in `Alpha` state.
## Features

### Mutually exclusive
At any given moment, only one client can hold a lock.

### Deadlock-free
Distributed locks use a lease-based locking mechanism. If a client acquires a lock and then encounters an exception, the lock is automatically released after a period of time. This prevents resource deadlocks.

## Next steps
Follow these guides on:
- [How-To: Use distributed locks in your application]({{< ref howto-use-distributed-lock.md >}})

