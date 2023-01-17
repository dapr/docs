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
    value: "Contracts"
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
    value: "ContractID" # Optional
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Primary Key

In order to use DynamoDB as a Dapr state store, the table must have a primary key named `key`. See the section [Partition Keys]({{< ref "setup-dynamodb.md#partition-keys" >}}) for an option to change this behavior.

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| table              | Y  | name of the DynamoDB table to use  | `"Contracts"`
| accessKey          | N  | ID of the AWS account with appropriate permissions to SNS and SQS. Can be `secretKeyRef` to use a secret reference  | `"AKIAIOSFODNN7EXAMPLE"`
| secretKey          | N  | Secret for the AWS user. Can be `secretKeyRef` to use a secret reference   |`"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"`
| region             | N  | The AWS region to the instance. See this page for valid regions: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html. Ensure that DynamoDB are available in that region.| `"us-east-1"`
| endpoint          | N  |AWS endpoint for the component to use. Only used for local development. The `endpoint` is unncessary when running against production AWS   | `"http://localhost:4566"`
| sessionToken      | N  |AWS session token to use.  A session token is only required if you are using temporary security credentials. | `"TOKEN"`
| ttlAttributeName  | N  |The table attribute name which should be used for TTL. | `"expiresAt"`
| partitionKey      | N  |The table primary key or partition key attribute name. This field is used to replace the default primary key attribute name `"key"`. See the section [Partition Keys]({{< ref "setup-dynamodb.md#partition-keys" >}}).  | `"ContractID"`

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

By default, the DynamoDB state store component uses the table attribute name `key` as primary/partition key in the DynamoDB table.
This can be overridden by specifying a metadata field in the component configuration with a key of `partitionKey` and a value of the desired attribute name.

To learn more about DynamoDB primary/partition keys, read the [AWS DynamoDB Developer Guide.](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html#HowItWorks.CoreComponents.PrimaryKey)

The following `statestore.yaml` file shows how to configure the DynamoDB state store component to use the partition key attribute name of `ContractID`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.aws.dynamodb
  version: v1
  metadata:
  - name: table
    value: "Contracts"
  - name: partitionKey
    value: "ContractID"
```

The above component specification assumes the following DynamoDB Table Layout:

```json
{
    "Table": {
        "AttributeDefinitions": [
            {
                "AttributeName": "ContractID",
                "AttributeType": "S"
            }
        ],
        "TableName": "Contracts",
        "KeySchema": [
            {
                "AttributeName": "ContractID",
                "KeyType": "HASH"
            }
        ],
}
```

The following operation passes `"A12345"` as the value for `key`, and based on the component specification provided above, the Dapr runtime will replace the `key` attribute name
with `ContractID` as the Partition/Primary Key sent to DynamoDB:

```shell
$ dapr run --app-id contractsprocessing --app-port ...

$ curl -X POST http://localhost:3500/v1.0/state/<store_name> \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "A12345",
          "value": "Dapr Contract"
        }
      ]'
```

The following AWS CLI Command displays the contents of the DynamoDB `Contracts` table:
```shell
$ aws dynamodb get-item \
    --table-name Contracts \
    --key '{"ContractID":{"S":"contractsprocessing||A12345"}}' 
{
    "Item": {
        "value": {
            "S": "Dapr Contract"
        },
        "etag": {
            "S": "....."
        },
        "ContractID": {
            "S": "contractsprocessing||A12345"
        }
    }
}
```

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
- [Authenticating to AWS]({{< ref authenticating-aws.md >}})
