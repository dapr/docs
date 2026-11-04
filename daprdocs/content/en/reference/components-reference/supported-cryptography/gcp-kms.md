---
type: docs
title: "GCP Cloud KMS"
linkTitle: "GCP Cloud KMS"
description: Detailed information on the GCP Cloud KMS cryptography component
---

## Component format

A Dapr `crypto.yaml` component file has the following structure:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: gcpkms
spec:
  type: crypto.gcp.kms
  version: v1
  metadata:
  - name: project_id
    value: <replace-with-project-id>
  - name: location
    value: global
  - name: keyRing
    value: <replace-with-key-ring-name>
  # See the GCP credentials section below for all authentication options
  - name: type
    value: service_account
  - name: private_key_id
    value: <replace-with-private-key-id>
  - name: client_email
    value: <replace-with-email>
  - name: private_key
    value: <replace-with-private-key>
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a local secret store such as [Kubernetes secret store]({{% ref kubernetes-secret-store.md %}}) or a [local file]({{% ref file-secret-store.md %}}) to bootstrap secure key storage.
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `project_id` | Y | The project ID that contains the key ring. | `"my-project"` |
| `location` | Y | Location of the key ring. | `"global"`, `"us-east1"` |
| `keyRing` | Y | Name of the Cloud KMS key ring that contains the keys used by this component. | `"my-key-ring"` |
| `requestTimeout` | N | Timeout for network requests to Cloud KMS. Default: `30s` | `"10s"` |
| Auth metadata | N | If using explicit credentials, the fields from the service account JSON document, as described in [GCP credentials](#gcp-credentials) | |

## GCP credentials

Since the GCP Cloud KMS component uses the GCP Go Client Libraries, by default it authenticates using **Application Default Credentials**. This is explained further in the [Authenticate to GCP Cloud services using client libraries](https://cloud.google.com/docs/authentication/client-libraries) guide. Also, see how to [Set up Application Default Credentials](https://cloud.google.com/docs/authentication/provide-credentials-adc).

Alternatively, provide the service account JSON fields explicitly and set `type` to `service_account`. Use the same metadata property names as the other GCP components: `type`, `private_key_id`, `private_key`, `client_email`, `client_id`, `auth_uri`, `token_uri`, `auth_provider_x509_cert_url`, and `client_x509_cert_url`.

The identity used by the component needs the `cloudkms.cryptoKeyVersions.useToEncrypt`, `cloudkms.cryptoKeyVersions.useToDecrypt`, `cloudkms.cryptoKeyVersions.useToSign`, and `cloudkms.cryptoKeyVersions.viewPublicKey` permissions on the keys it uses, depending on the operations your application performs. The predefined `roles/cloudkms.cryptoOperator` role includes all of them.

All asymmetric operations require `cloudkms.cryptoKeyVersions.viewPublicKey`, including signing and asymmetric decryption, because the component checks the requested algorithm against the versioned public key before proceeding. If you use a narrower signing or decryption role, also grant `roles/cloudkms.publicKeyViewer` on the key. `roles/cloudkms.signerVerifier` already includes public-key access. See the [Cloud KMS permissions and roles](https://cloud.google.com/kms/docs/reference/permissions-and-roles) for least-privilege role selection.

## Referencing keys

Keys are referenced by their name within the configured key ring, optionally followed by a key version: `mykey` or `mykey/1`.

Symmetric encryption with `mykey` uses the current primary version. Encryption or wrapping with `mykey/3` uses that specific version, even if a different version is primary. Symmetric decryption and unwrapping always select the version embedded in the ciphertext and address the parent CryptoKey; a supplied version suffix does not restrict which ciphertext version can be decrypted.

Asymmetric encryption, decryption, signing, verification, and public-key retrieval always require a key version. Wrapping and unwrapping require a version when the wrapping key is asymmetric; symmetric wrapping follows the symmetric encryption and decryption rules above.

## Supported algorithms

| Dapr algorithm | Cloud KMS key algorithm |
|----------------|-------------------------|
| `GOOGLE_SYMMETRIC_ENCRYPTION` | `GOOGLE_SYMMETRIC_ENCRYPTION` |
| `RSA-OAEP` | `RSA_DECRYPT_OAEP_*_SHA1` |
| `RSA-OAEP-256` | `RSA_DECRYPT_OAEP_*_SHA256` |
| `RSA-OAEP-512` | `RSA_DECRYPT_OAEP_4096_SHA512` |
| `RS256` / `RS512` | `RSA_SIGN_PKCS1_*_SHA256` / `RSA_SIGN_PKCS1_4096_SHA512` |
| `PS256` / `PS512` | `RSA_SIGN_PSS_*_SHA256` / `RSA_SIGN_PSS_4096_SHA512` |
| `ES256` / `ES384` | `EC_SIGN_P256_SHA256` / `EC_SIGN_P384_SHA384` |
| `EdDSA` | `EC_SIGN_ED25519` |

The requested asymmetric algorithm must match the key version's algorithm, including its purpose, padding scheme, and hash. For example, `RSA-OAEP` is rejected for an `RSA_DECRYPT_OAEP_2048_SHA256` key, and `RS256` is rejected for a PSS signing key. Unknown or incompatible algorithms are rejected before the crypto operation.

A few behaviors follow from how Cloud KMS implements these algorithms:

- Symmetric keys use the `GOOGLE_SYMMETRIC_ENCRYPTION` algorithm identifier, which has no JOSE equivalent because Cloud KMS generates the nonce itself and returns the authentication tag as part of the ciphertext. Decryption always resolves the key version from the ciphertext.
- Non-empty nonces are rejected for encryption, decryption, wrapping, and unwrapping. Separate authentication tags are rejected for decryption and unwrapping; Cloud KMS carries the symmetric authentication tag inside its ciphertext.
- Encrypting with an asymmetric key happens inside Dapr, using the public key retrieved from Cloud KMS, because Cloud KMS only exposes asymmetric *decryption*. Public keys of a pinned key version are cached, since key versions are immutable.
- Cloud KMS does not accept an OAEP label, so associated data is rejected when encrypting or decrypting with an asymmetric key.
- Only symmetric keys can be wrapped, so that the unwrapped key can be reconstructed unambiguously.
- Cloud KMS has no verification API, so signatures are verified inside Dapr with the public key.

## Related links

- [Cryptography building block]({{% ref cryptography %}})
