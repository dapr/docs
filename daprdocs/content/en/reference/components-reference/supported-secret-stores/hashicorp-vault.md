---
type: docs
title: "HashiCorp Vault"
linkTitle: "HashiCorp Vault"
description: Detailed information on the HashiCorp Vault secret store component
aliases:
  - "/operations/components/setup-secret-store/supported-secret-stores/hashicorp-vault/"
---

## Create the Vault component

To setup HashiCorp Vault secret store create a component of type `secretstores.hashicorp.vault`. See [this guide]({{< ref "setup-secret-store.md#apply-the-configuration" >}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: vault
  namespace: default
spec:
  type: secretstores.hashicorp.vault
  version: v1
  metadata:
  - name: vaultAddr
    value: [vault_address] # Optional. Default: "https://127.0.0.1:8200"
  - name: caCert # Optional. This or caPath or caPem
    value: "[ca_cert]"
  - name: caPath # Optional. This or CaCert or caPem
    value: "[path_to_ca_cert_file]"
  - name: caPem # Optional. This or CaCert or CaPath
    value : "[encoded_ca_cert_pem]"
  - name: skipVerify # Optional. Default: false
    value : "[skip_tls_verification]"
  - name: tlsServerName # Optional.
    value : "[tls_config_server_name]"
  - name: vaultTokenMountPath # Required if vaultToken not provided. Path to token file.
    value : "[path_to_file_containing_token]"
  - name: vaultToken # Required if vaultTokenMountPath not provided. Token value.
    value : "[path_to_file_containing_token]"
  - name: vaultKVPrefix # Optional. Default: "dapr"
    value : "[vault_prefix]"
```
{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a local secret store such as [Kubernetes secret store]({{< ref kubernetes-secret-store.md >}}) or a [local file]({{< ref file-secret-store.md >}}) to bootstrap secure key storage.
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details                        | Example             |
|--------------------|:--------:|--------------------------------|---------------------|
| vaultAddr      | N | The address of the Vault server. Defaults to `"https://127.0.0.1:8200"` | `"https://127.0.0.1:8200"` |
| caCert | N | Certificate Authority use only one of the options. The encoded cacerts to use | `"cacerts"` |
| caPath | N | Certificate Authority use only one of the options. The path to a CA cert file |  `"path/to/cacert/file"` |
| caPem | N | Certificate Authority use only one of the options. The encoded cacert pem to use | `"encodedpem"` |
| skipVerify | N | Skip TLS verification. Defaults to `"false"` | `"true"`, `"false"` |
| tlsServerName | N | TLS config server name | `"tls-server"` |
| vaultTokenMountPath | Y | Path to file containing token | `"path/to/file"` |
| vaultToken | Y | [Token](https://learn.hashicorp.com/tutorials/vault/tokens) for authentication within Vault.  | `"tokenValue"` |
| vaultKVPrefix | N | The prefix in vault. Defaults to `"dapr"` | `"dapr"`, `"myprefix"` |

## Setup Hashicorp Vault instance

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
Setup Hashicorp Vault using the Vault documentation: https://www.vaultproject.io/docs/install/index.html.
{{% /codetab %}}

{{% codetab %}}
For Kubernetes, you can use the Helm Chart: <https://github.com/hashicorp/vault-helm>.
{{% /codetab %}}

{{< /tabs >}}
## Related links
- [Secrets building block]({{< ref secrets >}})
- [How-To: Retrieve a secret]({{< ref "howto-secrets.md" >}})
- [How-To: Reference secrets in Dapr components]({{< ref component-secrets.md >}})
- [Secrets API reference]({{< ref secrets_api.md >}})
