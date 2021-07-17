---
type: docs
title: "AWS Kinesis binding spec"
linkTitle: "AWS Kinesis"
description: "Detailed documentation on the AWS Kinesis binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/kinesis/"
---
## Component format

To setup AWS Kinesis binding create a component of type `bindings.aws.kinesis`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

See [this](https://aws.amazon.com/kinesis/data-streams/getting-started/) for instructions on how to set up an AWS Kinesis data streams
See [Authenticating to AWS]({{< ref authenticating-aws.md >}}) for information about authentication-related attributes

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.aws.kinesis
  version: v1
  metadata:
  - name: streamName
    value: KINESIS_STREAM_NAME # Kinesis stream name
  - name: consumerName
    value: KINESIS_CONSUMER_NAME # Kinesis consumer name
  - name: mode
    value: shared # shared - Shared throughput or extended - Extended/Enhanced fanout
  - name: region
    value: AWS_REGION #replace
  - name: accessKey
    value: AWS_ACCESS_KEY # replace
  - name: secretKey
    value: AWS_SECRET_KEY #replace
  - name: sessionToken
    value: *****************

```
{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support |  Details | Example |
|--------------------|:--------:|------------|-----|---------|
| mode | N | Input| The Kinesis stream mode. `shared`- Shared throughput, `extended` - Extended/Enhanced fanout methods. More details are [here](https://docs.aws.amazon.com/streams/latest/dev/building-consumers.html). Defaults to `"shared"` | `"shared"`, `"extended"` |
| streamName | Y | Input/Output | The AWS Kinesis Stream Name | `"stream"` |
| consumerName | Y | Input |  The AWS Kinesis Consumer Name | `"myconsumer"` |
| region             | Y        | Output |  The specific AWS region the AWS Kinesis instance is deployed in | `"us-east-1"`       |
| accessKey          | Y        | Output | The AWS Access Key to access this resource                              | `"key"`             |
| secretKey          | Y        | Output | The AWS Secret Access Key to access this resource                       | `"secretAccessKey"` |
| sessionToken       | N        | Output | The AWS session token to use                                            | `"sessionToken"`    |

## Binding support

This component supports both **input and output** binding interfaces.

This component supports **output binding** with the following operations:

- `create`
## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
- [Authenticating to AWS]({{< ref authenticating-aws.md >}})
