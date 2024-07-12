---
type: docs
title: "How-to: Persist Scheduler Jobs"
linkTitle: "How-to: Persist Scheduler Jobs"
weight: 50000
description: "Configure Scheduler to persist its database to make it resilient to restarts"
---

The [Scheduler]({{< ref scheduler.md >}}) service is responsible for writing Jobs to its embedded database and scheduling them for execution.
By default, the Scheduler service database writes this data to an in-memory ephemeral tempfs volume, meaning that this **data is not persisted across restarts**.
**Job data will be lost during these events**.

To make the Scheduler data resilient to restarts, a persistent volume must be mounted to the Scheduler container.
This volume may already exist, else a new local volume will be created instead.

> If Dapr is already installed, the control plane will need to be completely [uninstalled]({{< ref dapr-uninstall.md >}}) in order for the Scheduler container to be recreated with the new persistent volume.

```bash
    dapr init --scheduler-volume my-scheduler-volume
```
