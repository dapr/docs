---
type: docs
title: "How-to: Persist Scheduler Jobs"
linkTitle: "How-to: Persist Scheduler Jobs"
weight: 50000
description: "Configure Scheduler to persist its database to make it resilient to restarts"
---

The [Scheduler]({{< ref scheduler.md >}}) service is responsible for writing jobs to its embedded database and scheduling them for execution.
By default, the Scheduler service database writes this data to the local volume `dapr_scheduler`, meaning that **this data is persisted across restarts**.

The Scheduler persistent volume can be modified with a custom volume that is pre-existing, or will be created by Dapr.

{{% alert title="Note" color="primary" %}}
If Dapr is already installed, the control plane needs to be completely [uninstalled]({{< ref dapr-uninstall.md >}}) in order for the Scheduler container to be recreated with the new persistent volume.
{{% /alert %}}

```bash
dapr init --scheduler-volume my-scheduler-volume
```
