---
type: docs
title: "How-To: Install Dapr into your local environment"
linkTitle: "Init Dapr locally"
weight: 20
description: "Install Dapr in your local environment for testing and self-hosting"
aliases:
  - /getting-started/install-dapr/
---

## Prerequisites

- Install [Dapr CLI]({{< ref install-dapr-cli.md >}})
- Install [Docker Desktop](https://docs.docker.com/install/)
   - Windows users ensure that `Docker Desktop For Windows` uses Linux containers.

{{% alert title="Note" color="primary" %}}
By default Dapr will install with a developer environment using Docker containers to get you started easily. This getting started guide assumes Docker is installed to ensure the best experience. However, Dapr does not depend on Docker to run. Read [this page]({{< ref self-hosted-no-docker.md >}}) for instructions on installing Dapr locally without Docker using slim init.
{{% /alert %}}

## Initialize Dapr using the CLI

This step will install the latest Dapr Docker containers and setup a developer environment to help you get started easily with Dapr.

- In Linux/MacOS Dapr will be initialized with default components and files in `$HOME/.dapr`.
- For Windows Dapr will be initialized to `%USERPROFILE%\.dapr\`

{{% alert title="Note" color="warning" %}}
This command will download and install Dapr runtime v1.0-rc.1. To install v0.11, the latest release prior to the release candidates for the [upcoming v1.0 release](https://blog.dapr.io/posts/2020/10/20/the-path-to-v.1.0-production-ready-dapr/), please visit the [v0.11 docs](https://docs.dapr.io).
{{% /alert %}}

1. Ensure you are in an elevated terminal:
   - **Linux/MacOS:** if you run your docker commands with sudo or the install path is `/usr/local/bin`(default install path), you need to use `sudo`
   - **Windows:** make sure that you run the command prompt terminal in administrator mode (right click, run as administrator)

2. Run `dapr init --runtime-version 1.0.0-rc.1`

   You can install or upgrade to a specific version of the Dapr runtime using `dapr init --runtime-version`. You can find the list of versions in [Dapr Release](https://github.com/dapr/dapr/releases)

    ```bash
    $ dapr init --runtime-version 1.0.0-rc.1
    ⌛  Making the jump to hyperspace...
    Downloading binaries and setting up components
    ✅  Success! Dapr is up and running. To get started, go here: https://aka.ms/dapr-getting-started
    ```

3. Verify Dapr containers are running

   From a command prompt run the `docker ps` command and check that the `daprio/dapr`, `openzipkin/zipkin`, and `redis` container images are running:

   ```bash
   $ docker ps
   CONTAINER ID        IMAGE               COMMAND                  CREATED              STATUS              PORTS                              NAMES
   67bc611a118c        daprio/dapr         "./placement"            About a minute ago   Up About a minute   0.0.0.0:6050->50005/tcp            dapr_placement
   855f87d10249        openzipkin/zipkin   "/busybox/sh run.sh"     About a minute ago   Up About a minute   9410/tcp, 0.0.0.0:9411->9411/tcp   dapr_zipkin
   71cccdce0e8f        redis               "docker-entrypoint.s…"   About a minute ago   Up About a minute   0.0.0.0:6379->6379/tcp             dapr_redis
   ```

4. Verify Dapr directory has been initialized

   - **Linux/MacOS:** Run `ls $HOME/.dapr`
      ```bash
      $ ls $HOME/.dapr
      bin  components  config.yaml
      ```
   - **Windows:** Open `%USERPROFILE%\.dapr\` in file explorer
      
      ![Explorer files](/images/install-dapr-selfhost-windows.png)

## Uninstall Dapr in self-hosted mode

This cli command will remove the placement Dapr container:

```bash
$ dapr uninstall
```

{{% alert title="Warning" color="warning" %}}
This command won't remove the Redis or Zipkin containers by default, just in case you were using them for other purposes. To remove Redis, Zipkin, Actor Placement container, as well as the default Dapr directory located at `$HOME/.dapr` or `%USERPROFILE%\.dapr\`, run:

```bash
$ dapr uninstall --all
```
{{% /alert %}}

{{% alert title="Note" color="primary" %}}
For Linux/MacOS users, if you run your docker cmds with sudo or the install path is `/usr/local/bin`(default install path), you need to use `sudo dapr uninstall` to remove dapr binaries and/or the containers.
{{% /alert %}}

## Next steps
- [Setup a state store and pub/sub message broker]({{< ref configure-state-pubsub.md >}})

