---
type: docs
title: Multi-App Run overview
linkTitle: Multi-App Run overview
weight: 1000
description: Run multiple applications with one CLI command
---

{{% alert title="Note" color="primary" %}}
 Multi-App Run for **Kubernetes** is currently a preview feature.
{{% /alert %}}

Let's say you want to run several applications locally to test them together, similar to a production scenario. Multi-App Run allows you to start and stop a set of applications simultaneously, either:
- Locally/self-hosted with processes, or
- By building container images and deploying to a Kubernetes cluster
   - You can use a local Kubernetes cluster (KiND) or one deploy to a Cloud (AKS, EKS, and GKE).

The Multi-App Run template file describes how to start multiple applications as if you had run many separate CLI `run` commands. By default, this template file is called `dapr.yaml`.

{{< tabs Self-hosted Kubernetes>}}

{{% codetab %}}
<!--selfhosted-->

## Multi-App Run template file

When you execute `dapr run -f .`, it starts the multi-app template file (named `dapr.yaml`) present in the current directory to run all the applications.

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

1. `daprdLogDestination` : This field configures the log destination for the `daprd` process. The possible values are `console`, `file` and `fileAndConsole`. The default value is `file` where the `daprd` logs are written to a file by default.

### Log file format

Logs for application and `daprd` are captured in separate files. These log files are created automatically under `.dapr/logs` directory under each application directory (`appDirPath` in the template). These log file names follow the pattern seen below:

- `<appID>_app_<timestamp>.log` (file name format for `app` log)
- `<appID>_daprd_<timestamp>.log` (file name format for `daprd` log)

Even if you've decided to rename your resources folder to something other than `.dapr`, the log files are written only to the `.dapr/logs` folder (created in the application directory).

## Watch the demo

Watch [this video for an overview on Multi-App Run](https://youtu.be/s1p9MNl4VGo?t=2456):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/s1p9MNl4VGo?start=2456" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

{{% /codetab %}}

{{% codetab %}}
<!--kubernetes-->

## Multi-App Run template file

When you execute `dapr run -k -f .` or `dapr run -k -f dapr.yaml`, the applications defined in the `dapr.yaml` Multi-App Run template file starts in Kubernetes default namespace.

> **Note:** Currently, the Multi-App Run template can only start applications in the default Kubernetes namespace.

The necessary default service and deployment definitions for Kubernetes are generated within the `.dapr/deploy` folder for each app in the `dapr.yaml` template.

If the `createService` field is set to `true` in the `dapr.yaml` template for an app, then the `service.yaml` file is generated in the `.dapr/deploy` folder of the app.

Otherwise, only the `deployment.yaml` file is generated for each app that has the `containerImage` field set.

The files `service.yaml` and `deployment.yaml` are used to deploy the applications in `default` namespace in Kubernetes. This feature is specifically targeted only for running multiple apps in a dev/test environment in Kubernetes.

You can name the template file with any preferred name other than the default. For example:

```bash
dapr run -k -f ./<your-preferred-file-name>.yaml
```

The following example includes some of the template properties you can customize for your applications. In the example, you can simultaneously launch 2 applications with app IDs of `nodeapp` and `pythonapp`.

```yaml
version: 1
common:
apps:
  - appID: nodeapp
    appDirPath: ./nodeapp/
    appPort: 3000
    containerImage: ghcr.io/dapr/samples/hello-k8s-node:latest
    createService: true
    env:
      APP_PORT: 3000
  - appID: pythonapp
    appDirPath: ./pythonapp/
    containerImage: ghcr.io/dapr/samples/hello-k8s-python:latest
```

> **Note:**
> - If the `containerImage` field is not specified, `dapr run -k -f` produces an error.
> - The `createService` field defines a basic service in Kubernetes (ClusterIP or LoadBalancer) that targets the `--app-port` specified in the template. If `createService` isn't specified, the application is not accessible from outside the cluster.

For a more in-depth example and explanation of the template properties, see [Multi-app template]({{< ref multi-app-template.md >}}).

## Logs

The run template provides two log destination fields for each application and its associated daprd process:

1. `appLogDestination` : This field configures the log destination for the application. The possible values are `console`, `file` and `fileAndConsole`. The default value is `fileAndConsole` where application logs are written to both console and to a file by default.

2. `daprdLogDestination` : This field configures the log destination for the `daprd` process. The possible values are `console`, `file` and `fileAndConsole`. The default value is `file` where the `daprd` logs are written to a file by default.

### Log file format

Logs for application and `daprd` are captured in separate files. These log files are created automatically under `.dapr/logs` directory under each application directory (`appDirPath` in the template). These log file names follow the pattern seen below:

- `<appID>_app_<timestamp>.log` (file name format for `app` log)
- `<appID>_daprd_<timestamp>.log` (file name format for `daprd` log)

Even if you've decided to rename your resources folder to something other than `.dapr`, the log files are written only to the `.dapr/logs` folder (created in the application directory).

## Watch the demo

Watch [this video for an overview on Multi-App Run in Kubernetes](https://youtu.be/nWatANwaAik?si=O8XR-TUaiY0gclgO&t=1024):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/nWatANwaAik?si=O8XR-TUaiY0gclgO&amp;start=1024" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

{{% /codetab %}}

{{< /tabs >}}

## Next steps

- [Learn the Multi-App Run template file structure and its properties]({{< ref multi-app-template.md >}})
- [Try out the self-hosted Multi-App Run template with the Service Invocation quickstart]({{< ref serviceinvocation-quickstart.md >}})
- [Try out the Kubernetes Multi-App Run template with the `hello-kubernetes` tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes)