---
type: docs
title: Run multiple applications with one command
linkTitle: Multi-app Run
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


## Multi-app Run defaults




This is the directory structure that you can use, where these are optional

<img src="/images/multi-run-structure.png" width=800 style="padding-bottom:15px;">

When developing multiple applications, each **app directory** can have a `.dapr` folder, which contains a `config.yaml` file and a `resources` directory. If the `.dapr` directory is not present within the app directory, the default `~/.dapr/resources/` and `~/.dapr/config.yaml` locations are used.

1 Go to root .dapr/resources and throw eerything in there and assume all apps will use that directory - all using the same resources path
- point to one place with convention
2 each application can have a different default resources path that you put in application directory
- point to separate places (per app) with convention
3 if you want to call it something other than .dapr, and be explicit about it, you can
- point to different places with whatever names you choose

> This change does not impact the `bin` folder, where the Dapr CLI looks for the `daprd` and `dashboard` binaries. That remains at `~/.dapr/bin/`.

Under .dapr/log folder locally:
app.log - application logs
daprd.log

Even if you've decided to have a different resources folder, it will still have the logs there

### Precedence rules


## Try it out


## Watch the demo

Watch [this video for an overview on pub/sub multi-tenancy](https://youtu.be/eK463jugo0c?t=1188):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/eK463jugo0c?start=1188" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>


<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/s1p9MNl4VGo?start=2456" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Next steps