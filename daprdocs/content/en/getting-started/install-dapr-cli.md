---
type: docs
title: "How-To: Install Dapr CLI"
linkTitle: "Install Dapr CLI"
weight: 10
description: "Install the Dapr CLI to get started with Dapr"
---

## Dapr CLI installation scripts

Begin by downloading and installing the Dapr CLI for v1.0.0-rc.2. This is used to initialize your environment on your desired platform.

{{% alert title="Note" color="warning" %}}
This command downloads and install Dapr CLI v1.0-rc.2. To install v0.11, the latest release prior to the release candidates for the [upcoming v1.0 release](https://blog.dapr.io/posts/2020/10/20/the-path-to-v.1.0-production-ready-dapr/), please visit the [v0.11 docs](https://docs.dapr.io).
{{% /alert %}}

{{< tabs Linux Windows MacOS Binaries>}}

{{% codetab %}}
This command installs the latest linux Dapr CLI to `/usr/local/bin`:
```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash -s 1.0.0-rc.2
```
{{% /codetab %}}

{{% codetab %}}
This command installs the latest windows Dapr cli to `C:\dapr` and add this directory to User PATH environment variable. Run in Command Prompt:
```powershell
powershell -Command "$script=iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1; $block=[ScriptBlock]::Create($script); invoke-command -ScriptBlock $block -ArgumentList 1.0.0-rc.2"
```
Verify by opening Explorer and entering `C:\dapr` into the address bar. You should see folders for bin, components, and a config file.
{{% /codetab %}}

{{% codetab %}}
This command installs the latest darwin Dapr CLI to `/usr/local/bin`:
```bash
curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | /bin/bash -s 1.0.0-rc.2
```

Or you can install via [Homebrew](https://brew.sh):
```bash
brew install dapr/tap/dapr-cli@1.0.0-rc.2
```
{{% /codetab %}}

{{% codetab %}}
Each release of Dapr CLI includes various OSes and architectures. These binary versions can be manually downloaded and installed.

1. Download the desired Dapr CLI from the latest [Dapr Release](https://github.com/dapr/cli/releases)
2. Unpack it (e.g. dapr_linux_amd64.tar.gz, dapr_windows_amd64.zip)
3. Move it to your desired location.
   - For Linux/MacOS - `/usr/local/bin`
   - For Windows, create a directory and add this to your System PATH. For example create a directory called `c:\dapr` and add this directory to your path, by editing your system environment variable.
{{% /codetab %}}
{{< /tabs >}}

Learn more about the CLI and available commands in the [CLI docs]( {{< ref cli >}}).

## Next steps
- [Init Dapr locally]({{< ref install-dapr-selfhost.md >}})
- [Init Dapr on Kubernetes]({{< ref install-dapr-kubernetes.md >}})

