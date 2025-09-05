---
type: docs
title: "Authenticating to Azure"
linkTitle: "Overview"
description: "How to authenticate Azure components using Microsoft Entra ID and/or Managed Identities"
aliases:
  - "/operations/components/setup-secret-store/supported-secret-stores/azure-keyvault-managed-identity/"
  - "/reference/components-reference/supported-secret-stores/azure-keyvault-managed-identity/"
weight: 10000
---

## About authentication with Microsoft Entra ID

Microsoft Entra ID is Azure's identity and access management (IAM) solution, which is used to authenticate and authorize users and services. It's built on top of open standards such OAuth 2.0, which allows services (applications) to obtain access tokens to make requests to Azure services, including Azure Storage, Azure Service Bus, Azure Key Vault, Azure Cosmos DB, Azure Database for Postgres, Azure SQL, etc.

## Options to authenticate

Applications can authenticate with Microsoft Entra ID and obtain an access token to make requests to Azure services through several methods:

 - [Workload identity federation]({{< ref howto-wif.md >}}) - The recommended way to configure your Microsoft Entra ID tenant to trust an external identity provider.  This includes service accounts from Kubernetes or AKS clusters. [Learn more about workload identity federation](https://learn.microsoft.com/entra/workload-id/workload-identities-overview).
 - [System and user assigned managed identities]({{< ref howto-mi.md >}}) - Less granular than workload identity federation, but retains some of the benefits.  [Learn more about system and user assigned managed identities](https://learn.microsoft.com/azure/aks/use-managed-identity).
 - [Client ID and secret]({{ < ref howto-aad.md >}}) - Not recommended as it requires you to maintian and associate credentials at the application level.
 - Pod Identities - [Deprecated approach for authenticating applications running on Kubernetes pods](https://learn.microsoft.com/azure/aks/use-azure-ad-pod-identity) at a pod level.  This should no longer be used.

If you are just getting started, it is recommended to use workload identity federation.

## Managed identities and workload identity federation

With Managed Identities (MI), your application can authenticate with Microsoft Entra ID and obtain an access token to make requests to Azure services. When your application is running on a supported Azure service (such as Azure VMs, Azure Container Apps, Azure Web Apps, etc), an identity for your application can be assigned at the infrastructure level. You can also setup Microsoft Entra ID to federate trust to your Dapr application identity directly by using a [Federated Identity Credential](https://learn.microsoft.com/graph/api/resources/federatedidentitycredentials-overview?view=graph-rest-1.0). This allows you to configure access to your Microsoft resources even when not running on Microsoft infrastructure. To see how to configure Dapr to use a federated identity, see the section on [Authenticating with a Federated Identity Credential](#authenticating-with-a-federated-identity-credential).
This is done through [system or user assigned managed identities]({{< ref howto-mi.md >}}), or [workload identity federation]({{< ref howto-wif.md >}}).

Once using managed identities, your code doesn't have to deal with credentials, which:

- Removes the challenge of managing credentials safely
- Allows greater separation of concerns between development and operations teams
- Reduces the number of people with access to credentials
- Simplifies operational aspects–especially when multiple environments are used

While some Dapr Azure components offer alternative authentication methods, such as systems based on "shared keys" or "access tokens", you should always try to authenticate your Dapr components using Microsoft Entra ID whenever possible. This offers many benefits, including:

- [Role-Based Access Control](#role-based-access-control)
- [Auditing](#auditing)
- [(Optional) Authentication using certificates](#optional-authentication-using-certificates)

It's recommended that applications running on Azure Kubernetes Service leverage [workload identity federation](https://learn.microsoft.com/entra/workload-id/workload-identity-federation) to automatically provide an identity to individual pods.

### Role-Based Access Control

When using Azure Role-Based Access Control (RBAC) with supported services, permissions given to an application can be fine-tuned. For example, you can restrict access to a subset of data or make the access read-only.

### Auditing

Using Microsoft Entra ID provides an improved auditing experience for access. Tenant administrators can consult audit logs to track authentication requests.

### (Optional) Authentication using certificates

While Microsoft Entra ID allows you to use MI, you still have the option to authenticate using certificates.

## Support for other Azure environments

By default, Dapr components are configured to interact with Azure resources in the "public cloud". If your application is deployed to another cloud, such as Azure China or Azure Government ("sovereign clouds"), you can enable that for supported components by setting the `azureEnvironment` metadata property to one of the supported values:

- Azure public cloud (default): `"AzurePublicCloud"`
- Azure China: `"AzureChinaCloud"`
- Azure Government: `"AzureUSGovernmentCloud"`

> Support for sovereign clouds is experimental.

## Credentials metadata fields

To authenticate with Microsoft Entra ID, you will need to add the following credentials as values in the metadata for your [Dapr component](#example-usage-in-a-dapr-component).

### Metadata options

Depending on how you've passed credentials to your Dapr services, you have multiple metadata options.

- [Using client credentials](#authenticating-using-client-credentials)
- [Using a certificate](#authenticating-using-a-certificate)
- [Using Managed Identities (MI)](#authenticating-with-managed-identities-mi)
- [Using Workload Identity on AKS](#authenticating-with-workload-identity-on-aks)
- [Using Azure CLI credentials (development-only)](#authenticating-using-azure-cli-credentials-development-only)

#### Authenticating using client credentials

| Field               | Required | Details                              | Example                                      |
|---------------------|----------|--------------------------------------|----------------------------------------------|
| `azureTenantId`     | Y        | ID of the Microsoft Entra ID tenant            | `"cd4b2887-304c-47e1-b4d5-65447fdd542b"`     |
| `azureClientId`     | Y        | Client ID (application ID)           | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"`     |
| `azureClientSecret` | Y        | Client secret (application password) | `"Ecy3XG7zVZK3/vl/a2NSB+a1zXLa8RnMum/IgD0E"` |

When running on Kubernetes, you can also use references to Kubernetes secrets for any or all of the values above.

#### Authenticating using a certificate

| Field | Required | Details | Example |
|--------|--------|--------|--------|
| `azureTenantId` | Y | ID of the Microsoft Entra ID tenant | `"cd4b2887-304c-47e1-b4d5-65447fdd542b"` |
| `azureClientId` | Y | Client ID (application ID) | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"` |
| `azureCertificate` | One of `azureCertificate` and `azureCertificateFile` | Certificate and private key (in PFX/PKCS#12 format) | `"-----BEGIN PRIVATE KEY-----\n MIIEvgI... \n -----END PRIVATE KEY----- \n -----BEGIN CERTIFICATE----- \n MIICoTC... \n -----END CERTIFICATE-----` |
| `azureCertificateFile` | One of `azureCertificate` and `azureCertificateFile` | Path to the PFX/PKCS#12 file containing the certificate and private key | `"/path/to/file.pem"` |
| `azureCertificatePassword` | N | Password for the certificate if encrypted | `"password"` |

When running on Kubernetes, you can also use references to Kubernetes secrets for any or all of the values above.

#### Authenticating with Managed Identities (MI)

| Field           | Required | Details                    | Example                                  |
|-----------------|----------|----------------------------|------------------------------------------|
| `azureClientId` | N        | Client ID (application ID) | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"` |

[Using Managed Identities]({{% ref howto-mi.md %}}), the `azureClientId` field is generally recommended. The field is optional when using a system-assigned identity, but may be required when using user-assigned identities.

#### Authenticating with Workload Identity on AKS

When running on Azure Kubernetes Service (AKS), you can authenticate components using Workload Identity. Refer to the Azure AKS documentation on [enabling Workload Identity](https://learn.microsoft.com/azure/aks/workload-identity-overview) for your Kubernetes resources.

#### Authenticating with a Federated Identity Credential

You can use a [Federated Identity Credential](https://learn.microsoft.com/graph/api/resources/federatedidentitycredentials-overview?view=graph-rest-1.0) in Microsoft Entra ID to federate trust directly to your Dapr installation regardless of where it is running. This allows you to easily configure access rules against your Dapr application's [SPIFFE](https://spiffe.io/) ID consistently across different clouds.

In order to federate trust, you must be running Dapr Sentry with JWT issuing and OIDC discovery enabled. These can be configured using the following Dapr Sentry helm values:

```yaml
jwt:
  # Enable JWT token issuance by Sentry
  enabled: true
  # Issuer value for JWT tokens
  issuer: "<your-issuer-domain>"

oidc:
  enabled: true
  server:
    # Port for the OIDC HTTP server
    port: 9080
  tls:
    # Enable TLS for the OIDC HTTP server
    enabled: true
    # TLS certificate file for the OIDC HTTP server
    certFile: "<path-to-tls-cert.pem>"
    # TLS certificate file for the OIDC HTTP server
    keyFile: "<path-to-tls-key.pem>"
```

{{% alert title="Warning" color="warning" %}}
The `issuer` value must match exactly the value you provide when creating the Federated Identity Credential in Microsoft Entra ID.
{{% /alert %}}

Providing these settings exposes the following endpoints on your Dapr Sentry installation on the provided OIDC HTTP port:
```
/.well-known/openid-configuration
/jwks.json
```

You also need to provide the Dapr runtime configuration to request a JWT token with the Azure audience `api://AzureADTokenExchange`.
When running in standalone mode, this can be provided using the flag `--sentry-request-jwt-audiences=api://AzureADTokenExchange`.
When running in Kubernetes, this can be provided by decorating the application Kubernetes manifest with the annotations `"dapr.io/sentry-request-jwt-audiences": "api://AzureADTokenExchange"`.
This ensures Sentry service issues a JWT token with the correct audience, which is required for Microsoft Entra ID to validate the token.

In order for Microsoft Entra ID to be able to access the OIDC endpoints, you must expose them on a public address. You must ensure that the domain that you are serving these endpoints via is the same as the issuer you provided when configuration Dapr Sentry.

You can now create your federated credential in Microsoft Entra ID. 

```shell
cat > creds.json <<EOF
{ 
  "name": "DaprAppIDSpiffe",
  "issuer": "https://<your-issuer-domain>",
  "subject": spiffe://public/ns/<dapr-app-id-namespace>/<dapr-app-id>",
  "audiences": ["api://AzureADTokenExchange"],
  "description": "Credential for Dapr App ID"
}
EOF

export APP_ID=$(az ad app create --display-name my-dapr-app --enable-access-token-issuance --enable-id-token-issuance | jq .id)
az ad sp create --id $APP_ID
az ad app federated-credential create --id $APP_ID --parameters ./creds.json
```

Now that you have a federated credential for your Microsoft Entra ID Application Registration, you can assign the desired roles to it's service principal.

An example of assigning "Storage Blob Data Owner" role is below.
```shell
az role assignment create --assignee-object-id $APP_ID --assignee-principal-type ServicePrincipal --role "Storage Blob Data Owner" --scope "/subscriptions/$SUBSCRIPTION/resourceGroups/$GROUP/providers/Microsoft.Storage/storageAccounts/$ACCOUNT_NAME"
```

To configure a Dapr Component to access an Azure resource using the federated credentail, you first need to fetch your `clientId` and `tenantId`:
```shell
CLIENT_ID=$(az ad app show --id $APP_ID --query appId --output tsv)
TENANT_ID=$(az account show --query tenantId --output tsv)
```

Then you can create your Azure Dapr Component and simply provide these value:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: azureblob
spec:
  type: state.azure.blobstorage
  version: v2
  initTimeout: 10s # Increase the init timeout to allow enough time for Azure to perform the token exchange
  metadata:
  - name: clientId
    value: $CLIENT_ID
  - name: tenantId
    value:  $TENANT_ID
  - name: accountName
    value: $ACCOUNT_NAME
  - name: containerName
    value: $CONTAINER_NAME
```

The Dapr runtime uses these details to authenticate with Microsoft Entra ID, using the Dapr Sentry issued JWT token to exchange for an access token to access the Azure resource.

#### Authenticating using Azure CLI credentials (development-only)

> **Important:** This authentication method is recommended for **development only**.

This authentication method can be useful while developing on a local machine. You will need:

- The [Azure CLI installed](https://learn.microsoft.com/cli/azure/install-azure-cli)
- Have successfully authenticated using the `az login` command

When Dapr is running on a host where there are credentials available for the Azure CLI, components can use those to authenticate automatically if no other authentication method is configuration.

Using this authentication method does not require setting any metadata option.

### Example usage in a Dapr component

In this example, you will set up an Azure Key Vault secret store component that uses Microsoft Entra ID to authenticate.

{{< tabpane text=true >}}

{{% tab "Self-Hosted" %}}

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
{{% /tab %}}

{{% tab "Kubernetes" %}}
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

{{% /tab %}}

{{< /tabpane >}}

## Next steps

{{< button text="Generate a new Microsoft Entra ID application and Service Principal >>" page="howto-aad.md" >}}

## References

- [Microsoft Entra ID app credential: Azure CLI reference](https://docs.microsoft.com/cli/azure/ad/app/credential)
- [Azure Managed Service Identity (MSI) overview](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/overview)
- [Secrets building block]({{% ref secrets %}})
- [How-To: Retrieve a secret]({{% ref "howto-secrets.md" %}})
- [How-To: Reference secrets in Dapr components]({{% ref component-secrets.md %}})
- [Secrets API reference]({{% ref secrets_api.md %}})
