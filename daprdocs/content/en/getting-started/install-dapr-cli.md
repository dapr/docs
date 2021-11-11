---
type: docs
title: "Install the Dapr CLI"
linkTitle: "Install Dapr CLI"
weight: 10
---

The Dapr CLI is the main tool you'll be using for various Dapr related tasks. You can use it to run an application with a Dapr sidecar, as well as review sidecar logs, list running services, and run the Dapr dashboard. The Dapr CLI works with both [self-hosted]({{< ref self-hosted >}}) and [Kubernetes]({{< ref Kubernetes >}}) environments.

Begin by downloading and installing the Dapr CLI:

{{< tabs Linux Windows MacOS Binaries>}}

{{% codetab %}}
### Install from Terminal

This command installs the latest linux Dapr CLI to `/usr/local/bin`:
```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash
```

### Install without `sudo`
If you do not have access to the `sudo` command or your username is not in the `sudoers` file you can install Dapr to an alternate directory via the `DAPR_INSTALL_DIR` environment variable.

```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | DAPR_INSTALL_DIR="$HOME/dapr" /bin/bash
```
{{% /codetab %}}

{{% codetab %}}
### Install from Command Prompt
This Command Prompt command installs the latest windows Dapr cli to `C:\dapr` and adds this directory to User PATH environment variable.
```powershell
powershell -Command "iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1 | iex"
```

### Install without administrative rights
If you do not have admin rights you can install Dapr to an alternate directory via the `DAPR_INSTALL_DIR` environment variable.

```powershell
$script=iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1; $block=[ScriptBlock]::Create($script); invoke-command -ScriptBlock $block -ArgumentList "", "$HOME/dapr"
```
{{% /codetab %}}

{{% codetab %}}
### Install from Terminal
This command installs the latest darwin Dapr CLI to `/usr/local/bin`:
```bash
curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | /bin/bash
```
#### Note for ARM64 Macs
Support for ARM64 Macs is available as a Preview feature. When installing from the terminal, native ARM64 binaries are downloaded when available. For older releases, AMD64 binaries are downloaded, which must be run with Rosetta2 emulation enabled. To install Rosetta emulation:
```bash
softwareupdate --install-rosetta
```

### Install from Homebrew
You can install via [Homebrew](https://brew.sh):
```bash
brew install dapr/tap/dapr-cli
```

#### Note for ARM64 Macs
For ARM64 Macs, only Homebrew 3.0 and higher versions are supported. Please update Homebrew to 3.0.0 or higher and then run the command below:

```bash
arch -arm64 brew install dapr/tap/dapr-cli
```

### Install without `sudo`
If you do not have access to the `sudo` command or your username is not in the `sudoers` file you can install Dapr to an alternate directory via the `DAPR_INSTALL_DIR` environment variable.

```bash
curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | DAPR_INSTALL_DIR="$HOME/dapr" /bin/bash
```
{{% /codetab %}}

{{% codetab %}}
Each release of Dapr CLI includes various OSes and architectures. These binary versions can be manually downloaded and installed.

1. Download the desired Dapr CLI from the latest [Dapr Release](https://github.com/dapr/cli/releases)
2. Unpack it (e.g. dapr_linux_amd64.tar.gz, dapr_windows_amd64.zip)
3. Move it to your desired location.
   - For Linux/MacOS `/usr/local/bin` is recommended.
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
  upgrade        Upgrades a Dapr control plane installation in a cluster. Supported platforms: Kubernetes

Flags:
  -h, --help      help for dapr
  -v, --version   version for dapr

Use "dapr [command] --help" for more information about a command.
```

{{< button text="Next step: Initialize Dapr >>" page="install-dapr-selfhost" >}}