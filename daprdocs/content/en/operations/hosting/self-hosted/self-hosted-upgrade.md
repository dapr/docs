---
type: docs
title: "Steps to upgrade Dapr in a self-hosted environment"
linkTitle: "Upgrade Dapr"
weight: 50000
description: "Follow these steps to upgrade Dapr in self-hosted mode and ensure a smooth upgrade"
---


1. Uninstall the current Dapr deployment:

   {{% alert title="Note" color="warning" %}}
   This will remove the default `$HOME/.dapr` directory, binaries and all containers (dapr_redis, dapr_placement, dapr_scheduler and dapr_zipkin), and the dapr_scheduler volume. Linux users need to run `sudo` if    docker command needs sudo.
   {{% /alert %}}

   ```bash
   dapr uninstall --all
   ```

1. Download and install the latest CLI by visiting [this guide]({{% ref install-dapr-cli.md %}}).

1. Initialize the Dapr runtime. Use the full version: a short form such as `1.19` does not resolve.

   ```bash
   dapr init --runtime-version={{% dapr-latest-version long="true" %}}
   ```

   To have the Scheduler serve actor placement instead of the Placement service (Dapr 1.19 or later), add `--scheduler-placement`. It does not start the `dapr_placement` container. [Learn more about serving placement from the Scheduler service.]({{% ref "placement#serving-placement-from-the-scheduler-service" %}})

1. Ensure you are using the latest version of Dapr (v{{% dapr-latest-version long="true" %}})) with:

   ```bash
   $ dapr --version

   CLI version: {{% dapr-latest-version short="true" %}}
   Runtime version: {{% dapr-latest-version short="true" %}}
   ```
