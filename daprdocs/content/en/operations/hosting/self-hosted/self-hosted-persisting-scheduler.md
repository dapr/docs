---
type: docs
title: "How-to: Persist Scheduler Jobs"
linkTitle: "How-to: Persist Scheduler Jobs"
weight: 50000
description: "Configure Scheduler to persist its database to make it resilient to restarts"
---

The [Scheduler]({{< ref scheduler.md >}}) service is responsible for writing jobs to its embedded database and scheduling them for execution.
By default, the Scheduler service database writes this data to the local volume `dapr_scheduler`, meaning that **this data is persisted across restarts**.

The host file location for this local volume is typically located at either `/var/lib/docker/volumes/dapr_scheduler/_data` or `~/.local/share/containers/storage/volumes/dapr_scheduler/_data`, depending on your container runtime.
Note that if you are using Docker Desktop, this volume is located in the Docker Desktop VM's filesystem, which can be accessed using:

```bash
docker run -it --privileged --pid=host debian nsenter -t 1 -m -u -n -i sh
```

The Scheduler persistent volume can be modified with a custom volume that is pre-existing, or is created by Dapr.

{{% alert title="Note" color="primary" %}}
By default `dapr init` creates a local persistent volume on your drive called `dapr_scheduler`. If Dapr is already installed, the control plane needs to be completely [uninstalled]({{< ref dapr-uninstall.md >}}) in order for the Scheduler container to be recreated with the new persistent volume.
{{% /alert %}}

```bash
dapr init --scheduler-volume my-scheduler-volume
```
