---
type: docs
title: "Azure Key Vault"
linkTitle: "Azure Key Vault"
description: Detailed information on the Azure Key Vault cryptography component
---

## Component format

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
    value: mykeyvault
  # See authentication section below for all options
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

## Authenticating with Azure AD

The Azure Key Vault cryptography component supports authentication with Azure AD only. Before you enable this component:

1. Read the [Authenticating to Azure]({{< ref "authenticating-azure.md" >}}) document.
1. Create an [Azure AD application]({{< ref "howto-aad.md" >}}) (also called a Service Principal).
1. Alternatively, create a [managed identity]({{< ref "howto-mi.md" >}}) for your application platform.

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `vaultName`   | Y | Azure Key Vault name  | `"mykeyvault"` |
| Auth metadata | Y | See [Authenticating to Azure]({{< ref "authenticating-azure.md" >}}) for more information  |  |

## Related links

- [Cryptography building block]({{< ref cryptography >}})
- [Authenticating to Azure]({{< ref azure-authentication >}})