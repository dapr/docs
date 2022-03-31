---
type: docs
title: "How-To: Run Dapr in airgap environment"
linkTitle: "Run in airgap"
weight: 30000
description: "How to deploy and run Dapr in self-hosted mode in airgap environment"
---

## Overview

By default, dapr initialization downloads binaries and pulls images from the network to create the development environment. However, dapr also supports offline/airgap installation using pre-downloaded artifacts, either with docker or in slim environment. 

##  Setup

Before airgap initialization, it is required to download Dapr Installer Bundle beforehand, containing CLI, runtime and dashboard packaged together. This eliminates the need to download binaries as well as docker images when initializing Dapr locally.

1. Download the [Dapr Installer Bundle](https://github.com/dapr/installer-bundle/releases)
2. Unpack it (e.g. daprbundle_linux_amd64.tar.gz, daprbundle_windows_amd64.zip)
3. To install Dapr CLI for further use, copy `daprbundle/dapr(.exe for windows)` binary to the desired location:
   * For Linux/MacOS - `/usr/local/bin`
   * For Windows, create a directory and add this to your System PATH. For example create a directory called `c:\dapr` and add this directory to your path, by editing your system environment variable.

 ## Initialize Dapr environment

 Dapr can be initialized in airgap environment with or without Docker containers.

 ### Initialize Dapr with Docker

([Prerequisite](#Prerequisites): Docker is available in the environment)

Move to the bundle directory and run the following command:
``` bash
dapr init --from-dir .
```
> For linux users, if you run your docker cmds with sudo, you need to use "**sudo dapr init**" 

> If you are not running the above cmd from the bundle directory, provide the full path to bundle directory as input. e.g. assuming bundle directory path is $HOME/daprbundle, run `dapr init --from-dir $HOME/daprbundle` to have the same behavior.

Output should look like as follows:
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

> Note: To emulate *online* dapr initialization using `dapr init`, you can also run redis/zipkin containers as follows:
```
1. docker run --name "dapr_zipkin" --restart always -d -p 9411:9411 openzipkin/zipkin
2. docker run --name "dapr_redis" --restart always -d -p 6379:6379 redislabs/rejson
```

 ### Initialize Dapr without Docker

 Alternatively to the above, to have the CLI not install any default configuration files or run Docker containers, use the `--slim` flag with the init command. Only Dapr binaries will be installed.

``` bash
dapr init --slim --from-dir .
```

Output should look like this:
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
