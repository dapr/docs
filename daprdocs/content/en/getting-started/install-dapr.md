---
type: docs
title: "How-To: Install Dapr into your local environment"
linkTitle: "Init Dapr locally"
weight: 20
description: "Install Dapr in your local environment for testing and self-hosting"
---

## Prerequisites

- Install [Dapr CLI]({{< ref install-dapr-cli.md >}})
- Install [Docker Desktop](https://docs.docker.com/install/)
   - Windows users ensure that `Docker Desktop For Windows` uses Linux containers.

By default Dapr will install with a developer environment using Docker containers to get you started easily. This getting started guide assumes Docker is installed to ensure the best experience. However, Dapr does not depend on Docker to run. Read [this page]({{< ref self-hosted-no-docker.md >}}) for instructions on installing Dapr locally without Docker using slim init.

## Initialize Dapr using the CLI

This step will install the latest Dapr Docker containers and setup a developer environment to help you get started easily with Dapr.

{{% alert title="Note" color="warning" %}}
This command will download and install Dapr v0.11. To install v1.0-rc.1, the release candidate for the [upcoming v1.0 release](https://blog.dapr.io/posts/2020/10/20/the-path-to-v.1.0-production-ready-dapr/), please visit the [v1.0-rc.1 docs](https://v1-rc1.docs.dapr.io/getting-started/install-dapr).
{{% /alert %}}

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

4. Visit our [hello world quickstart](https://github.com/dapr/quickstarts/tree/master/hello-world) or dive into the [Dapr building blocks]({{< ref building-blocks >}})

## (optional) Install a specific runtime version

You can install or upgrade to a specific version of the Dapr runtime using `dapr init --runtime-version`. You can find the list of versions in [Dapr Release](https://github.com/dapr/dapr/releases).

```bash
# Install v0.11.0 runtime
$ dapr init --runtime-version 0.11.0

# Check the versions of cli and runtime
$ dapr --version
cli version: v0.11.0
runtime version: v0.11.2
```

## Uninstall Dapr in self-hosted mode

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

## Configure Redis

Unlike Dapr self-hosted, redis is not pre-installed out of the box on Kubernetes. To install Redis as a state store or as a pub/sub message bus in your Kubernetes cluster see [How-To: Setup Redis]({{< ref configure-redis.md >}})