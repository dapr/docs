---
type: docs
title: "mtls CLI command reference"
linkTitle: "mtls"
description: "Detailed information on the mtls CLI command"
---

## Description

Check if mTLS is enabled

## Usage

```bash
dapr mtls [flags]
dapr mtls [command]
```

## Available Commands

```txt
expiry      Checks the expiry of the root certificate
export      Export the root CA, issuer cert and key from Kubernetes to local files
```

## Flags

| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--help`, `-h` | | | Print this help message |
| `--kubernetes`, `-k` | | `false` | Check if mTLS is enabled in a Kubernetes cluster |
