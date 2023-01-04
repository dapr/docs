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
spec:
  type: state.aws.dynamodb
  version: v1
  metadata:
  - name: table
    value: "mytable"
  - name: accessKey
    value: "AKIAIOSFODNN7EXAMPLE" # Optional
  - name: secretKey
    value: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" # Optional
  - name: endpoint
    value: "http://localhost:8080" # Optional
  - name: region
    value: "eu-west-1" # Optional
  - name: sessionToken
    value: "myTOKEN" # Optional
  - name: ttlAttributeName
    value: "expiresAt" # Optional
  - name: partitionKey
    value: "pkey" # Optional
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Primary Key

In order to use DynamoDB as a Dapr state store, the table must have a primary key named `key`. See the section [Partition Keys]({{< ref "setup-dynamodb.md#partition-keys" >}}) for an option to change this behavior.

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| table              | Y  | name of the DynamoDB table to use  | `"mytable"`
| accessKey          | N  | ID of the AWS account with appropriate permissions to SNS and SQS. Can be `secretKeyRef` to use a secret reference  | `"AKIAIOSFODNN7EXAMPLE"`
| secretKey          | N  | Secret for the AWS user. Can be `secretKeyRef` to use a secret reference   |`"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"`
| region             | N  | The AWS region to the instance. See this page for valid regions: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html. Ensure that DynamoDB are available in that region.| `"us-east-1"`
| endpoint          | N  |AWS endpoint for the component to use. Only used for local development. The `endpoint` is unncessary when running against production AWS   | `"http://localhost:4566"`
| sessionToken      | N  |AWS session token to use.  A session token is only required if you are using temporary security credentials. | `"TOKEN"`
| ttlAttributeName  | N  |The table attribute name which should be used for TTL. | `"expiresAt"`
| partitionKey      | N  |The partition key used to replace the default partition key `"key"`.  See the `Partion Keys` section below. | `"pkey"`

{{% alert title="Important" color="warning" %}}
When running the Dapr sidecar (daprd) with your application on EKS (AWS Kubernetes), if you're using a node/pod that has already been attached to an IAM policy defining access to AWS resources, you **must not** provide AWS access-key, secret-key, and tokens in the definition of the component spec you're using.  
{{% /alert %}}

## Setup AWS DynamoDB

See [Authenticating to AWS]({{< ref authenticating-aws.md >}}) for information about authentication-related attributes

## Time to live (TTL)

In order to use DynamoDB TTL feature, you must enable TTL on your table and define the attribute name.
The attribute name must be defined in the `ttlAttributeName` field.
See official [AWS docs](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html).

## Partition Keys

The DynamoDB state store uses the `key` property provided in the request to determine the partition key. This can be overridden by specifying a metadata field in the request with a key of `partitionKey` and a value of the desired partition.

The following operation uses `tony-stark` as the partition key value:

```shell
curl -X POST http://localhost:3500/v1.0/state/<store_name> \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "tony-stark",
          "value": "iron man"
        }
      ]'
```

If you want to control the DynamoDB partition key, you can specify it in metadata. Below, reuse the previous example with a different partition key - in this case, `pkey`.

```shell
curl -X POST http://localhost:3500/v1.0/state/<store_name> \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "tony-stark",
          "value": "iron man",
          "metadata": {
            "partitionKey": "pkey"
          }
        }
      ]'
```

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
- [Authenticating to AWS]({{< ref authenticating-aws.md >}})
