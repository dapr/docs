---
type: docs
title: "version CLI command reference"
linkTitle: "version"
description: "Print Dapr runtime and CLI version."
---

### Description

Print the version for `dapr` CLI and `daprd` executables either in normal or JSON formats.

### Supported platforms

- [Self-Hosted]({{< ref self-hosted >}})

### Usage

```bash
dapr version [flags]
```

### Flags

| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--help`, `-h` | | | Print this help message |
| `--output`, `-o` | | | Output format (options: json) |

### Examples 

```bash
# Version for Dapr CLI and runtime
dapr version --output json
```

### Related facts

You can get `daprd` version directly by invoking `daprd --version` command.


You can also get the normal version output by running `dapr --version` flag.
