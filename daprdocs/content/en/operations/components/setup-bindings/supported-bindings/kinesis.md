---
type: docs
title: "AWS Kinesis binding spec"
linkTitle: "AWS Kinesis"
description: "Detailed documentation on the AWS Kinesis binding component"
---

See [this](https://aws.amazon.com/kinesis/data-streams/getting-started/) for instructions on how to set up an AWS Kinesis data streams

## Setup Dapr component
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
- `mode` Accepted values: shared, extended. shared - Shared throughput, extended - Extended/Enhanced fanout methods. More details are [here](https://docs.aws.amazon.com/streams/latest/dev/building-consumers.html)
- `streamName` is the AWS Kinesis Stream Name.
- `consumerName` is the AWS Kinesis Consumer Name.


{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Output Binding Supported Operations

* create

## Related links
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
- [Authenticating to AWS]({{< ref authenticating-aws.md >}})