---
type: docs
title: "Credentials metadata fields"
linkTitle: "Credentials metadata"
weight: 20000
description: "The credentials metadata fields and corresponding values"
---

## Credentials metadata fields

To authenticate with Azure AD, you will need to add the following credentials as values in the metadata for your [Dapr component]({{< ref "#example-usage-in-a-dapr-component" >}}). 

### Metadata options

Depending on how you've passed credentials to your Dapr services, you have multiple metadata options. 

#### Authenticating using client credentials

| Field               | Required | Details                              | Example                                      |
|---------------------|----------|--------------------------------------|----------------------------------------------|
| `azureTenantId`     | Y        | ID of the Azure AD tenant            | `"cd4b2887-304c-47e1-b4d5-65447fdd542b"`     |
| `azureClientId`     | Y        | Client ID (application ID)           | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"`     |
| `azureClientSecret` | Y        | Client secret (application password) | `"Ecy3XG7zVZK3/vl/a2NSB+a1zXLa8RnMum/IgD0E"` |

When running on Kubernetes, you can also use references to Kubernetes secrets for any or all of the values above.

#### Authenticating using a PFX certificate

| Field | Required | Details | Example |
|--------|--------|--------|--------|
| `azureTenantId` | Y | ID of the Azure AD tenant | `"cd4b2887-304c-47e1-b4d5-65447fdd542b"` |
| `azureClientId` | Y | Client ID (application ID) | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"` |
| `azureCertificate` | One of `azureCertificate` and `azureCertificateFile` | Certificate and private key (in PFX/PKCS#12 format) | `"-----BEGIN PRIVATE KEY-----\n MIIEvgI... \n -----END PRIVATE KEY----- \n -----BEGIN CERTIFICATE----- \n MIICoTC... \n -----END CERTIFICATE-----` |
| `azureCertificateFile` | One of `azureCertificate` and `azureCertificateFile` | Path to the PFX/PKCS#12 file containing the certificate and private key | `"/path/to/file.pem"` |
| `azureCertificatePassword` | N | Password for the certificate if encrypted | `"password"` |

When running on Kubernetes, you can also use references to Kubernetes secrets for any or all of the values above.

#### Authenticating with Managed Service Identities (MSI)

| Field           | Required | Details                    | Example                                  |
|-----------------|----------|----------------------------|------------------------------------------|
| `azureClientId` | N        | Client ID (application ID) | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"` |

Using MSI, you're not required to specify any value, although you may pass `azureClientId` if needed.

### Aliases

For backwards-compatibility reasons, the following values in the metadata are supported as aliases. Their use is discouraged.

| Metadata key               | Aliases (supported but deprecated) |
|----------------------------|------------------------------------|
| `azureTenantId`            | `spnTenantId`, `tenantId`          |
| `azureClientId`            | `spnClientId`, `clientId`          |
| `azureClientSecret`        | `spnClientSecret`, `clientSecret`  |
| `azureCertificate`         | `spnCertificate`                   |
| `azureCertificateFile`     | `spnCertificateFile`               |
| `azureCertificatePassword` | `spnCertificatePassword`           |


### Example usage in a Dapr component

In this example, you will set up an Azure Key Vault secret store component that uses Azure AD to authenticate.

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}

To use a **client secret**, create a file called `azurekeyvault.yaml` in the components directory, filling in with the details from the above setup process:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: azurekeyvault
  namespace: default
spec:
  type: secretstores.azure.keyvault
  version: v1
  metadata:
  - name: vaultName
    value: "[your_keyvault_name]"
  - name: azureTenantId
    value: "[your_tenant_id]"
  - name: azureClientId
    value: "[your_client_id]"
  - name: azureClientSecret
    value : "[your_client_secret]"
```

If you want to use a **certificate** saved on the local disk, instead, use:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: azurekeyvault
  namespace: default
spec:
  type: secretstores.azure.keyvault
  version: v1
  metadata:
  - name: vaultName
    value: "[your_keyvault_name]"
  - name: azureTenantId
    value: "[your_tenant_id]"
  - name: azureClientId
    value: "[your_client_id]"
  - name: azureCertificateFile
    value : "[pfx_certificate_file_fully_qualified_local_path]"
```
{{% /codetab %}}

{{% codetab %}}
In Kubernetes, you store the client secret or the certificate into the Kubernetes Secret Store and then refer to those in the YAML file.

To use a **client secret**:

1. Create a Kubernetes secret using the following command:

   ```bash
   kubectl create secret generic [your_k8s_secret_name] --from-literal=[your_k8s_secret_key]=[your_client_secret]
   ```

    - `[your_client_secret]` is the application's client secret as generated above
    - `[your_k8s_secret_name]` is secret name in the Kubernetes secret store
    - `[your_k8s_secret_key]` is secret key in the Kubernetes secret store

1. Create an `azurekeyvault.yaml` component file.

    The component yaml refers to the Kubernetes secretstore using `auth` property and  `secretKeyRef` refers to the client secret stored in the Kubernetes secret store.

    ```yaml
    apiVersion: dapr.io/v1alpha1
    kind: Component
    metadata:
      name: azurekeyvault
      namespace: default
    spec:
      type: secretstores.azure.keyvault
      version: v1
      metadata:
      - name: vaultName
        value: "[your_keyvault_name]"
      - name: azureTenantId
        value: "[your_tenant_id]"
      - name: azureClientId
        value: "[your_client_id]"
      - name: azureClientSecret
        secretKeyRef:
          name: "[your_k8s_secret_name]"
          key: "[your_k8s_secret_key]"
    auth:
      secretStore: kubernetes
    ```

1. Apply the `azurekeyvault.yaml` component:

    ```bash
    kubectl apply -f azurekeyvault.yaml
    ```

To use a **certificate**:

1. Create a Kubernetes secret using the following command:

   ```bash
   kubectl create secret generic [your_k8s_secret_name] --from-file=[your_k8s_secret_key]=[pfx_certificate_file_fully_qualified_local_path]
   ```

    - `[pfx_certificate_file_fully_qualified_local_path]` is the path to the PFX file you obtained earlier
    - `[your_k8s_secret_name]` is secret name in the Kubernetes secret store
    - `[your_k8s_secret_key]` is secret key in the Kubernetes secret store

1. Create an `azurekeyvault.yaml` component file.

    The component yaml refers to the Kubernetes secretstore using `auth` property and  `secretKeyRef` refers to the certificate stored in the Kubernetes secret store.

    ```yaml
    apiVersion: dapr.io/v1alpha1
    kind: Component
    metadata:
      name: azurekeyvault
      namespace: default
    spec:
      type: secretstores.azure.keyvault
      version: v1
      metadata:
      - name: vaultName
        value: "[your_keyvault_name]"
      - name: azureTenantId
        value: "[your_tenant_id]"
      - name: azureClientId
        value: "[your_client_id]"
      - name: azureCertificate
        secretKeyRef:
          name: "[your_k8s_secret_name]"
          key: "[your_k8s_secret_key]"
    auth:
      secretStore: kubernetes
    ```

1. Apply the `azurekeyvault.yaml` component:

    ```bash
    kubectl apply -f azurekeyvault.yaml
    ```

{{% /codetab %}}

{{< /tabs >}}

## Next steps

{{< button text="Authenticate using Azure AD >>" page="howto-authenticate-aad.md" >}}
