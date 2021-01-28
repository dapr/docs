---
type: docs
title: "Install the Dapr CLI"
linkTitle: "Install Dapr CLI"
weight: 10
---

The Dapr CLI is the main tool you'll be using for various Dapr related tasks. You can use it to run an application with a Dapr sidecar, as well as review sidecar logs, list running services, and run the Dapr dashboard. The Dapr CLI works with both [self-hosted]({{< ref self-hosted >}}) and [Kubernetes]({{< ref Kubernetes >}}) environments.

Begin by downloading and installing the Dapr CLI for v1.0.0-rc.3. This is used to initialize your environment on your desired platform.

{{% alert title="Note" color="warning" %}}
This command downloads and install Dapr CLI v1.0-rc.4. To install v0.11, the latest release prior to the release candidates for the [upcoming v1.0 release](https://blog.dapr.io/posts/2020/10/20/the-path-to-v.1.0-production-ready-dapr/), please visit the [v0.11 docs](https://docs.dapr.io).
{{% /alert %}}

{{< tabs Linux Windows MacOS Binaries>}}

{{% codetab %}}
This command installs the latest linux Dapr CLI to `/usr/local/bin`:
```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash -s 1.0.0-rc.4
```
{{% /codetab %}}

{{% codetab %}}
This Command Prompt command installs the latest windows Dapr cli to `C:\dapr` and adds this directory to User PATH environment variable.
```powershell
powershell -Command "$script=iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1; $block=[ScriptBlock]::Create($script); invoke-command -ScriptBlock $block -ArgumentList 1.0.0-rc.4"
```
{{% /codetab %}}

{{% codetab %}}
This command installs the latest darwin Dapr CLI to `/usr/local/bin`:
```bash
curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | /bin/bash -s 1.0.0-rc.4
```

Or you can install via [Homebrew](https://brew.sh):
```bash
brew install dapr/tap/dapr-cli@1.0.0-rc.4
```

{{% alert title="Note for M1 Macs" color="primary" %}}
For M1 Macs, homebrew is not supported. You will need to use the dapr install script and have the rosetta amd64 compatibility layer installed. If you do not have it installed already, you can run the following:

```bash
softwareupdate --install-rosetta
```

{{% /alert %}}


{{% /codetab %}}

{{% codetab %}}
Each release of Dapr CLI includes various OSes and architectures. These binary versions can be manually downloaded and installed.

1. Download the desired Dapr CLI from the latest [Dapr Release](https://github.com/dapr/cli/releases)
2. Unpack it (e.g. dapr_linux_amd64.tar.gz, dapr_windows_amd64.zip)
3. Move it to your desired location.
   - For Linux/MacOS - `/usr/local/bin`
   - For Windows, create a directory and add this to your System PATH. For example create a directory called `C:\dapr` and add this directory to your User PATH, by editing your system environment variable.
{{% /codetab %}}
{{< /tabs >}}


### Step 2: Verify the installation

You can verify the CLI is installed by restarting your terminal/command prompt and running the following:

```bash
dapr
```

The output should look like this:


```md
	 
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
  components     List all Dapr components. Supported platforms: Kubernetes
  configurations List all Dapr configurations. Supported platforms: Kubernetes
  dashboard      Start Dapr dashboard. Supported platforms: Kubernetes and self-hosted
  help           Help about any command
  init           Install Dapr on supported hosting platforms. Supported platforms: Kubernetes and self-hosted
  invoke         Invoke a method on a given Dapr application. Supported platforms: Self-hosted
  list           List all Dapr instances. Supported platforms: Kubernetes and self-hosted
  logs           Get Dapr sidecar logs for an application. Supported platforms: Kubernetes
  mtls           Check if mTLS is enabled. Supported platforms: Kubernetes
  publish        Publish a pub-sub event. Supported platforms: Self-hosted
  run            Run Dapr and (optionally) your application side by side. Supported platforms: Self-hosted
  status         Show the health status of Dapr services. Supported platforms: Kubernetes
  stop           Stop Dapr instances and their associated apps. . Supported platforms: Self-hosted
  uninstall      Uninstall Dapr runtime. Supported platforms: Kubernetes and self-hosted

Flags:
  -h, --help      help for dapr
      --version   version for dapr

Use "dapr [command] --help" for more information about a command.
```

<a class="btn btn-primary" href="{{< ref install-dapr-selfhost.md >}}" role="button">Next step: Initialize Dapr >></a>

