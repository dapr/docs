---
type: docs
title: "AWS DynamoDB binding spec"
linkTitle: "AWS DynamoDB"
description: "Detailed documentation on the AWS DynamoDB binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/dynamodb/"
---

## Component format

To setup AWS DynamoDB binding create a component of type `bindings.aws.dynamodb`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

See [Authenticating to AWS]({{< ref authenticating-aws.md >}}) for information about authentication-related attributes

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.aws.dynamodb
  version: v1
  metadata:
  - name: table
    value: items
  - name: region
    value: us-west-2
  - name: accessKey
    value: *****************
  - name: secretKey
    value: *****************
  - name: sessionToken
    value: *****************

```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support |  Details | Example |
|--------------------|:--------:|------------|-----|---------|
| table | Y | Output | The DynamoDB table name | `"items"` |
| region             | Y        | Output |  The specific AWS region the AWS DynamoDB instance is deployed in | `"us-east-1"`       |
| accessKey          | Y        | Output | The AWS Access Key to access this resource                              | `"key"`             |
| secretKey          | Y        | Output | The AWS Secret Access Key to access this resource                       | `"secretAccessKey"` |
| sessionToken       | N        | Output | The AWS session token to use                                            | `"sessionToken"`    |


## Binding support

This component supports **output binding** with the following operations:

- `create`

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
- [Authenticating to AWS]({{< ref authenticating-aws.md >}})
