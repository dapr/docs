---
type: docs
title: "HashiCorp Vault"
linkTitle: "HashiCorp Vault"
description: Detailed information on the HashiCorp Vault secret store component
---

## Setup Hashicorp Vault instance

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
Setup Hashicorp Vault using the Vault documentation: https://www.vaultproject.io/docs/install/index.html.
{{% /codetab %}}

{{% codetab %}}
For Kubernetes, you can use the Helm Chart: <https://github.com/hashicorp/vault-helm>.
{{% /codetab %}}

{{< /tabs >}}


## Create the Vault component

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: vault
  namespace: default
spec:
  type: secretstores.hashicorp.vault
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
  - name: vaultTokenMountPath # Required. Path to token file.
    value : "[path_to_file_containing_token]"
  - name: vaultKVPrefix # Optional. Default: "dapr"
    value : "[vault_prefix]"
```

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.
{{% /codetab %}}

{{% codetab %}}
To deploy in Kubernetes, save the file above to `vault.yaml` and then run:

```bash
kubectl apply -f vault.yaml
```
{{% /codetab %}}

{{< /tabs >}}


## Example

This example shows you how to take the Redis password from the Vault secret store.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: default
spec:
  type: state.redis
  metadata:
  - name: redisHost
    value: "[redis]:6379"
  - name: redisPassword
    secretKeyRef:
      name: redisPassword
      key: redisPassword
auth:
    secretStore: vault
```

## Related links
- [Secrets building block]({{< ref secrets >}})
- [How-To: Retreive a secret]({{< ref "howto-secrets.md" >}})
- [How-To: Reference secrets in Dapr components]({{< ref component-secrets.md >}})
- [Secrets API reference]({{< ref secrets_api.md >}})