---
type: docs
title: "Dapr command line interface (CLI) reference"
linkTitle: "Overview"
description: "Detailed information on the Dapr CLI"
weight: 10
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
  dapr [command]

Available Commands:
  completion     Generates shell completion scripts
  components     List all Dapr components
  configurations List all Dapr configurations
  dashboard      Start Dapr dashboard
  help           Help about any command
  init           Install Dapr on supported hosting platforms, currently: Kubernetes and self-hosted
  invoke         Invoke a method on a given Dapr application
  list           List all Dapr instances
  logs           Get Dapr sidecar logs for an application
  mtls           Check if mTLS is enabled
  publish        Publish a pub-sub event
  run            Run Dapr and (optionally) your application side by side
  status         Show the health status of Dapr services
  stop           Stop Dapr instances and their associated apps in self-hosted mode
  uninstall      Uninstall Dapr runtime

Flags:
  -h, --help      help for dapr
      --version   version for dapr

Use "dapr [command] --help" for more information about a command.
```

## Command Reference

You can learn more about each Dapr command from the links below.

 - [`dapr completion`]({{< ref dapr-completion.md >}})
 - [`dapr components`]({{< ref dapr-components.md >}})
 - [`dapr configurations`]({{< ref dapr-configurations.md >}})
 - [`dapr dashboard`]({{< ref dapr-dashboard.md >}})
 - [`dapr help`]({{< ref dapr-help.md >}})
 - [`dapr init`]({{< ref dapr-init.md >}})
 - [`dapr invoke`]({{< ref dapr-invoke.md >}})
 - [`dapr list`]({{< ref dapr-list.md >}})
 - [`dapr logs`]({{< ref dapr-logs.md >}})
 - [`dapr mtls`]({{< ref dapr-mtls.md >}})
 - [`dapr publish`]({{< ref dapr-publish.md >}})
 - [`dapr run`]({{< ref dapr-run.md >}})
 - [`dapr status`]({{< ref dapr-status.md >}})
 - [`dapr stop`]({{< ref dapr-stop.md >}})
 - [`dapr uninstall`]({{< ref dapr-uninstall.md >}})

## Environment Variables

Some Dapr flags can be set via environment variables (e.g. `DAPR_NETWORK` for the `--network` flag of the `dapr init` command). Note that specifying the flag on the command line overrides any set environment variable.