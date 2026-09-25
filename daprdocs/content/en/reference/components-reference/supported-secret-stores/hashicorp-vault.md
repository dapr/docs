---
type: docs
title: "HashiCorp Vault"
linkTitle: "HashiCorp Vault"
description: Detailed information on the HashiCorp Vault secret store component
aliases:
  - "/operations/components/setup-secret-store/supported-secret-stores/hashicorp-vault/"
---

## Create the Vault component

To setup HashiCorp Vault secret store create a component of type `secretstores.hashicorp.vault`. See [this guide]({{% ref "setup-secret-store.md#apply-the-configuration" %}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{% ref component-secrets.md %}}) to retrieve and use the secret with Dapr components.

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
  - name: vaultAuthMethod # Optional. Default: "token"
    value: "token"
  - name: vaultTokenMountPath # Required if vaultAuthMethod is "token" and vaultToken not provided. Path to token file.
    value : "[path_to_file_containing_token]"
  - name: vaultToken # Required if vaultAuthMethod is "token" and vaultTokenMountPath not provided. Token value.
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
The above example uses secrets as plain strings. It is recommended to use a local secret store such as [Kubernetes secret store]({{% ref kubernetes-secret-store.md %}}) or a [local file]({{% ref file-secret-store.md %}}) to bootstrap secure key storage.
{{% /alert %}}

## Kubernetes authentication

When running on Kubernetes, you can set `vaultAuthMethod` to `kubernetes` instead of `token`. In this mode, the component authenticates itself directly against Vault's [Kubernetes Auth Method](https://developer.hashicorp.com/vault/docs/auth/kubernetes) using the pod's own service account token, and keeps the resulting session renewed in the background for as long as the component is running. This means you don't need to run a [Vault Agent Injector](https://developer.hashicorp.com/vault/docs/deploy/kubernetes/injector) sidecar, or manage and rotate a static token yourself.

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
    value: [vault_address]
  - name: vaultAuthMethod
    value: "kubernetes"
  - name: vaultKubernetesRole # Required when vaultAuthMethod is "kubernetes".
    value: "[vault_role_name]"
  - name: vaultKubernetesMountPath # Optional. Default: "kubernetes"
    value: "kubernetes"
  - name: vaultServiceAccountTokenPath # Optional. Default: "/var/run/secrets/kubernetes.io/serviceaccount/token"
    value: "/var/run/secrets/kubernetes.io/serviceaccount/token"
```

`vaultToken` and `vaultTokenMountPath` must not be set when using `vaultAuthMethod: kubernetes`.

Before this works, Vault itself needs to know about your cluster and about the role your Dapr app's pod is allowed to use. This is a one-time setup on the Vault side, done with the [Vault CLI](https://developer.hashicorp.com/vault/docs/install), for example:

```shell
# Enable the Kubernetes auth method (skip if already enabled).
vault auth enable kubernetes

# Point it at your cluster's API server. Run from within a pod that already
# has a Kubernetes service account token and CA cert mounted (for example,
# the Vault server pod itself) and Vault will pick up the reviewer JWT and
# CA cert from its own environment.
vault write auth/kubernetes/config \
  kubernetes_host="https://kubernetes.default.svc:443"

# A policy granting access to the secrets your app needs.
vault policy write dapr-app - <<EOF
path "secret/data/dapr/*" {
  capabilities = ["read"]
}
path "secret/metadata/dapr/*" {
  capabilities = ["list"]
}
EOF

# A role binding that policy to your app's ServiceAccount and namespace.
vault write auth/kubernetes/role/dapr-app \
  bound_service_account_names=dapr-app \
  bound_service_account_namespaces=default \
  policies=dapr-app \
  ttl=1h
```

`vaultKubernetesRole` in the component metadata must match the role name you created (`dapr-app` above), and your Dapr app's pod must run under the `bound_service_account_names`/`bound_service_account_namespaces` you configured.

## Spec metadata fields

| Field              | Required | Details                        | Example             |
|--------------------|:--------:|--------------------------------|---------------------|
| vaultAddr      | N | The address of the Vault server. Defaults to `"https://127.0.0.1:8200"` | `"https://127.0.0.1:8200"` |
| caPem | N | The inlined contents of the CA certificate to use, in PEM format. If defined, takes precedence over `caPath` and `caCert`.  | See below |
| caPath | N | The path to a folder holding the CA certificate file to use, in PEM format. If the folder contains multiple files, only the first file found will be used. If defined, takes precedence over `caCert`.  |  `"path/to/cacert/holding/folder"` |
| caCert | N | The path to the CA certificate to use, in PEM format. | `""path/to/cacert.pem"` |
| skipVerify | N | Skip TLS verification. Defaults to `"false"` | `"true"`, `"false"` |
| tlsServerName | N | The name of the server requested during TLS handshake in order to support virtual hosting. This value is also used to verify the TLS certificate presented by Vault server. | `"tls-server"` |
| vaultAuthMethod | N | The authentication method to use against Vault. `token` uses a static token or a token mounted to a file. `kubernetes` authenticates natively using the Kubernetes Auth Method and the pod's service account token, without requiring a Vault Agent Injector sidecar, and automatically renews/re-authenticates in the background. Defaults to `"token"` | `"token"`, `"kubernetes"` |
| vaultTokenMountPath | N | Path to file containing token. Required when `vaultAuthMethod` is `token` and `vaultToken` is not set. | `"path/to/file"` |
| vaultToken | N | [Token](https://learn.hashicorp.com/tutorials/vault/tokens) for authentication within Vault. Required when `vaultAuthMethod` is `token` and `vaultTokenMountPath` is not set. | `"tokenValue"` |
| vaultKubernetesRole | N | The Vault role to authenticate as when `vaultAuthMethod` is `kubernetes`. Required in that case. | `"my-app-role"` |
| vaultKubernetesMountPath | N | The mount path of the Kubernetes auth method in Vault, if not mounted at the default `kubernetes` path. Defaults to `"kubernetes"` | `"kubernetes"` |
| vaultServiceAccountTokenPath | N | Path to the Kubernetes service account token used to authenticate, overriding the default projected service account token path. Defaults to `"/var/run/secrets/kubernetes.io/serviceaccount/token"` | `"/var/run/secrets/kubernetes.io/serviceaccount/token"` |
| vaultKVPrefix | N | The prefix in vault. Defaults to `"dapr"` | `"dapr"`, `"myprefix"` |
| vaultKVUsePrefix | N | If false, vaultKVPrefix is forced to be empty. If the value is not given or set to true, vaultKVPrefix is used when accessing the vault. Setting it to false is needed to be able to use the BulkGetSecret method of the store.  | `"true"`, `"false"` |
| enginePath | N | The [engine](https://www.vaultproject.io/api-docs/secret/kv/kv-v2) path in vault. Defaults to `"secret"` | `"kv"`, `"any"` |
| vaultValueType | N | Vault value type. `map` means to parse the value into `map[string]string`, `text` means to use the value as a string. 'map' sets the `multipleKeyValuesPerSecret` behavior. `text` makes Vault behave as a secret store with name/value semantics.  Defaults to `"map"` | `"map"`, `"text"` |

## Optional per-request metadata properties

The following [optional query parameters]({{% ref "secrets_api#query-parameters" %}}) can be provided to Hashicorp Vault secret store component:

Query Parameter | Description
--------- | -----------
`metadata.version_id` | Version for the given secret key.

## Setup Hashicorp Vault instance

{{< tabpane text=true >}}

{{% tab "Self-Hosted" %}}
Setup Hashicorp Vault using the Vault documentation: https://www.vaultproject.io/docs/install/index.html.
{{% /tab %}}

{{% tab "Kubernetes" %}}
For Kubernetes, you can use the Helm Chart: <https://github.com/hashicorp/vault-helm>.
{{% /tab %}}

{{< /tabpane >}}


## Multiple key-values per secret

HashiCorp Vault supports multiple key-values in a secret. While this behavior is ultimately dependent on the underlying [secret engine](https://www.vaultproject.io/docs/secrets#secrets-engines) configured by `enginePath`, it may change the way you store and retrieve keys from Vault. For instance, multiple key-values in a secret is the behavior exposed in the `secret` engine, the default engine configured by the `enginePath` field.

When retrieving secrets, a JSON payload is returned with the key names as fields and their respective values.

Suppose you add a secret to your Vault setup as follows:

```shell
vault kv put secret/dapr/mysecret firstKey=aValue secondKey=anotherValue thirdKey=yetAnotherDistinctValue
```

In the example above, the secret is named `mysecret` and it has 3 key-values under it. 
Observe that the secret is created under a `dapr` prefix, as this is the default value for the `vaultKVPrefix` flag.
Retrieving it from Dapr would result in the following output:

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


## TLS Server verification 

The fields `skipVerify`, `tlsServerName`, `caCert`, `caPath`, and `caPem` control if and how Dapr verifies the vault server's certificate while connecting using TLS/HTTPS.

### Inline CA PEM caPem

The `caPem` field value should be the contents of the PEM CA certificate you want to use. Given PEM certificates are made of multiple lines, defining that value might seem challenging at first. YAML allows for a few ways of [defining a multiline values](https://yaml-multiline.info/).

Below is one way to define a `caPem` field.

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
    value: https://127.0.0.1:8200
  - name: caPem
    value: |-
          -----BEGIN CERTIFICATE-----
          << the rest of your PEM file content's here, indented appropriately. >>
          -----END CERTIFICATE-----
```

## Secret rotation

Secrets retrieved through the [secrets API]({{% ref secrets_api.md %}}) are read from Vault on every request, so applications calling the API always receive the current version of a secret.

However, secrets referenced in a component definition with `secretKeyRef` and `auth.secretStore` pointing to a Vault secret store are only resolved when the component is initialized. Rotating the secret in Vault does not trigger a reload of the component, which keeps using the old value until the Dapr sidecar is restarted or the component manifest is changed. Read [updating referenced secrets]({{% ref "component-secrets.md#updating-referenced-secrets" %}}) for more details.

## Related links
- [Secrets building block]({{% ref secrets %}})
- [How-To: Retrieve a secret]({{% ref "howto-secrets.md" %}})
- [How-To: Reference secrets in Dapr components]({{% ref component-secrets.md %}})
- [Secrets API reference]({{% ref secrets_api.md %}})
