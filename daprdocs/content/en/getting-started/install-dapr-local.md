---
type: docs
title: "How-To: Install Dapr into a local environment"
linkTitle: "How-To: Install Dapr into a local environment"
weight: 20
description: "Install Dapr into a local environment"
---
This guide will get you up and running with Dapr running on your local machine or a VM in self-hosted mode.
Visit [this page]({{< ref hosting >}}) for a full list of supported platforms with instructions and best practices on running in production.

## Install the Dapr CLI

Begin by downloading and installing the Dapr CLI. This will be used to initialize your environment on your desired platform.

{{< tabs Linux Windows MacOS Binaries>}}

{{% codetab %}}
This command will install the latest linux Dapr CLI to `/usr/local/bin`:
```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash
```
{{% /codetab %}}

{{% codetab %}}
This command will install the latest windows Dapr cli to `%USERPROFILE%\.dapr\` and add this directory to User PATH environment variable:
```powershell
powershell -Command "iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1 | iex"
```
Verify by opening Explorer and entering `%USERPROFILE%\.dapr\` into the address bar. You should see folders for bin, componenets and a config file.
{{% /codetab %}}

{{% codetab %}}
This command will install the latest darwin Dapr CLI to `/usr/local/bin`:
```bash
curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | /bin/bash
```

Or you can install via [Homebrew](https://brew.sh):
```bash
brew install dapr/tap/dapr-cli
```
{{% /codetab %}}

{{% codetab %}}
Each release of Dapr CLI includes various OSes and architectures. These binary versions can be manually downloaded and installed.

1. Download the desired Dapr CLI from the latest [Dapr Release](https://github.com/dapr/cli/releases)
2. Unpack it (e.g. dapr_linux_amd64.tar.gz, dapr_windows_amd64.zip)
3. Move it to your desired location.
   - For Linux/MacOS - `/usr/local/bin`
   - For Windows, create a directory and add this to your System PATH. For example create a directory called `c:\dapr` and add this directory to your path, by editing your system environment variable.
{{% /codetab %}}
{{< /tabs >}}

## Install Dapr in self-hosted mode

Running Dapr runtime in self hosted mode enables you to develop Dapr applications in your local development environment and then deploy and run them in other Dapr supported environments.

### Prerequisites

- Install [Docker Desktop](https://docs.docker.com/install/)
   - Windows users ensure that `Docker Desktop For Windows` uses Linux containers.

By default Dapr will install with a developer environment using Docker containers to get you started easily. This getting started guide assumes Docker is installed to ensure the best experience. However, Dapr does not depend on Docker to run. Read [this page]({{< ref self-hosted-no-docker.md >}}) for instructions on installing Dapr locally without Docker using slim init.

### Initialize Dapr using the CLI

This step will install the latest Dapr Docker containers and setup a developer environment to help you get started easily with Dapr.

1. Ensure you are in an elevated terminal:
   - **Linux/MacOS:** if you run your docker cmds with sudo or the install path is `/usr/local/bin`(default install path), you need to use `sudo`
   - **Windows:** make sure that you run the cmd terminal in administrator mode

2. Run `dapr init`

    ```bash
    $ dapr init
    ⌛  Making the jump to hyperspace...
    Downloading binaries and setting up components
    ✅  Success! Dapr is up and running. To get started, go here: https://aka.ms/dapr-getting-started
    ```

3. Verify installation

   From a command prompt run the `docker ps` command and check that the `daprio/dapr`, `openzipkin/zipkin`, and `redis` container images are running:

   ```bash
   $ docker ps
   CONTAINER ID        IMAGE               COMMAND                  CREATED              STATUS              PORTS                              NAMES
   67bc611a118c        daprio/dapr         "./placement"            About a minute ago   Up About a minute   0.0.0.0:6050->50005/tcp            dapr_placement
   855f87d10249        openzipkin/zipkin   "/busybox/sh run.sh"     About a minute ago   Up About a minute   9410/tcp, 0.0.0.0:9411->9411/tcp   dapr_zipkin
   71cccdce0e8f        redis               "docker-entrypoint.s…"   About a minute ago   Up About a minute   0.0.0.0:6379->6379/tcp             dapr_redis
   ```

### (optional) Install a specific runtime version

You can install or upgrade to a specific version of the Dapr runtime using `dapr init --runtime-version`. You can find the list of versions in [Dapr Release](https://github.com/dapr/dapr/releases).

```bash
# Install v0.1.0 runtime
$ dapr init --runtime-version 0.11.0

# Check the versions of cli and runtime
$ dapr --version
cli version: v0.11.0
runtime version: v0.11.2
```

### Uninstall Dapr in self-hosted mode

This command will remove the placement Dapr container:

```bash
$ dapr uninstall
```

{{% alert title="Warning" color="warning" %}}
This command won't remove the Redis or Zipkin containers by default, just in case you were using them for other purposes. To remove Redis, Zipkin, Actor Placement container, as well as the default Dapr directory located at `$HOME/.dapr` or `%USERPROFILE%\.dapr\`, run:

```bash
$ dapr uninstall --all
```
{{% /alert %}}

> For Linux/MacOS users, if you run your docker cmds with sudo or the install path is `/usr/local/bin`(default install path), you need to use `sudo dapr uninstall` to remove dapr binaries and/or the containers.

