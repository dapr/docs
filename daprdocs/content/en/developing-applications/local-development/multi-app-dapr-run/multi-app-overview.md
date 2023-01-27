---
type: docs
title: Run multiple applications with one command
linkTitle: Multi-app Dapr Run
weight: 1000
description: Learn the scenarios around running multiple applications with one Dapr command
---

{{% alert title="Note" color="primary" %}}
 Multi-app `dapr run -f` is currently a preview feature only supported in Linux/MacOS. 
{{% /alert %}}

Let's say you want to run several applications locally to test them together, similar to a production scenario. With a local Kubernetes cluster, you'd be able to do this with helm/deployment YAML files. You'd also have to build them as containers and set up Kubernetes, which can add some complexity. 

Instead, you simply want to run them as local executables in self-hosted mode.  However, self-hosted mode requires you to:

- Run multiple `dapr run` commands
- Keep track of all ports opened (you cannot have duplicate ports for different applications)- Remember the resources folders and configuration files that each application refers to
- Recall all of the additional flags you used to tweak the `dapr run` command behavior (`--app-health-check-path`, `--dapr-grpc-port`, `--unix-domain-socket`, etc.)

With Multi-app Run, you can easily start multiple applications in self-hosted mode using a single `dapr run -f` command.

## Multi-app template file

When you execute `dapr run -f`, Dapr parses the multi-app template file initialized with `dapr init`. By default, this template file is called `dapr.yaml`. 

You can customize the template file by executing `dapr run -f ./<your-preferred-file-name>.yaml`.

The following `dapr.yaml` example includes some of the configurations you can customize to your applications. For a more in-depth example and explanation of variables, see [Multi-app template]({{< ref multi-app-template.md >}}).

```yaml
version: 1
apps:
  - appDirPath: ../../../apps/processor/
    appPort: 9081
    daprHTTPPort: 3510
    command: ["go","run", "app.go"]
  - appID: emit-metrics
    appDirPath: ../../../apps/emit-metrics/
    daprHTTPPort: 3511
    env: 
      DAPR_HOST_ADD: localhost
    command: ["go","run", "app.go"]
```


## How does it work?

When running [`dapr init`]({{< ref install-dapr-selfhost.md >}}), this initializes a directory where the default configurations and resources are stored.

For running multiple applications, `dapr init` will initialize the following `~/.dapr/` directory structure:

<img src="/images/multi-run-structure.png" width=800 style="padding-bottom:15px;">

When developing multiple applications, each **app directory** can have a `.dapr` folder, which contains a `config.yaml` file and a `resources` directory. If the `.dapr` directory is not present within the app directory, the default `~/.dapr/resources/` and `~/.dapr/config.yaml` locations are used.

> This change does not impact the `bin` folder, where the Dapr CLI looks for the `daprd` and `dashboard` binaries. That remains at `~/.dapr/bin/`.


### Precedence rules


## Next steps