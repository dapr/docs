---
type: docs
title: Multi-App Run overview
linkTitle: Multi-App Run overview
weight: 1000
description: Run multiple applications with one CLI command
---

{{% alert title="Note" color="primary" %}}
 Multi-App Run is currently a preview feature only supported in Linux/MacOS. 
{{% /alert %}}

Let's say you want to run several applications locally to test them together, similar to a production scenario. With a local Kubernetes cluster, you'd be able to do this with helm/deployment YAML files. You'd also have to build them as containers and set up Kubernetes, which can add some complexity. 

Instead, you simply want to run them as local executables in self-hosted mode.  However, self-hosted mode requires you to:

- Run multiple `dapr run` commands
- Keep track of all ports opened (you cannot have duplicate ports for different applications).
- Remember the resources folders and configuration files that each application refers to.
- Recall all of the additional flags you used to tweak the `dapr run` command behavior (`--app-health-check-path`, `--dapr-grpc-port`, `--unix-domain-socket`, etc.)

With Multi-App Run, you can start multiple applications in self-hosted mode using a single `dapr run -f` command using a template file. The template file describes how to start multiple applications as if you had run many separate CLI `run`commands. By default, this template file is called `dapr.yaml`. 

## Multi-App Run template file

When you execute `dapr run -f .`, it uses the multi-app template file (named `dapr.yaml`) present in the current directory to run all the applications. 

You can name template file with preferred name other than the default. For example `dapr run -f ./<your-preferred-file-name>.yaml`.

The following example includes some of the template properties you can customize for your applications. In the example, you can simultaneously launch 2 applications with app IDs of `processor` and `emit-metrics`.

```yaml
version: 1
apps:
  - appID: processor
    appDirPath: ../apps/processor/
    appPort: 9081
    daprHTTPPort: 3510
    command: ["go","run", "app.go"]
  - appID: emit-metrics
    appDirPath: ../apps/emit-metrics/
    daprHTTPPort: 3511
    env: 
      DAPR_HOST_ADD: localhost
    command: ["go","run", "app.go"]
```

For a more in-depth example and explanation of the template properties, see [Multi-app template]({{< ref multi-app-template.md >}}).

## Locations for resources and configuration files

You have options on where to place your applications' resources and configuration files when using Multi-App Run.  

### Point to one file location (with convention)

You can set all of your applications resources and configurations at the `~/.dapr` root. This is helpful when all applications share the same resources path, like when testing on a local machine.

### Separate file locations for each application (with convention)

When using Multi-App Run, each application directory can have a `.dapr` folder, which contains a `config.yaml` file and a `resources` directory. Otherwise, if the `.dapr` directory is not present within the app directory, the default `~/.dapr/resources/` and `~/.dapr/config.yaml` locations are used.

If you decide to add a `.dapr` directory in each application directory, with a `/resources` directory and `config.yaml` file, you can specify different resources paths for each application. This approach remains within convention by using the default `~/.dapr`.

### Point to separate locations (custom)

You can also name each app directory's `.dapr` directory something other than `.dapr`, such as, `webapp`, or `backend`. This helps if you'd like to be explicit about resource or application directory paths.

## Logs

The run template provides two log destination fields for each application and its associated daprd process:

1. `appLogDestination` : This field configures the log destination for the application. The possible values are `console`, `file` and `fileAndConsole`. The default value is `fileAndConsole` where application logs are written to both console and to a file by default.

2. `daprdLogDestination` : This field configures the log destination for the `daprd` process. The possible values are `console`, `file` and `fileAndConsole`. The default value is `file` where the `daprd` logs are written to a file by default.

#### Log file format

Logs for application and `daprd` are captured in separate files. These log files are created automatically under `.dapr/logs` directory under each application directory (`appDirPath` in the template). These log file names follow the pattern seen below:

- `<appID>_app_<timestamp>.log` (file name format for `app` log)
- `<appID>_daprd_<timestamp>.log` (file name format for `daprd` log)

Even if you've decided to rename your resources folder to something other than `.dapr`, the log files are written only to the `.dapr/logs` folder (created in the application directory).


## Watch the demo

Watch [this video for an overview on Multi-App Run](https://youtu.be/s1p9MNl4VGo?t=2456):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/s1p9MNl4VGo?start=2456" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Next steps

- [Learn the Multi-App Run template file structure and its properties]({{< ref multi-app-template.md >}})
- [Try out the Multi-App Run template with the Service Invocation quickstart]({{< ref serviceinvocation-quickstart.md >}})