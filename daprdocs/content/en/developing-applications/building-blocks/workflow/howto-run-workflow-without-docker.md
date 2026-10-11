---
type: docs
title: "How to: Run workflows locally without Docker"
linkTitle: "How to: Run without Docker"
weight: 6500
description: "Run Dapr workflows on your machine with the Dapr binaries and a SQLite state store, without Docker or Redis"
---

`dapr init` runs the Placement service, the Scheduler service, and Redis in Docker containers. Dapr Workflow uses all three. This guide shows how to run workflows on your machine without Docker. You start the Dapr binaries as processes, and you use a SQLite file as the actor state store.

A workflow app needs these parts:

| Part | Dapr 1.18 and earlier | Dapr 1.19 and later |
| ---- | --------------------- | ------------------- |
| `daprd`, the sidecar of your app | Required | Required |
| [Scheduler service]({{% ref scheduler %}}) | Required | Required |
| [Placement service]({{% ref placement %}}) | Required | Optional. The Scheduler service can [serve actor placement]({{% ref "placement#serving-placement-from-the-scheduler-service" %}}). |
| A state store with `actorStateStore` set to `"true"` | Required | Required |

The commands have a Linux/macOS tab and a Windows tab. The Windows commands are for the Command Prompt (`cmd.exe`).

## Install the Dapr binaries

1. [Install the Dapr CLI]({{% ref install-dapr-cli.md %}}).
1. Install the Dapr binaries:

   ```bash
   dapr init --slim
   ```

`dapr init --slim` installs `daprd`, `placement`, and `scheduler` in `$HOME/.dapr/bin` (Linux and macOS) or `%USERPROFILE%\.dapr\bin` (Windows, with the `.exe` extension). It does not start them, and it does not create component files. You start each process in the steps below.

## Configure SQLite as the actor state store

Dapr Workflow keeps the workflow history in the actor state store. In your project folder, create the file `components/statestore.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.sqlite
  version: v1
  metadata:
  - name: connectionString
    value: "workflows.db"
  - name: actorStateStore
    value: "true"
```

SQLite creates the file `workflows.db` in the folder where you start `dapr run`. For all the options, see the [SQLite component reference]({{% ref setup-sqlite %}}).

## Start the Scheduler service

Open a terminal in your project folder and start the Scheduler service:

{{< tabpane text=true >}}

{{% tab "Linux/macOS" %}}

```bash
$HOME/.dapr/bin/scheduler --etcd-data-dir ./scheduler-data
```

{{% /tab %}}

{{% tab "Windows" %}}

```cmd
%USERPROFILE%\.dapr\bin\scheduler.exe --etcd-data-dir .\scheduler-data
```

{{% /tab %}}

{{< /tabpane >}}

The Scheduler service listens on port 50006. It keeps its data in an embedded etcd database in the `./scheduler-data` folder. The embedded etcd uses ports 2379 and 2380. To change these ports, set `--etcd-client-port` and `--etcd-initial-cluster`.

## Start the Placement service

Dapr 1.18 and earlier need the Placement service. On Dapr 1.19 and later, you can [skip this step](#dapr-119-and-later-run-without-the-placement-service).

Open a second terminal and start the Placement service:

{{< tabpane text=true >}}

{{% tab "Linux/macOS" %}}

```bash
$HOME/.dapr/bin/placement --healthz-port 8081 --metrics-port 9091
```

{{% /tab %}}

{{% tab "Windows" %}}

```cmd
%USERPROFILE%\.dapr\bin\placement.exe --healthz-port 8081 --metrics-port 9091
```

{{% /tab %}}

{{< /tabpane >}}

The Placement service listens on port 50005.

The Placement service and the Scheduler service both use port 8080 for the health server and port 9090 for metrics by default. If both processes use the default ports, the second process stops with this error:

```text
listen tcp :8080: bind: address already in use
```

For this reason, the command above sets `--healthz-port` and `--metrics-port` to other ports.

### Dapr 1.19 and later: run without the Placement service

{{% alert title="Note" color="primary" %}}
This option needs Dapr 1.19 or later. The Dapr 1.18 Scheduler service stops with the error `unknown flag: --placement-enabled`.
{{% /alert %}}

On Dapr 1.19 and later, the Scheduler service can serve actor placement. Then you run two processes only: `daprd` and the Scheduler service.

1. Start the Scheduler service with `--placement-enabled=true`, in place of the command in [Start the Scheduler service](#start-the-scheduler-service):

   ```bash
   $HOME/.dapr/bin/scheduler --etcd-data-dir ./scheduler-data --placement-enabled=true
   ```

   On Windows:

   ```cmd
   %USERPROFILE%\.dapr\bin\scheduler.exe --etcd-data-dir .\scheduler-data --placement-enabled=true
   ```

1. Do not start the Placement service.
1. In the next step, set `--placement-host-address ""` in the `dapr run` command. The sidecar then gets actor placement from the Scheduler service.

## Run your workflow app

Open a terminal in your project folder. Start your app and its sidecar:

{{< tabpane text=true >}}

{{% tab "Linux/macOS" %}}

```bash
dapr run --app-id order-app --dapr-http-port 3500 --resources-path ./components \
  --placement-host-address localhost:50005 --scheduler-host-address localhost:50006 \
  -- python3 app.py
```

{{% /tab %}}

{{% tab "Windows" %}}

```cmd
dapr run --app-id order-app --dapr-http-port 3500 --resources-path .\components --placement-host-address localhost:50005 --scheduler-host-address localhost:50006 -- python app.py
```

{{% /tab %}}

{{< /tabpane >}}

- Replace `python3 app.py` (`python app.py` on Windows) with the command that starts your workflow app.
- `--placement-host-address` and `--scheduler-host-address` give the addresses of the services that you started. If you start a service on a different port with `--port`, change the address to match.
- If the Scheduler service serves actor placement (Dapr 1.19 and later), use `--placement-host-address ""`.

## Check that a workflow runs

When the sidecar is ready, `GET http://localhost:3500/v1.0/healthz` returns HTTP status 204.

Start a workflow with the [workflow API]({{% ref workflow_api %}}). Replace `<workflow-name>` with the name of a workflow that your app registers, and `"<input>"` with its input:

{{< tabpane text=true >}}

{{% tab "Linux/macOS" %}}

```bash
curl -i -X POST "http://localhost:3500/v1.0/workflows/dapr/<workflow-name>/start?instanceID=test-1" \
  -H "Content-Type: application/json" -d '"<input>"'
```

{{% /tab %}}

{{% tab "Windows" %}}

```cmd
curl -i -X POST "http://localhost:3500/v1.0/workflows/dapr/<workflow-name>/start?instanceID=test-1" -H "Content-Type: application/json" -d "\"<input>\""
```

{{% /tab %}}

{{< /tabpane >}}

Get the status of the workflow instance:

```bash
curl http://localhost:3500/v1.0/workflows/dapr/test-1
```

When the workflow finishes, the response has `"runtimeStatus":"COMPLETED"` and the output in `dapr.workflow.output`.

## Troubleshooting

| Symptom | Cause and fix |
| ------- | ------------- |
| `/v1.0/healthz` returns 500. The sidecar logs `Failed to connect to scheduler host`. Workflow API calls get no response. | The Scheduler service does not run, or `--scheduler-host-address` has the wrong address. Start the Scheduler service and check the address. |
| A service stops with `bind: address already in use`. | Two processes use the same port. Set `--healthz-port`, `--metrics-port`, or `--port` to a free port. |
| The Scheduler service stops with `unknown flag: --placement-enabled`. | Your Dapr version is earlier than 1.19. Run the Placement service as shown in [Start the Placement service](#start-the-placement-service). |

## Clean up

1. Stop `dapr run`, the Placement service, and the Scheduler service with `Ctrl+C`.
1. To start again with no workflow state, delete the `workflows.db` files and the `scheduler-data` folder in your project folder.

## Next steps

- [How to: Author a workflow]({{% ref howto-author-workflow.md %}})
- [How to: Manage workflows]({{% ref howto-manage-workflow.md %}})
- [Run Dapr in self-hosted mode without Docker]({{% ref self-hosted-no-docker.md %}})
