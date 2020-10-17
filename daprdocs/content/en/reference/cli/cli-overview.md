---
type: docs
title: "Dapr command line (CLI) reference"
linkTitle: "Overview"
description: "Detailed information on the dapr CLI"
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
                                                                           
======================================================
A serverless runtime for hyperscale, distributed systems

Usage:
  dapr [command]

Available Commands:
  components     List all Dapr components
  configurations List all Dapr configurations
  help           Help about any command
  init           Setup dapr in Kubernetes or Standalone modes
  invoke         Invokes a Dapr app with an optional payload (deprecated, use invokePost)
  invokeGet      Issue HTTP GET to Dapr app
  invokePost     Issue HTTP POST to Dapr app with an optional payload
  list           List all Dapr instances
  logs           Gets Dapr sidecar logs for an app in Kubernetes
  mtls           Check if mTLS is enabled in a Kubernetes cluster
  publish        Publish an event to multiple consumers
  run            Launches Dapr and (optionally) your app side by side
  status         Shows the Dapr system services (control plane) health status.
  stop           Stops multiple running Dapr instances and their associated apps
  uninstall      Removes a Dapr installation

Flags:
  -h, --help      help for Dapr
      --version   version for Dapr

Use "dapr [command] --help" for more information about a command.
```

## Command Reference

You can learn more about each Dapr command from the links below.

 - [`dapr components`]({{< ref dapr-components.md >}})
 - [`dapr configurations`]({{< ref dapr-configurations.md >}})
 - [`dapr help`]({{< ref dapr-help.md >}})
 - [`dapr init`]({{< ref dapr-init.md >}})
 - [`dapr invoke`]({{< ref dapr-invoke.md >}})
 - [`dapr invokeGet`]({{< ref dapr-invokeGet.md >}})
 - [`dapr invokePost`]({{< ref dapr-invokePost.md >}})
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