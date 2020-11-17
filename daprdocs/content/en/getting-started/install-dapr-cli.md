---
type: docs
title: "How-To: Install Dapr CLI"
linkTitle: "Install Dapr CLI"
weight: 10
description: "Install the Dapr CLI to get started with Dapr"
---

## Dapr CLI installation scripts

Begin by downloading and installing the Dapr CLI. This will be used to initialize your environment on your desired platform.

{{< tabs Linux Windows MacOS Binaries>}}

{{% codetab %}}
This command will install the latest linux Dapr CLI to `/usr/local/bin`:
```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash
```
{{% /codetab %}}

{{% codetab %}}
This command will install the latest windows Dapr cli to `%USERPROFILE%\.dapr\` and add this directory to User PATH environment variable:
```powershell
powershell -Command "iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1 | iex"
```
Verify by opening Explorer and entering `%USERPROFILE%\.dapr\` into the address bar. You should see folders for bin, componenets and a config file.
{{% /codetab %}}

{{% codetab %}}
This command will install the latest darwin Dapr CLI to `/usr/local/bin`:
```bash
curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | /bin/bash
```

Or you can install via [Homebrew](https://brew.sh):
```bash
brew install dapr/tap/dapr-cli
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
- [Init Dapr locally]({{< ref install-dapr.md >}})
- [Init Dapr on Kubernetes]({{< ref install-dapr-kubernetes.md >}})
- [Try a Dapr Quickstart]({{< ref quickstarts.md >}})