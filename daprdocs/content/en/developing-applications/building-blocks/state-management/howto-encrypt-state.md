---
type: docs
title: "How-To: Encrypt application state"
linkTitle: "How-To: Encrypt state"
weight: 450
description: "Automatically encrypt state and manage key rotations"

---

{{% alert title="Preview feature" color="warning" %}}
State store encryption is currently in [preview]({{< ref preview-features.md >}}).
{{% /alert %}}

## Introduction

Application state often needs to get encrypted at rest to provide stronger security in enterprise workloads or regulated environments. Dapr offers automatic client side encryption based on [AES256](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard).

In addition to automatic encryption, Dapr supports primary and secondary encryption keys to make it easier for developers and ops teams to enable a key rotation strategy.
This feature is supported by all Dapr state stores.

The encryption keys are fetched from a secret, and cannot be supplied as plaintext values on the `metadata` section.

## Enabling automatic encryption

1. Enable the state encryption preview feature using a standard [Dapr Configuration]({{< ref configuration-overview.md >}}):

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: stateconfig
spec:
  features:
    - name: State.Encryption
      enabled: true
```

2. Add the following `metadata` section to any Dapr supported state store:

```yaml
metadata:
- name: primaryEncryptionKey
  secretKeyRef:
    name: mysecret
    key: mykey # key is optional.
```

For example, this is the full YAML of a Redis encrypted state store

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
  - name: primaryEncryptionKey
    secretKeyRef:
      name: mysecret
      key: mykey
```

You now have a Dapr state store that's configured to fetch the encryption key from a secret named `mysecret`, containing the actual encryption key in a key named `mykey`.
The actual encryption key *must* be an AES256 encryption key. Dapr will error and exit if the encryption key is invalid.

*Note that the secret store does not have to support keys*

## Key rotation

To support key rotation, Dapr provides a way to specify a secondary encryption key:

```yaml
metadata:
- name: primaryEncryptionKey
    secretKeyRef:
      name: mysecret
      key: mykey
- name: secondaryEncryptionKey
    secretKeyRef:
      name: mysecret2
      key: mykey2
```

When Dapr starts, it will fetch the secrets containing the encryption keys listed in the `metadata` section. Dapr knows which state item has been encrypted with which key automatically, as it appends the `secretKeyRef.name` field to the end of the actual state key.

To rotate a key, simply change the `primaryEncryptionKey` to point to a secret containing your new key, and move the old primary encryption key to the `secondaryEncryptionKey`. New data will be encrypted using the new key, and old data that's retrieved will be decrypted using the secondary key. Any updates to data items encrypted using the old key will be re-encrypted using the new key.
