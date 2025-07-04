---
type: docs
title: "AWS Bedrock"
linkTitle: "AWS Bedrock"
description: Detailed information on the AWS Bedrock conversation component
---

## Component format

A Dapr `conversation.yaml` component file has the following structure:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: awsbedrock
spec:
  type: conversation.aws.bedrock
  metadata:
  - name: endpoint
    value: "http://localhost:4566"
  - name: model
    value: amazon.titan-text-express-v1
  - name: cacheTTL
    value: 10m
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets, as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `endpoint`   | N | AWS endpoint for the component to use and connect to emulators. Not recommended for production AWS use. | `http://localhost:4566` |
| `model` | N | The LLM to use. Defaults to Bedrock's default provider model from Amazon.  | `amazon.titan-text-express-v1` |
| `cacheTTL` | N | A time-to-live value for a prompt cache to expire. Uses Golang duration format.  | `10m` |

## Authenticating AWS

Instead of using a `key` parameter, AWS Bedrock authenticates using Dapr's standard method of IAM or static credentials. [Learn more about authenticating with AWS.]({{< ref authenticating-aws.md >}})

## Related links

- [Conversation API overview]({{< ref conversation-overview.md >}})