---
type: docs
title: "mtls export CLI command reference"
linkTitle: "mtls export"
description: "Detailed information on the mtls export CLI command"
---

## Description

Export the root CA, issuer cert and key from Kubernetes to local files

## Usage
```bash
dapr mtls export [flags]
```

## Examples

### Check expiry of Kubernetes certs
```bash 
dapr mtls export -o ./certs
```

## Flags

| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--help`, `-h` | | | help for export |
| `--out`, `-o` | | current directory | The output directory path to save the certs |
