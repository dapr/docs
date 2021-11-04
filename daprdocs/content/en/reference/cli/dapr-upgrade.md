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

### Examples

```bash
# Upgrade Dapr in Kubernetes to latest version
dapr upgrade -k

# Upgrade or downgrade to a specified version of Dapr runtime in Kubernetes
dapr upgrade -k --runtime-version 1.2

# Upgrade or downgrade to a specified version of Dapr runtime in Kubernetes with value set
dapr upgrade -k --runtime-version 1.2 --set global.logAsJson=true
```

### Related links

- [Upgrade Dapr on a Kubernetes cluster]({{< ref kubernetes-upgrade.md >}})