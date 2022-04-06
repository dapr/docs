---
type: docs
title: "How-To: Run Dapr in an offline or airgap environment"
linkTitle: "Run in offline or airgap"
weight: 30000
description: "How to deploy and run Dapr in self-hosted mode in an airgap environment"
---

## Overview

By default, Dapr initialization downloads binaries and pulls images from the network to setup the development environment. However, Dapr also supports offline or airgap installation using pre-downloaded artifacts, either with a Docker or slim environment. The artifacts for each Dapr release are built into a [Dapr Installer Bundle](https://github.com/dapr/installer-bundle) which can be downloaded. By using this installer bundle with the Dapr CLI `init` command, you can install Dapr into environments that do not have any network access.
##  Setup

Before airgap initialization, it is required to download a Dapr Installer Bundle beforehand, containing the CLI, runtime and dashboard packaged together. This eliminates the need to download binaries as well as Docker images when initializing Dapr locally.

1.  Download the [Dapr Installer Bundle](https://github.com/dapr/installer-bundle/releases) for the specific release version. For example, daprbundle_linux_amd64.tar.gz, daprbundle_windows_amd64.zip.
2. Unpack it.
3. To install Dapr CLI copy the `daprbundle/dapr (dapr.exe for Windows)` binary to the desired location:
   * For Linux/MacOS - `/usr/local/bin`
   * For Windows, create a directory and add this to your System PATH. For example create a directory called `c:\dapr` and add this directory to your path, by editing your system environment variable.

   > Note: If Dapr CLI is not moved to the desired location, you can use local `dapr` CLI binary in the bundle. The steps above is to move it to the usual location and add it to the path.

 ## Initialize Dapr environment

Dapr can be initialized in an airgap environment with or without Docker containers.
 ### Initialize Dapr with Docker

([Prerequisite](#Prerequisites): Docker is available in the environment)

Move to the bundle directory and run the following command:
``` bash
dapr init --from-dir .
```
> For linux users, if you run your Docker cmds with sudo, you need to use "**sudo dapr init**" 

> If you are not running the above cmd from the bundle directory, provide the full path to bundle directory as input. For example, assuming the bundle directory path is $HOME/daprbundle, run `dapr init --from-dir $HOME/daprbundle` to have the same behavior.

The output should look similar to the following:
```bash
  Making the jump to hyperspace...
ℹ️  Installing runtime version latest
↘  Extracting binaries and setting up components... Loaded image: daprio/dapr:$version
✅  Extracting binaries and setting up components...
✅  Extracted binaries and completed components set up.
ℹ️  daprd binary has been installed to $HOME/.dapr/bin.
ℹ️  dapr_placement container is running.
ℹ️  Use `docker ps` to check running containers.
✅  Success! Dapr is up and running. To get started, go here: https://aka.ms/dapr-getting-started
```

> Note: To emulate *online* Dapr initialization using `dapr init`, you can also run Redis and Zipkin containers as follows:
```
1. docker run --name "dapr_zipkin" --restart always -d -p 9411:9411 openzipkin/zipkin
2. docker run --name "dapr_redis" --restart always -d -p 6379:6379 redislabs/rejson
```

 ### Initialize Dapr without Docker

 Alternatively to have the CLI not install any default configuration files or run any Docker containers, use the `--slim` flag with the `init` command. Only the Dapr binaries will be installed.

``` bash
dapr init --slim --from-dir .
```

The output should look similar to the following:
```bash
⌛  Making the jump to hyperspace...
ℹ️  Installing runtime version latest
↙  Extracting binaries and setting up components... 
✅  Extracting binaries and setting up components...
✅  Extracted binaries and completed components set up.
ℹ️  daprd binary has been installed to $HOME.dapr/bin.
ℹ️  placement binary has been installed to $HOME/.dapr/bin.
✅  Success! Dapr is up and running. To get started, go here: https://aka.ms/dapr-getting-started
```
