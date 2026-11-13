---
type: docs
title: "Dapr Dev Dashboard"
linkTitle: "Dapr Dev Dashboard"
weight: 100
description: "Inspect and debug the Dapr applications running on your machine"
---

The free and open source (Apache-2.0) [Diagrid Dapr Dev Dashboard](https://github.com/diagridio/dev-dashboard) is a companion for local Dapr development. It inspects the apps you start with `dapr run` / `dapr run -f`, Aspire, Docker Compose, or Dapr Testcontainers, and surfaces everything about them: sidecars, workflows, actors, state stores, subscriptions, components, resiliency policies, configurations, and logs. It also helps you author Dapr resources. The **Component Builder** walks you through picking a component type from the full Dapr catalog, filling in its metadata fields, and choosing an authentication profile. The **Resiliency Builder** composes resiliency policies (timeouts, retries, circuit breakers) and applies them to targets (apps, actors, components). Both builders end in a YAML preview you can copy or download into your project.

<img src="/images/dev-dashboard/applications.png" width=800 alt="Dapr Dev Dashboard showing the Dapr applications running on the local machine"/><br/>

{{% alert title="Note" color="primary" %}}
The Dev Dashboard is a local development tool only. It is not intended to run inside a Kubernetes cluster, or in production, staging, or any shared environment.
{{% /alert %}}

## Install the Dev Dashboard

The dashboard ships as a standalone binary that is published on [GitHub Releases](https://github.com/diagridio/dev-dashboard/releases). Download and install the dashboard via the terminal:

{{< tabpane text=true >}}

{{% tab "Linux/MacOS" %}}

The script installs the dashboard to `~/.local/bin`.

```bash
curl -sSL https://raw.githubusercontent.com/diagridio/dev-dashboard/main/scripts/install.sh | sh
```

To install a specific version, set `VERSION` before piping:

```bash
curl -sSL https://raw.githubusercontent.com/diagridio/dev-dashboard/main/scripts/install.sh | VERSION=vX.Y.Z sh
```

{{% /tab %}}

{{% tab "Windows" %}}

The script installs the dashboard to `%LOCALAPPDATA%\Programs\diagrid-dev-dashboard`.

```powershell
iwr -useb https://raw.githubusercontent.com/diagridio/dev-dashboard/main/scripts/install.ps1 | iex
```

To install a specific version, set `VERSION` before piping:

```powershell
$env:VERSION='vX.Y.Z'; iwr -useb https://raw.githubusercontent.com/diagridio/dev-dashboard/main/scripts/install.ps1 | iex
```

{{% /tab %}}

{{< /tabpane >}}

If the install directory is not on your `PATH`, the script prints the line you need to add.

Alternatively, download the archive for your platform from the [GitHub Releases](https://github.com/diagridio/dev-dashboard/releases) page, extract it, and place `diagrid-dev-dashboard` (or `diagrid-dev-dashboard.exe`) on your `PATH`.

Verify the installation with:

```bash
diagrid-dev-dashboard --version
```

## Run the Dev Dashboard

Start the dashboard with:

```bash
diagrid-dev-dashboard
```

<!-- IGNORE_LINKS -->
The dashboard opens in a browser at [http://localhost:9090](http://localhost:9090). Use the `--port` flag to run the dashboard on a different port:
<!-- END_IGNORE -->

```bash
diagrid-dev-dashboard --port 8080
```

No additional setup is needed. The dashboard discovers running Dapr apps the same way `dapr list` does, so anything started with `dapr run` / `dapr run -f`, Aspire, Docker Compose, or Dapr Testcontainers shows up within one refresh cycle.

## Update the Dev Dashboard

On startup, the dashboard checks for a newer release. When one is available, the dashboard prints a notice and the UI shows an **Update available** indicator. To update to the latest release, run:

```bash
diagrid-dev-dashboard update
```

Restart any running dashboard to use the new version.

## Features

### Inspect applications

The **Applications** page shows a live table of all running apps and sidecars, including the app ID, health, runtime, ports, and process IDs. Drill into a single app to see its command, resource and configuration paths, runtime metadata, enabled features, and loaded components.

<img src="/images/dev-dashboard/application-detail.png" width=800 alt="Dapr Dev Dashboard showing the details of a single Dapr application"/><br/>

### Debug workflows

The **Workflows** page lists the workflow executions across all apps, with status filters and search. You can terminate and purge individual workflows or bulk-delete them.

<img src="/images/dev-dashboard/workflow-overview.png" width=800 alt="Dapr Dev Dashboard showing an overview of workflow executions"/><br/>

Open a workflow instance to watch its live event history, input and output, and custom status.

<img src="/images/dev-dashboard/workflow-detail.png" width=800 alt="Dapr Dev Dashboard showing the event history of a workflow instance"/><br/>

The dashboard reads workflows directly from local Redis, PostgreSQL, SQLite, and MongoDB state stores. For other state stores, such as the in-memory store, it reads workflows through the sidecar's workflow API, which requires Dapr 1.17 or later.

### Copy Dapr CLI commands

The **CLI** drawer lists the Dapr CLI commands that match what you're looking at, such as viewing the history of a workflow instance, raising an external event, or terminating, purging, and re-running it. Each command links to its docs and has a **Copy** button. The drawer is available on the Applications, Workflows, Actors, and Subscriptions pages, and lists self-hosted commands only.

<img src="/images/dev-dashboard/cli-drawer.png" width=800 alt="Dapr Dev Dashboard showing the CLI drawer with Dapr CLI commands for a workflow instance"/><br/>

### Review actors

The **Actors** page aggregates the actor types across all apps, with the number of active actors per type, their host app, and the placement status.

<img src="/images/dev-dashboard/actors.png" width=800 alt="Dapr Dev Dashboard showing the actor types and the number of active actors per type"/><br/>

### Review subscriptions and publish test messages

The **Subscriptions** page lists the pub/sub subscriptions across all apps, including the pub/sub component, topic, routes, and subscription type (declarative, programmatic, or streaming). Use the **Publish** button on a subscription to send a test message through the app's sidecar, so you can test a subscriber without running a publisher app.

<img src="/images/dev-dashboard/publish-message.png" width=800 alt="Dapr Dev Dashboard showing the dialog to publish a test message to a subscription"/><br/>

### Browse state records

The **State** page lists the records in a connected state store, including the key, app, value, size, version (ETag), and TTL. Expand a record to see its full value, and use the *Decode base64* toggle for encoded values. Use **+ New record** to add a record, and delete records individually or by multi-select. Workflow history and actor state are hidden by default; select **Show internal keys** to reveal them.

<img src="/images/dev-dashboard/state-records.png" width=800 alt="Dapr Dev Dashboard showing the records in a Redis state store"/><br/>

### Read and build components

The **Components** page shows the component files and which apps loaded each component. Use the **+ New component** button to open the Component Builder and generate component YAML for any component type in the Dapr catalog. The **Resiliency** page offers a similar builder for resiliency policies.

<img src="/images/dev-dashboard/components.png" width=800 alt="Dapr Dev Dashboard showing the loaded Dapr components"/><br/>

### Check the control plane

The **Control Plane** page shows the status, ports, and memory usage of the local Dapr control plane services, such as the scheduler and placement services, and lets you restart or stop them.

<img src="/images/dev-dashboard/control-plane.png" width=800 alt="Dapr Dev Dashboard showing the local Dapr control plane services"/><br/>

### Stream logs

The **Logs** page streams the `daprd` and application logs per app, with level coloring, keyword highlighting, and a follow toggle.

<img src="/images/dev-dashboard/logs.png" width=800 alt="Dapr Dev Dashboard streaming application and sidecar logs"/><br/>

## Related links

- [Dev Dashboard repository on GitHub](https://github.com/diagridio/dev-dashboard)
- [Multi-App Run]({{% ref multi-app-overview.md %}})
