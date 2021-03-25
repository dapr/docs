---
type: docs
title: "Initialize Dapr in your local environment"
linkTitle: "Init Dapr locally"
weight: 20
aliases:
  - /getting-started/install-dapr/
---

Now that you have the [Dapr CLI installed]({{<ref install-dapr-cli.md>}}), it's time to initialize Dapr on your local machine using the CLI. 

Dapr runs as a sidecar alongside your application, and in self-hosted mode this means it is a process on your local machine. Therefore, initializing Dapr includes fetching the Dapr sidecar binaries and installing them locally.

In addition, the default initialization process also creates a development environment that helps streamline application development with Dapr. This includes the following steps:

1. Running a **Redis container instance** to be used as a local state store and message broker
1. Running a **Zipkin container instance** for observability
1. Creating a **default components folder** with component definitions for the above
1. Running a **Dapr placement service container instance** for local actor support

{{% alert title="Docker" color="primary" %}}
This recommended development environment requires [Docker](https://docs.docker.com/install/). It is possible to initialize Dapr without a dependency on Docker (see [this guidance]({{<ref self-hosted-no-docker.md>}})) but next steps in this guide assume the recommended development environment.
{{% /alert %}}

### Step 1: Open an elevated terminal

   {{< tabs "Linux/MacOS" "Windows">}}

   {{% codetab %}}
   If you run your Docker commands with sudo, or the install path is `/usr/local/bin` (default install path), you will need to use `sudo` below.
   {{% /codetab %}}
   
   {{% codetab %}}
   Make sure that you run Command Prompt as administrator (right click, run as administrator)
   {{% /codetab %}}
   
   {{< /tabs >}}

### Step 2: Run the init CLI command

Install the latest Dapr runtime binaries:

```bash
dapr init
```

### Step 3: Verify Dapr version

```bash
dapr --version
```

Output should look like this:
```
CLI version: 1.0.1
Runtime version: 1.0.1
```

### Step 4: Verify containers are running

As mentioned above, the `dapr init` command launches several containers that will help you get started with Dapr. Verify this by running:

```bash
docker ps
```

Make sure that instances with `daprio/dapr`, `openzipkin/zipkin`, and `redis` images are all running:

```
CONTAINER ID   IMAGE                    COMMAND                  CREATED         STATUS         PORTS                              NAMES
0dda6684dc2e   openzipkin/zipkin        "/busybox/sh run.sh"     2 minutes ago   Up 2 minutes   9410/tcp, 0.0.0.0:9411->9411/tcp   dapr_zipkin
9bf6ef339f50   redis                    "docker-entrypoint.s…"   2 minutes ago   Up 2 minutes   0.0.0.0:6379->6379/tcp             dapr_redis
8d993e514150   daprio/dapr              "./placement"            2 minutes ago   Up 2 minutes   0.0.0.0:6050->50005/tcp            dapr_placement
```

### Step 5: Verify components directory has been initialized

On `dapr init`, the CLI also creates a default components folder which includes several YAML files with definitions for a state store, pub/sub and zipkin. These will be read by the Dapr sidecar, telling it to use the Redis container for state management and messaging and the Zipkin container for collecting traces.

- In Linux/MacOS Dapr is initialized with default components and files in `$HOME/.dapr`.
- For Windows Dapr is initialized to `%USERPROFILE%\.dapr\`


{{< tabs "Linux/MacOS" "Windows">}}

{{% codetab %}}
Run:
```bash
ls $HOME/.dapr
```

You should see:
```
bin  components  config.yaml
```
{{% /codetab %}}

{{% codetab %}}
Open `%USERPROFILE%\.dapr\` in file explorer:

```powershell
explorer "%USERPROFILE%\.dapr\"
```

You will see the Dapr config, Dapr binaries directory, and the default components directory for Dapr:

<img src="/images/install-dapr-selfhost-windows.png" width=500>
{{% /codetab %}}

{{< /tabs >}}

<a class="btn btn-primary" href="{{< ref get-started-api.md >}}" role="button">Next step: Use the Dapr API >></a>

