---
type: docs
title: Run multiple applications with one command
linkTitle: Multi-app Run overview
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

## Multi-app Run template file

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

## Approaches for using Multi-app Run

You have several options when using Multi-app Run. 

### Point to one location (with convention)

When developing multiple applications, each app directory can have a `.dapr` folder, which contains a `config.yaml` file and a `resources` directory. Otherwise, if the `.dapr` directory is not present within the app directory, the default `~/.dapr/resources/` and `~/.dapr/config.yaml` locations are used.

You can set all of your applications and resources at the `~/.dapr` root. This is helpful when all applications share the same resources path. 

### Point to separate locations (with convention)

If you decide to add a `.dapr` directory in each app directory, with a `/resources` directory and `config.yaml` file, you can specify different resources paths for each application. This approach remains within convention by using the default `.dapr`

### Point to separate locations (custom)

You can also name each app directory's `.dapr` directory something other than `.dapr`, like `mymagicapp`, `webapp`, or `backend`. This helps if you'd like to be explicit about resource or application directory paths.

## Logs

Logs are included by default within each app directory and are tracked in the following locations under `.dapr/logs`:

- `app.log`
- `daprd.log`

Even if you've decided to rename your resources folder to something other than `.dapr`, the logs will remain there.

### Precedence rules


## Try it out


## Watch the demo

Watch [this video for an overview on Multi-app Run](https://youtu.be/s1p9MNl4VGo?t=2456):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/s1p9MNl4VGo?start=2456" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Next steps