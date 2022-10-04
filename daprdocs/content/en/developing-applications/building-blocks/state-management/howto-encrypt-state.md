---
type: docs
title: "How-To: Encrypt application state"
linkTitle: "How-To: Encrypt state"
weight: 450
description: "Automatically encrypt state and manage key rotations"

---

Encrypt application state at rest to provide stronger security in enterprise workloads or regulated environments. Dapr offers automatic client-side encryption based on [AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) in [Galois/Counter Mode (GCM)](https://en.wikipedia.org/wiki/Galois/Counter_Mode), supporting keys of 128, 192, and 256-bits.

In addition to automatic encryption, Dapr supports primary and secondary encryption keys to make it easier for developers and ops teams to enable a key rotation strategy. This feature is supported by all Dapr state stores.

The encryption keys are always fetched from a secret, and cannot be supplied as plaintext values on the `metadata` section.

## Enabling automatic encryption

Add the following `metadata` section to any Dapr supported state store:

```yaml
metadata:
- name: primaryEncryptionKey
  secretKeyRef:
    name: mysecret
    key: mykey # key is optional.
```

For example, this is the full YAML of a Redis encrypted state store:

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

You now have a Dapr state store configured to fetch the encryption key from a secret named `mysecret`, containing the actual encryption key in a key named `mykey`.

The actual encryption key *must* be a valid, hex-encoded encryption key. While 192-bit and 256-bit keys are supported, it's recommended you use 128-bit encryption keys. Dapr errors and exists if the encryption key is invalid.

For example, you can generate a random, hex-encoded 128-bit (16-byte) key with:

```sh
openssl rand 16 | hexdump -v -e '/1 "%02x"'
# Result will be similar to "cb321007ad11a9d23f963bff600d58e0"
```

*Note that the secret store does not have to support keys.*

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

When Dapr starts, it fetches the secrets containing the encryption keys listed in the `metadata` section. Dapr automatically knows which state item has been encrypted with which key, as it appends the `secretKeyRef.name` field to the end of the actual state key.

To rotate a key, 

1. Change the `primaryEncryptionKey` to point to a secret containing your new key.
1. Move the old primary encryption key to the `secondaryEncryptionKey`. 

New data will be encrypted using the new key, and any retrieved old data  will be decrypted using the secondary key. 

Any updates to data items encrypted with the old key will be re-encrypted using the new key. 

{{% alert title="Note" color="primary" %}}
when you rotate a key, data encrypted with the old key is not automatically re-encrypted unless your application writes it again. If you remove the rotated key (the now-secondary encryption key), you will not be able to access data that was encrypted with that.

{{% /alert %}}

## Related links

- [Security overview]({{< ref "security-concept.md" >}})
- [State store query API implementation guide](https://github.com/dapr/components-contrib/blob/master/state/README.md#implementing-state-query-api)
- [State store components]({{< ref "supported-state-stores.md" >}})
