---
type: docs
title: "How to: Generate a new Azure AD application and Service Principal"
linkTitle: "How to: Generate Azure AD and Service Principal"
weight: 30000
description: "Learn how to generate an Azure Active Directory and use it as a Service Principal"
---

## Prerequisites

- [An Azure subscription](https://azure.microsoft.com/free/)
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
- [jq](https://stedolan.github.io/jq/download/)
- OpenSSL (included by default on all Linux and macOS systems, as well as on WSL)
- Make sure you're using a bash or zsh shell

## Log into Azure using the Azure CLI

In a new terminal, run the following command:

```sh
az login
az account set -s [your subscription id]
```

### Create an Azure AD application

Create the Azure AD application with:

```sh
# Friendly name for the application / Service Principal
APP_NAME="dapr-application"

# Create the app
APP_ID=$(az ad app create --display-name "${APP_NAME}"  | jq -r .appId)
```

Select how you'd prefer to pass credentials.

{{< tabs "Client secret" "PFX certificate">}}

{{% codetab %}}

To create a **client secret**, run the following command. 

```sh
az ad app credential reset \
  --id "${APP_ID}" \
  --years 2
```

This generates a random, 40-characters long password based on the `base64` charset. This password will be valid for 2 years, before you need to rotate it.

Save the output values returned; you'll need them for Dapr to authenticate with Azure. The expected output:

```json
{
  "appId": "<your-app-id>",
  "password": "<your-password>",
  "tenant": "<your-azure-tenant>"
}
```

When adding the returned values to your Dapr component's metadata:

- `appId` is the value for `azureClientId`
- `password` is the value for `azureClientSecret` (this was randomly-generated)
- `tenant` is the value for `azureTenantId`

{{% /codetab %}}

{{% codetab %}}
For a **PFX (PKCS#12) certificate**, run the following command to create a self-signed certificate:

```sh
az ad app credential reset \
  --id "${APP_ID}" \
  --create-cert
```

> **Note:** Self-signed certificates are recommended for development only. For production, you should use certificates signed by a CA and imported with the `--cert` flag.

The output of the command above should look like:

Save the output values returned; you'll need them for Dapr to authenticate with Azure. The expected output:

```json
{
  "appId": "<your-app-id>",
  "fileWithCertAndPrivateKey": "<file-path>",
  "password": null,
  "tenant": "<your-azure-tenant>"
}
```

When adding the returned values to your Dapr component's metadata:

- `appId` is the value for `azureClientId`
- `tenant` is the value for `azureTenantId`
- `fileWithCertAndPrivateKey` indicates the location of the self-signed PFX certificate and private key. Use the contents of that file as `azureCertificate` (or write it to a file on the server and use `azureCertificateFile`)

> **Note:** While the generated file has the `.pem` extension, it contains a certificate and private key encoded as PFX (PKCS#12).

{{% /codetab %}}

{{< /tabs >}}

### Create a Service Principal

Once you have created an Azure AD application, create a Service Principal for that application. With this Service Principal, you can grant it access to Azure resources. 

To create the Service Principal, run the following command:

```sh
SERVICE_PRINCIPAL_ID=$(az ad sp create \
  --id "${APP_ID}" \
  | jq -r .id)
echo "Service Principal ID: ${SERVICE_PRINCIPAL_ID}"
```

Expected output:

```text
Service Principal ID: 1d0ccf05-5427-4b5e-8eb4-005ac5f9f163
```

The returned value above is the **Service Principal ID**, which is different from the Azure AD application ID (client ID). The Service Principal ID is defined within an Azure tenant and used to grant access to Azure resources to an application  
You'll use the Service Principal ID to grant permissions to an application to access Azure resources. 

Meanwhile, **the client ID** is used by your application to authenticate. You'll use the client ID in Dapr manifests to configure authentication with Azure services.

Keep in mind that the Service Principal that was just created does not have access to any Azure resource by default. Access will need to be granted to each resource as needed, as documented in the docs for the components.

## Next steps

{{< button text="Use Managed Identities >>" page="howto-mi.md" >}}
