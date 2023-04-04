---
type: docs
title: "Cryptography API reference"
linkTitle: "Cryptography API"
description: "Detailed documentation on the cryptography API"
weight: 900
---
## Component format

Todo: update component format to correct format for cryptography

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

Todo: organize the following into the correct format for an API doc.

The new building block would feature 7 APIs:

/encrypt: encrypts arbitrary data using a key stored in the vault. It supports symmetric and asymmetric ciphers, depending on the type of key in use (and the types of keys supported by the vault).
/decrypt: decrypts arbitrary data, performing the opposite of what /encrypt does.
/wrapkey: wraps keys using other keys stored in the vault. This is exactly like encrypting data, but it expects inputs to be formatted as keys (for example formatted as JSON Web Key) and it exposes additional algorithms not available when encrypting general data (like AES-KW)
/unwrapkey: un-wraps (decrypts) keys, performing the opposite of what /wrap does
/sign: signs an arbitrary message using an asymmetric key stored in the vault (we could also consider offering HMAC here, using symmetric keys, although not widely supported by the vault services)
/verify: verifies a digital signature over an arbitrary message, using an asymmetric key stored in the vault (same: we may be able to offer HMAC too)
/getkey: this can be used only with asymmetric keys stored in the vault, and returns the public part of the key
