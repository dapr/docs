---
type: docs
title: "AWS DynamoDB"
linkTitle: "AWS DynamoDB"
description: Detailed information on the AWS DynamoDB state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-dynamodb/"
---

## Component format

To setup a DynamoDB state store create a component of type `state.aws.dynamodb`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.aws.dynamodb
  version: v1
  metadata:
  - name: table
    value: "mytable"
  - name: accessKey
    value: "abcd" # Optional
  - name: secretKey
    value: "abcd" # Optional
  - name: endpoint
    value: "http://localhost:8080" # Optional
  - name: region
    value: "eu-west-1" # Optional
  - name: sessionToken
    value: "abcd" # Optional
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Primary Key

In order to use DynamoDB as a Dapr state store, the table must have a primary key named `key`.

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| table              | Y  | name of the DynamoDB table to use  | `"mytable"`
| accessKey          | N  | ID of the AWS account with appropriate permissions to SNS and SQS. Can be `secretKeyRef` to use a secret reference  | `"AKIAIOSFODNN7EXAMPLE"`
| secretKey          | N  | Secret for the AWS user. Can be `secretKeyRef` to use a secret reference   |`"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"`
| region             | N  | The AWS region to the instance. See this page for valid regions: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html. Ensure that DynamoDB are available in that region.| `"us-east-1"`
| endpoint          | N  |AWS endpoint for the component to use. Only used for local development. The `endpoint` is unncessary when running against production AWS   | `"http://localhost:4566"`
| sessionToken      | N  |AWS session token to use.  A session token is only required if you are using temporary security credentials. | `"TOKEN"`

## Setup AWS DynamoDB
See [Authenticating to AWS]({{< ref authenticating-aws.md >}}) for information about authentication-related attributes

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
- [Authenticating to AWS]({{< ref authenticating-aws.md >}})
