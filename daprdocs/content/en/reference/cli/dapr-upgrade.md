---
type: docs
title: "upgrade CLI command reference"
linkTitle: "upgrade"
description: "Detailed information on the upgrade CLI command"
---

### Description

Upgrade or downgrade Dapr on supported hosting platforms.

{{% alert title="Warning" color="warning" %}}
Version steps should be done incrementally, including minor versions as you upgrade or downgrade.

Prior to downgrading, confirm components are backwards compatible and application code does ultilize APIs that are not supported in previous versions of Dapr.
{{% /alert %}}

### Supported platforms

- [Kubernetes]({{< ref kubernetes >}})

### Usage

```bash
dapr upgrade [flags]
```

### Flags

| Name                 | Environment Variable | Default  | Description                                                                                               |
| -------------------- | -------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `--help`, `-h`       |                      |          | Print this help message                                                                                   |
| `--kubernetes`, `-k` |                      | `false`  | Upgrade/Downgrade Dapr in a Kubernetes cluster                                                            |
| `--runtime-version`  |                      | `latest` | The version of the Dapr runtime to upgrade/downgrade to, for example: `1.0.0`                             |
| `--set`              |                      |          | Set values on the command line (can specify multiple or separate values with commas: key1=val1,key2=val2) |
|  `--image-registry`  |                    |          | Pulls container images required by Dapr from the given image registry |

### Examples

```bash
# Upgrade Dapr in Kubernetes to latest version
dapr upgrade -k

# Upgrade or downgrade to a specified version of Dapr runtime in Kubernetes
dapr upgrade -k --runtime-version 1.2

# Upgrade or downgrade to a specified version of Dapr runtime in Kubernetes with value set
dapr upgrade -k --runtime-version 1.2 --set global.logAsJson=true
```
```bash
# Upgrade or downgrade using private registry, if you are using private registry for hosting dapr images and have used it while doing `dapr init -k`
# Scenario 1 : dapr image hosted directly under root folder in private registry - 
dapr init -k --image-registry docker.io/username
# Scenario 2 : dapr image hosted under a new/different directory in private registry - 
dapr init -k --image-registry docker.io/username/<directory-name>
```

### Warning messages
This command can issue warning messages.

#### Root certificate renewal warning
If the mtls root certificate deployed to the Kubernetes cluster expires in under 30 days the following warning message is displayed:

```
Dapr root certificate of your Kubernetes cluster expires in <n> days. Expiry date: <date:time> UTC. 
Please see docs.dapr.io for certificate renewal instructions to avoid service interruptions.
```

### Related links

- [Upgrade Dapr on a Kubernetes cluster]({{< ref kubernetes-upgrade.md >}})