---
type: docs
title: "Steps to upgrade Dapr in a self-hosted environment"
linkTitle: "Upgrade Dapr"
weight: 50000
description: "Follow these steps to upgrade Dapr in self-hosted mode and ensure a smooth upgrade"
---


1. Uninstall the current Dapr deployment:

   {{% alert title="Note" color="warning" %}}
   This will remove the default `$HOME/.dapr` directory, binaries and all containers (dapr_redis, dapr_placement and dapr_zipkin). Linux users need to run `sudo` if    docker command needs sudo.
   {{% /alert %}}

   ```bash
   dapr uninstall --all
   ```

1. Download and install the latest CLI by visiting [this guide]({{< ref install-dapr-cli.md >}}).

1. Initialize the Dapr runtime:

   ```bash
   dapr init
   ```

1. Ensure you are using the latest version of Dapr (v{{% dapr-latest-version long="true" %}})) with:

   ```bash
   $ dapr --version

   CLI version: {{% dapr-latest-version short="true" %}}
   Runtime version: {{% dapr-latest-version short="true" %}}
   ```
