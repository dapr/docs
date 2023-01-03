---
type: docs
title: "commercetools GraphQL binding spec"
linkTitle: "commercetools GraphQL"
description: "Detailed documentation on the commercetools GraphQL binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/commercetools/"
---

## Component format

To setup commercetools GraphQL binding create a component of type `bindings.commercetools`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.



```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.commercetools
  version: v1
  metadata:
  - name: region # required.
    value: region
  - name: provider # required.
    value: provider (gcp/aws)
  - name: projectKey # required.
    value: project-key
  - name: clientID # required.
    value: *****************
  - name: clientSecret # required.
    value: *****************
  - name: scopes # required.
    value: scopes

```
{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support |  Details | Example |
|--------------------|:--------:|------------|-----|---------|
| region | Y | Output | The region of the commercetools project | `"europe-west1"` |
| provider | Y | Output | The cloud provider, either gcp or aws | `"gcp"` |
| projectKey | Y | Output | The commercetools project key | `"project-key"` |
| clientID | Y | Output | The commercetools client ID for the project | `"client ID"` |
| clientSecret | Y | Output | The commercetools client secret for the project | `"client secret"` |
| scopes | Y | Output | The commercetools scopes for the project | `"manage_project:project-key"` |

For more information see [commercetools - Creating an API Client](https://docs.commercetools.com/getting-started/create-api-client#create-an-api-client) and [commercetools - Regions](https://docs.commercetools.com/api/general-concepts#regions).

## Binding support

This component supports **output binding** with the following operations:

- `create`


## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
- [Sample app](https://github.com/dapr/samples/tree/master/commercetools-graphql-sample) that leverages the commercetools binding with sample GraphQL query