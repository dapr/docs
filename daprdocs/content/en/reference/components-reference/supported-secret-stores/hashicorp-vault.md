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
  - name: vaultKVUsePrefix # Optional. default: "true"
    value: "[true/false]"
  - name: enginePath # Optional. default: "secret"
    value: "secret"
  - name: vaultValueType # Optional. default: "map"
    value: "map"
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
| vaultKVUsePrefix | N | If false, vaultKVPrefix is forced to be empty. If the value is not given or set to true, vaultKVPrefix is used when accessing the vault. Setting it to false is needed to be able to use the BulkGetSecret method of the store.  | `"true"`, `"false"` |
| enginePath | N | The [engine](https://www.vaultproject.io/api-docs/secret/kv/kv-v2) path in vault. Defaults to `"secret"` | `"kv"`, `"any"` |
| vaultValueType | N | Vault value type. `map` means to parse the value into `map[string]string`, `text` means to use the value as a string. 'map' sets the `multipleKeyValuesPerSecret` behavior. `text' makes Vault behave as a secret store with name/value semantics.  Defaults to `"map"` | `"map"`, `"text"` |

## Setup Hashicorp Vault instance

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
Setup Hashicorp Vault using the Vault documentation: https://www.vaultproject.io/docs/install/index.html.
{{% /codetab %}}

{{% codetab %}}
For Kubernetes, you can use the Helm Chart: <https://github.com/hashicorp/vault-helm>.
{{% /codetab %}}

{{< /tabs >}}


## Multiple key-values per secret

HashiCorp Vault supports multiple key-values in a secret. While this behavior is ultimately dependent on the underlying [secret engine](https://www.vaultproject.io/docs/secrets#secrets-engines) configured by `enginePath`, it may change the way you store and retrieve keys from Vault. For instance, multiple key-values in a secret is the behavior exposed in the `secret` engine, the default engine configured by the `enginePath` field.

When retrieving secrets, a JSON payload is returned with the key names as fields and their respective values.

Suppose you add a secret to your Vault setup as follows:

```shell
vault kv put secret/dapr/mysecret firstKey=aValue secondKey=anotherValue thirdKey=yetAnotherDistinctValue
```

In the example above, the secret is named `mysecret` and it has 3 key-values under it. Retrieving it from Dapr would result in the following output:

```shell
$ curl http://localhost:3501/v1.0/secrets/my-hashicorp-vault/mysecret
```

```json
{
  "firstKey": "aValue",
  "secondKey": "anotherValue",
  "thirdKey": "yetAnotherDistinctValue"
}
```

Notice that the name of the secret (`mysecret`) is not repeated in the result. 


## Related links
- [Secrets building block]({{< ref secrets >}})
- [How-To: Retrieve a secret]({{< ref "howto-secrets.md" >}})
- [How-To: Reference secrets in Dapr components]({{< ref component-secrets.md >}})
- [Secrets API reference]({{< ref secrets_api.md >}})
