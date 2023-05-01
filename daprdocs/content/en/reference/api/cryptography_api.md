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
| `metadata.name` | The unique name of the workflow component. |
| `spec.type` | The component type used. Example: `crypto.jwks`, `crypto.azure.keyvault` |
| `spec.metadata` | Additional metadata parameters specified by workflow component |

[Learn more about the available cryptography components.]({{< ref supported-cryptography >}})

## Supported cryptography APIs

The cryptography building block supports two high-level APIs:
- `Encrypt` 
- `Decrypt` 

These APIs allow you to encrypt and decrypt files of arbitrary lenght (up to 256TB) while working on a straem of data.

### Encrypt

To encrypt data, implement the `Encrypt` API:

```go
// Encrypt the data using Dapr
out, err := sdkClient.Encrypt(context.Background(), rf, dapr.EncryptOptions{
	// These are the 3 required parameters
	ComponentName: "mycryptocomponent",
	KeyName:        "mykey",
	Algorithm:     "RSA",
})
```

### Decrypt

To decrypt data, implement the `Decrypt` API:

```go
// Decrypt the data using Dapr
out, err := sdkClient.Decrypt(context.Background(), rf, dapr.EncryptOptions{
	// Only required option is the component name
	ComponentName: "mycryptocomponent",
})
```

## Next steps
- [Cryptography building block documentation]({{< ref cryptography >}})
- [Cryptography components]({{< ref supported-cryptography >}})