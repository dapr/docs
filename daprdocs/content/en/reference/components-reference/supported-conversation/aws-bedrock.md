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
  - name: responseCacheTTL
    value: 10m
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets, as described [here]({{% ref component-secrets.md %}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| `region` | N | AWS region for the Bedrock service. | `us-east-1` |
| `endpoint` | N | AWS endpoint for the component to use and connect to emulators. Not recommended for production AWS use. | `http://localhost:4566` |
| `accessKey` | N | AWS access key for authentication. It is recommended to use a secret store for this value. | `"AKIAIOSFODNN7EXAMPLE"` |
| `secretKey` | N | AWS secret key for authentication. It is recommended to use a secret store for this value. | `"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"` |
| `sessionToken` | N | AWS session token for temporary credentials. It is recommended to use a secret store for this value. | `"session-token-example"` |
| `model` | N | The LLM to use. Defaults to Bedrock's default provider model from Amazon. | `amazon.titan-text-express-v1` |
| `responseCacheTTL` | N | A time-to-live for the in-memory response cache. When set, identical requests are served from cache until they expire. | `10m` |
| `assumeRoleArn` | N | ARN of the role to assume for authentication. | `arn:aws:iam::123456789012:role/MyRole` |
| `trustAnchorArn` | N | ARN of the trust anchor for authentication. | `arn:aws:rolesanywhere:us-east-1:123456789012:trust-anchor/12345678-1234-1234-1234-123456789012` |
| `trustProfileArn` | N | ARN of the trust profile for authentication. | `arn:aws:rolesanywhere:us-east-1:123456789012:profile/12345678-1234-1234-1234-123456789012` |

## Authenticating AWS

Instead of using a `key` parameter, AWS Bedrock authenticates using Dapr's standard method of IAM or static credentials. [Learn more about authenticating with AWS.]({{% ref authenticating-aws.md %}})

## Related links

- [Conversation API overview]({{% ref conversation-overview.md %}})
