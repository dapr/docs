---
type: docs
title: "Initialize Dapr in your local environment"
linkTitle: "Init Dapr locally"
weight: 20
description: "Fetch the Dapr sidecar binaries and install them locally using `dapr init`"
aliases:
  - /getting-started/set-up-dapr/install-dapr/
---

Now that you've [installed the Dapr CLI]({{<ref install-dapr-cli.md>}}), use the CLI to initialize Dapr on your local machine.

Dapr runs as a sidecar alongside your application. In self-hosted mode, this means it is a process on your local machine. By initializing Dapr, you:

- Fetch and install the Dapr sidecar binaries locally.
- Create a development environment that streamlines application development with Dapr. 

Dapr initialization includes:

1. Running a **Redis container instance** to be used as a local state store and message broker.
1. Running a **Zipkin container instance** for observability.
1. Creating a **default components folder** with component definitions for the above.
1. Running a **Dapr placement service container instance** for local actor support.
1. Running a **Dapr scheduler service container instance** for job scheduling.

{{% alert title="Kubernetes Development Environment" color="primary" %}}
To initialize Dapr in your local or remote **Kubernetes** cluster for development (including the Redis and Zipkin containers listed above), see [how to initialize Dapr for development on Kubernetes]({{<ref "kubernetes-deploy.md#install-dapr-from-the-official-dapr-helm-chart-with-development-flag" >}})
{{% /alert %}}

{{% alert title="Docker" color="primary" %}}
The recommended development environment requires [Docker](https://docs.docker.com/install/). While you can [initialize Dapr without a dependency on Docker]({{< ref self-hosted-no-docker.md >}}), the next steps in this guide assume the recommended Docker development environment.

You can also install [Podman](https://podman.io/) in place of Docker. Read more about [initializing Dapr using Podman]({{< ref dapr-init.md >}}).
{{% /alert %}}

### Step 1: Open an elevated terminal

{{< tabs "Linux/MacOS" "Windows">}}

{{% codetab %}}

You will need to use `sudo` for this quickstart if:

- You run your Docker commands with `sudo`, or
- The install path is `/usr/local/bin` (default install path).

{{% /codetab %}}

{{% codetab %}}

Run Windows Terminal or command prompt as administrator.

1. Right click on the Windows Terminal or command prompt icon.
1. Select **Run as administrator**.

{{% /codetab %}}

{{< /tabs >}}

### Step 2: Run the init CLI command

{{< tabs "Linux/MacOS" "Windows">}}

{{% codetab %}}

Install the latest Dapr runtime binaries:

```bash
dapr init
```

If you run your Docker cmds with sudo, you need to use:

```bash
sudo dapr init
```

If you are installing on **Mac OS Silicon** with Docker, you may need to perform the following workaround to enable `dapr init` to talk to Docker without using Kubernetes.
1. Navigate to **Docker Desktop** > **Settings** > **Advanced**.
1. Select the **Allow the default Docker socket to be used (requires password)** checkbox.

{{% /codetab %}}

{{% codetab %}}

Install the latest Dapr runtime binaries:

```bash
dapr init
```

{{% /codetab %}}

{{< /tabs >}}

**Expected output:**

```
⌛  Making the jump to hyperspace...
✅  Downloaded binaries and completed components set up.
ℹ️  daprd binary has been installed to  $HOME/.dapr/bin.
ℹ️  dapr_placement container is running.
ℹ️  dapr_scheduler container is running.
ℹ️  dapr_redis container is running.
ℹ️  dapr_zipkin container is running.
ℹ️  Use `docker ps` to check running containers.
✅  Success! Dapr is up and running. To get started, go here: https://aka.ms/dapr-getting-started
```

[See the troubleshooting guide if you encounter any error messages regarding Docker not being installed or running.]({{< ref "common_issues.md#dapr-cant-connect-to-docker-when-installing-the-dapr-cli" >}})

#### Slim init

To install the CLI without any default configuration files or Docker containers, use the `--slim` flag. [Learn more about the `init` command and its flags.]({{< ref dapr-init.md >}})

```bash
dapr init --slim
```

### Step 3: Verify Dapr version

```bash
dapr --version
```

**Output:**  

`CLI version: {{% dapr-latest-version cli="true" %}}` <br>
`Runtime version: {{% dapr-latest-version long="true" %}}`

### Step 4: Verify containers are running

As mentioned earlier, the `dapr init` command launches several containers that will help you get started with Dapr. Verify you have container instances with `daprio/dapr`, `openzipkin/zipkin`, and `redis` images running:

```bash
docker ps
```

**Output:**  

<img src="/images/install-dapr-selfhost/docker-containers.png" width=800>

### Step 5: Verify components directory has been initialized

On `dapr init`, the CLI also creates a default components folder that contains several YAML files with definitions for a state store, Pub/sub, and Zipkin. The Dapr sidecar will read these components and use:

- The Redis container for state management and messaging.
- The Zipkin container for collecting traces.

Verify by opening your components directory:

- On Windows, under `%UserProfile%\.dapr`
- On Linux/MacOS, under `~/.dapr`

{{< tabs "Linux/MacOS" "Windows">}}

{{% codetab %}}

```bash
ls $HOME/.dapr
```

**Output:**  

`bin  components  config.yaml`

<br>

{{% /codetab %}}

{{% codetab %}}
You can verify using either PowerShell or command line. If using PowerShell, run:
```powershell
explorer "$env:USERPROFILE\.dapr"
```

If using command line, run: 
```cmd
explorer "%USERPROFILE%\.dapr"
```

**Result:**

<img src="/images/install-dapr-selfhost/windows-view-components.png" width=600>

{{% /codetab %}}

{{< /tabs >}}

<br>

{{< button text="Next step: Use the Dapr API >>" page="getting-started/get-started-api.md" >}}

