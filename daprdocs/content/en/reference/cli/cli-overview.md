---
type: docs
title: "Dapr command line interface (CLI) reference"
linkTitle: "Overview"
description: "Detailed information on the Dapr CLI"
weight: 10
aliases: [/reference/cli/dapr-dashboard/]
---

The Dapr CLI allows you to setup Dapr on your local dev machine or on a Kubernetes cluster, provides debugging support, and launches and manages Dapr instances.

```bash

         __
    ____/ /___ _____  _____
   / __  / __ '/ __ \/ ___/
  / /_/ / /_/ / /_/ / /
  \__,_/\__,_/ .___/_/
              /_/

===============================
Distributed Application Runtime

Usage:
  dapr [flags]
  dapr [command]

Available Commands:
  annotate       Add dapr annotations to a Kubernetes configuration. Supported platforms: Kubernetes
  build-info     Print build info of Dapr CLI and runtime
  completion     Generates shell completion scripts
  components     List all Dapr components. Supported platforms: Kubernetes
  configurations List all Dapr configurations. Supported platforms: Kubernetes
  help           Help about any command
  init           Install Dapr on supported hosting platforms. Supported platforms: Kubernetes and self-hosted
  invoke         Invoke a method on a given Dapr application. Supported platforms: Self-hosted
  list           List all Dapr instances. Supported platforms: Kubernetes and self-hosted
  logs           Get Dapr sidecar logs for an application. Supported platforms: Kubernetes
  mcpservers     List all Dapr MCPServer resources. Supported platforms: Kubernetes and self-hosted
  mtls           Check if mTLS is enabled. Supported platforms: Kubernetes
  publish        Publish a pub-sub event. Supported platforms: Self-hosted
  run            Run Dapr and (optionally) your application side by side. Supported platforms: Self-hosted
  scheduler      Scheduler management commands. Use -k to target a Kubernetes Dapr cluster.
  status         Show the health status of Dapr services. Supported platforms: Kubernetes
  stop           Stop Dapr instances and their associated apps. Supported platforms: Self-hosted
  uninstall      Uninstall Dapr runtime. Supported platforms: Kubernetes and self-hosted
  upgrade        Upgrades or downgrades a Dapr control plane installation in a cluster. Supported platforms: Kubernetes
  version        Print the Dapr runtime and CLI version
  workflow       Workflow management commands. Use -k to target a Kubernetes Dapr cluster.

Flags:
  -h, --help                  help for dapr
      --log-as-json           Log output in JSON format
      --runtime-path string   The path to the dapr runtime installation directory
  -v, --version               version for dapr

Use "dapr [command] --help" for more information about a command.
```

### Command Reference

You can learn more about each Dapr command from the links below.

 - [`dapr annotate`]({{% ref dapr-annotate.md %}})
 - [`dapr build-info`]({{% ref dapr-build-info.md %}})
 - [`dapr completion`]({{% ref dapr-completion.md %}})
 - [`dapr components`]({{% ref dapr-components.md %}})
 - [`dapr configurations`]({{% ref dapr-configurations.md %}})
 - [`dapr help`]({{% ref dapr-help.md %}})
 - [`dapr init`]({{% ref dapr-init.md %}})
 - [`dapr invoke`]({{% ref dapr-invoke.md %}})
 - [`dapr list`]({{% ref dapr-list.md %}})
 - [`dapr logs`]({{% ref dapr-logs.md %}})
 - [`dapr mcpservers`]({{% ref dapr-mcpservers.md %}})
 - [`dapr mtls`]({{% ref dapr-mtls %}})
 - [`dapr publish`]({{% ref dapr-publish.md %}})
 - [`dapr run`]({{% ref dapr-run.md %}})
 - [`dapr scheduler`]({{% ref dapr-scheduler.md %}})
 - [`dapr status`]({{% ref dapr-status.md %}})
 - [`dapr stop`]({{% ref dapr-stop.md %}})
 - [`dapr uninstall`]({{% ref dapr-uninstall.md %}})
 - [`dapr upgrade`]({{% ref dapr-upgrade.md %}})
 - [`dapr version`]({{% ref dapr-version.md %}})
 - [`dapr workflow`]({{% ref dapr-workflow.md %}})

### Environment Variables

Some Dapr flags can be set via environment variables (e.g. `DAPR_NETWORK` for the `--network` flag of the `dapr init` command). Note that specifying the flag on the command line overrides any set environment variable.
