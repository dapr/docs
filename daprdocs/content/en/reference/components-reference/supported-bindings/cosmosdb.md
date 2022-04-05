---
type: docs
title: "Azure Cosmos DB binding spec"
linkTitle: "Azure Cosmos DB"
description: "Detailed documentation on the Azure Cosmos DB binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/cosmosdb/"
---

## Component format

To setup Azure Cosmos DB binding create a component of type `bindings.azure.cosmosdb`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.azure.cosmosdb
  version: v1
  metadata:
  - name: url
    value: https://******.documents.azure.com:443/
  - name: masterKey
    value: *****
  - name: database
    value: db
  - name: collection
    value: collection
  - name: partitionKey
    value: message
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support | Details | Example |
|--------------------|:--------:|--------|---------|---------|
| url | Y | Output | The Cosmos DB url | `"https://******.documents.azure.com:443/"` |
| masterKey | Y | Output | The Cosmos DB account master key | `"master-key"` |
| database | Y | Output | The name of the Cosmos DB database | `"OrderDb"` |
| collection | Y | Output | The name of the container inside the database.  | `"Orders"` |
| partitionKey | Y | Output | The name of the key to extract from the payload (document to be created) that is used as the partition key. This name must match the partition key specified upon creation of the Cosmos DB container. | `"OrderId"`, `"message"` |

For more information see [Azure Cosmos DB resource model](https://docs.microsoft.com/azure/cosmos-db/account-databases-containers-items).

### Azure Active Directory (Azure AD) authentication

The Azure Cosmos DB binding component supports authentication using all Azure Active Directory mechanisms. For further information and the relevant component metadata fields to provide depending on the choice of AAD authentication mechanism, see the [docs for authenticating to Azure]({{< ref authenticating-azure.md >}}).

You can read additional information for setting up Cosmos DB with Azure AD authentication in the [section below](#setting-up-cosmos-db-for-authenticating-with-azure-ad).

## Binding support

This component supports **output binding** with the following operations:

- `create`

## Best Practices for Production Use

Azure Cosmos DB shares a strict metadata request rate limit across all databases in a single Azure Cosmos DB account. New connections to Azure Cosmos DB assume a large percentage of the allowable request rate limit. (See the [Cosmos DB documentation](https://docs.microsoft.com/azure/cosmos-db/sql/troubleshoot-request-rate-too-large#recommended-solution-3))

Therefore several strategies must be applied to avoid simultaneous new connections to Azure Cosmos DB:

- Ensure sidecars of applications only load the Azure Cosmos DB component when they require it to avoid unnecessary database connections. This can be done by [scoping your components to specific applications]({{< ref component-scopes.md >}}#application-access-to-components-with-scopes).
- Choose deployment strategies that sequentially deploy or start your applications to minimize bursts in new connections to your Azure Cosmos DB accounts.
- Avoid reusing the same Azure Cosmos DB account for unrelated databases or systems (even outside of Dapr). Distinct Azure Cosmos DB accounts have distinct rate limits.
- Increase the `initTimeout` value to allow the component to retry connecting to Azure Cosmos DB during side car initialization for up to 5 minutes. The default value is `5s` and should be increased. When using Kubernetes, increasing this value may also require an update to your [Readiness and Liveness probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

```yaml
spec:
  type: bindings.azure.cosmosdb
  version: v1
  initTimeout: 5m
  metadata:
```

## Data format

The **output binding** `create` operation requires the following keys to exist in the payload of every document to be created:

- `id`: a unique ID for the document to be created
- `<partitionKey>`: the name of the partition key specified via the `spec.partitionKey` in the component definition. This must also match the partition key specified upon creation of the Cosmos DB container.

## Setting up Cosmos DB for authenticating with Azure AD

When using the Dapr Cosmos DB binding and authenticating with Azure AD, you need to perform a few additional steps to set up your environment.

Prerequisites:

- You need a Service Principal created as per the instructions in the [authenticating to Azure]({{< ref authenticating-azure.md >}}) page. You need the ID of the Service Principal for the commands below (note that this is different from the client ID of your application, or the value you use for `azureClientId` in the metadata).
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
- [jq](https://stedolan.github.io/jq/download/)
- The scripts below are optimized for a bash or zsh shell

> When using the Cosmos DB binding, you **don't** need to create stored procedures as you do in the case of the Cosmos DB state store.

### Granting your Azure AD application access to Cosmos DB

> You can find more information on the [official documentation](https://docs.microsoft.com/azure/cosmos-db/how-to-setup-rbac), including instructions to assign more granular permissions.

In order to grant your application permissions to access data stored in Cosmos DB, you need to assign it a custom role for the Cosmos DB data plane. In this example you're going to use a built-in role, "Cosmos DB Built-in Data Contributor", which grants your application full read-write access to the data; you can optionally create custom, fine-tuned roles following the instructions in the official docs.

```sh
# Name of the Resource Group that contains your Cosmos DB
RESOURCE_GROUP="..."
# Name of your Cosmos DB account
ACCOUNT_NAME="..."
# ID of your Service Principal object
PRINCIPAL_ID="..."
# ID of the "Cosmos DB Built-in Data Contributor" role
# You can also use the ID of a custom role
ROLE_ID="00000000-0000-0000-0000-000000000002"

az cosmosdb sql role assignment create \
  --account-name "$ACCOUNT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --scope "/" \
  --principal-id "$PRINCIPAL_ID" \
  --role-definition-id "$ROLE_ID"
```

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
