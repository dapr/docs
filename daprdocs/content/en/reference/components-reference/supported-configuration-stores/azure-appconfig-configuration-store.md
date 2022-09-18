---
type: docs
title: "Azure App Configuration"
linkTitle: "Azure App Configuration"
description: Detailed information on the Azure App Configuration configuration store component
aliases:
  - "/operations/components/setup-configuration-store/supported-configuration-stores/setup-azure-appconfig/"
---

## Component format

To set up an Azure App Configuration configuration store, create a component of type `configuration.azure.appconfig`.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: configuration.azure.appconfig
  version: v1
  metadata:
  - name: appConfigHost # appConfigHost should be used when 
  # Azure Authentication mechanism is used.
    value: <HOST>
  - name: appConfigConnectionString # appConfigConnectionString should not be used when 
  # Azure Authentication mechanism is used.
    value: <CONNECTIONSTRING>
  - name: maxRetries
    value: # Optional
  - name: retryDelay
    value: # Optional
  - name: maxRetryDelay
    value: # Optional
  - name: azureEnvironment # Optional, defaults to AZUREPUBLICCLOUD
    value: "AZUREPUBLICCLOUD"
  # See authentication section below for all options
  - name: azureTenantId # Optional
    value: "[your_service_principal_tenant_id]"
  - name: azureClientId # Optional
    value: "[your_service_principal_app_id]"
  - name: azureCertificateFile # Optional
    value : "[pfx_certificate_file_fully_qualified_local_path]"

```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field                      | Required | Details | Example |
|----------------------------|:--------:|---------|---------|
| appConfigConnectionString  | Y*       | Connection String for the Azure App Configuration instance. No Default. Can be `secretKeyRef` to use a secret reference. *Mutally exclusive with appConfigHost field. *Not to be used when [Azure Authentication](https://docs.dapr.io/developing-applications/integrations/azure/authenticating-azure/) is used  | `Endpoint=https://foo.azconfig.io;Id=osOX-l9-s0:sig;Secret=00000000000000000000000000000000000000000000`
| appConfigHost              | N*       | Endpoint for the Azure App Configuration instance. No Default. *Mutally exclusive with appConfigConnectionString field. *To be used when [Azure Authentication](https://docs.dapr.io/developing-applications/integrations/azure/authenticating-azure/) is used | `https://dapr.azconfig.io`
| maxRetries                 | N        | Maximum number of retries before giving up. Defaults to `3` | `5`, `10`
| retryDelay                 | N        | RetryDelay specifies the initial amount of delay to use before retrying an operation. The delay increases exponentially with each retry up to the maximum specified by MaxRetryDelay. Defaults to `4` seconds; `"-1"` disables delay between retries. | `4000000000`
| maxRetryDelay              | N        | MaxRetryDelay specifies the maximum delay allowed before retrying an operation. Typically the value is greater than or equal to the value specified in RetryDelay. Defaults to `120` seconds; `"-1"` disables the limit | `120000000000`

**Note**: either `appConfigHost` or `appConfigConnectionString` must be specified.

## Authenticating with Connection String 

Access an App Configuration instance using its connection string, which is available in the Azure portal. Since connection strings contain credential information, you should treat them as secrets and [use a secret store]({{< ref component-secrets.md >}}).

## Authenticating with Azure AD

The Azure App Configuration configuration store component also supports authentication with Azure AD. Before you enable this component:
- Read the [Authenticating to Azure]({{< ref authenticating-azure.md >}}) document.
- Create an Azure AD application (also called Service Principal). 
- Alternatively, create a managed identity for your application platform.

## Set up Azure App Configuration

You need an Azure subscription to set up Azure App Configuration.

1. [Start the Azure App Configuration creation flow](https://ms.portal.azure.com/#create/Microsoft.Azconfig). Log in if necessary.
1. Click **Create** to kickoff deployment of your Azure App Configuration instance.
1. Once your instance is created, grab the **Host (Endpoint)** or your **Connection string**:
   - For the Host: navigate to the resource's **Overview** and copy **Endpoint**.
   - For your connection string: navigate to **Settings** > **Access Keys** and copy your Connection string.
1. Add your host or your connection string to an `azappconfig.yaml` file that Dapr can apply.
     
   Set the `appConfigHost` key to `[Endpoint]` or the `appConfigConnectionString` key to the values you saved earlier. 
   
   {{% alert title="Note" color="primary" %}}
   In a production-grade application, follow [the secret management]({{< ref component-secrets.md >}}) instructions to securely manage your secrets.
   {{% /alert %}}

## Azure App Configuration Request Metadata 

The Azure App Configuration store supports the following optional metadata property:

`label`: The label of the configuration to retrieve. If not present, the configuration store will return the configuration for the specified key and null label.

The label can be populated using query parameters in the request URL:

```bash
GET curl http://localhost:<daprPort>/v1.0-alpha1/configuration/<secret-store-name>?key=<key name>&metadata.label=<label value>
```

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Configuration building block]({{< ref configuration-api-overview >}})
