---
type: docs
title: Run multiple applications with one command
linkTitle: Multi-app Dapr Run
weight: 2000
description: Learn the scenarios around running multiple applications with one Dapr command
---

{{% alert title="Note" color="primary" %}}
 Multi-app `dapr run` is currently a preview feature only supported in Linux/MacOS. 
{{% /alert %}}

Let's say you want to run several applications in local mode while being able to replication the production scenario. While in Kubernets mode, you'd be able to use helm/deployment YAML files, self-hosted mode required you to:

- Run multiple `dapr run` commands
- Keep track of all ports opened
- Remember the resources folders and configuration files that each application refers to
- Recall all of the additional flags you used to tweak the `dapr run` command behavior (`--app-health-check-path`, `--dapr-grpc-port`, `--unix-domain-socket`, etc.)

With the Multi-app Dapr Run feature, you can easily start multiple Dapr applications in self-hosted mode using a single `dapr run -f` command.

## How does it work?

Currently, upon running [`dapr init`]({{< ref install-dapr-selfhost.md >}}), Dapr initializes in the `~/.dapr/` directory on Linux, where the default configurations and resources are stored.

For running multiple applications, `dapr init` will initialize the following `~/.dapr/` directory structure:

<img src="/images/multi-run-structure.png" width=800 style="padding-bottom:15px;">

When developing multiple applications, each **app directory** can have a `.dapr` folder, which contains a `config.yaml` file and a `resources` directory. If the `.dapr` directory is not present within the app directory, the default `~/.dapr/resources/` and `~/.dapr/config.yaml` locations are used.

> This change does not impact the `bin` folder, where the Dapr CLI looks for the `daprd` and `dashboard` binaries. That remains at `~/.dapr/bin/`.

### The `config.yaml` file

When you execute `dapr run -f`, Dapr parses the `config.yaml` file initialized with `dapr init`. The following example includes the configurations you can customize to your applications:

```yaml

version: 1
common: (optional)
  resources_dir: ./app/components # any dapr resources to be shared across apps
  env:  # any environment variable shared among apps
    - DEBUG: true
apps:
  - app_id: webapp ## required
    app_dir: ./webapp/ ## required
    resources_dir: ./webapp/components # (optional) can be default by convention too, ignore if dir is not found.
    config_file: ./webapp/config.yaml # (optional) can be default by convention too, ignore if file is not found.
    app_protocol: HTTP
    app_port: 8080
    app_health_check_path: "/healthz" # All _ converted to - for all properties defined under daprd section
    command: ["python3" "app.py"]
  - app_id: backend
    app_dir: ./backend/
    app_protocol: GRPC
    app_port: 3000
    unix_domain_socket: "/tmp/test-socket"
    env:
      - DEBUG: false
    command: ["./backend"]
```

### Precedence rules


## Scenario

todo

## Next steps