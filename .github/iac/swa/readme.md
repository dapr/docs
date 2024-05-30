# Dapr Static Web Apps
## dapr.docs.io

## Summary

This folder contains a template and infrastructure as code to recreate and reconfigure the static web app used to host docs.dapr.io.

## Prerequisites

1) Active Azure Subscription with `Contributed` or `Owner` access to create resources
2) [Azure Developer CLI](https://aka.ms/azd)

## Deploy Static Web App

1) Export any environment variables you want to override with your values using `./infra/main.parameters.json` as a reference for the variable names.  e.g.

In a new terminal:

```bash
export AZURE_RESOURCE_GROUP=rg-dapr-docs-test
export IDENTITY_RESOURCE_GROUP=rg-my-identities
```

This assumes you have an existing [user-assigned managed identity](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/how-manage-user-assigned-managed-identities?pivots=identity-mi-methods-azp) (see L39 in `./infra/main.bicep` to use or modify name) in a resource group that you can reference as the runtime identity of this static web app.  We recommend storing this in a different resource group from your application, to keep the permissions and lifecycles separate of your identity and your web app.  We also recommend narrowly limiting who has access to view, contribute or own this identity, and also only apply it to single resource scopes, not to entire resource groups or subscriptions, to avoid elevation of priviledges.    

2) Deploy using the Azure Dev CLI

```bash
azd up
```
You will be prompted for the subscription and location (region) to use.  The Resource Group and Static Web App will now be created and usable.  Typical deployment times are only 20-60 seconds.  

## Configure the Static Web App in portal.azure.com

1) (Optional) Grant correct minimal permissions for inbound publishing and outbound access to dependencies using the Static Web App -> Access control (IAM) blade of the portal

2) (Optional) Map your DNS CNAME using the Static Web App -> Custom Domain blade of the portal

## Configure your CI/CD pipeline

You will need a rotatable token or ideally a managed identity (coming soon) for your pipeline to have Web publishing access grants to the Static Web App.  Get the token from the Overview blade -> Manage Access Token command of the SWA, and store it in the vault/secret for the repo matching your Github Action (or other CI/CD pipeline)'s workflow file.  One example for the current/main release of Dapr docs is [here](https://github.com/dapr/docs/blob/v1.13/.github/workflows/website-root.yml#L57).  This is an elevated operation that likely needs an admin or maintainer to perform. 
