---
type: docs
title: "Cryptography API reference"
linkTitle: "Cryptography API"
description: "Detailed documentation on the cryptography API"
weight: 900
---
## Component format

A Dapr `crypto.yaml` component file has the following structure:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: crypto.<TYPE>
  version: v1.0-alpha1
  metadata:
  - name: <NAME>
    value: <VALUE>
 ```
| Setting | Description |
| ------- | ----------- |
| `metadata.name` | The name of the workflow component. |
| `spec/metadata` | Additional metadata parameters specified by workflow component |



## Supported workflow methods
