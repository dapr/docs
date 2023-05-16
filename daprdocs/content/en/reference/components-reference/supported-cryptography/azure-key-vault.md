---
type: docs
title: "Azure Key Vault"
linkTitle: "Azure Key Vault"
description: Detailed information on the Azure Key Vault cryptography component
---

## Component format

Todo: update component format to correct format for cryptography

A Dapr `crypto.yaml` component file has the following structure:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: azurekeyvault
spec:
  type: crypto.azure.keyvault
  metadata:
  - name: vaultName
    value: ${{AzureKeyVaultName}}
  - name: azureTenantId
    value: ${{AzureKeyVaultTenantId}}
  - name: azureClientId
    value: ${{AzureKeyVaultServicePrincipalClientId}}
  - name: azureClientSecret
    value: ${{AzureKeyVaultServicePrincipalClientSecret}}
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets, as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| vaultName          | Y        | Azure Key Vault name  | TODO |
| azureTenantId      | Y        | Azure Key Vault tenant ID  | TODO |
| azureClientId      | Y        | Azure Key Vault service principal client ID  | TODO |
| azureClientSecret  | Y        | Azure Key Vault service principal client secret  | TODO |

## Related links
[Cryptography building block]({{< ref cryptography >}})
