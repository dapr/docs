---
type: docs
title: "AWS Bedrock"
linkTitle: "AWS Bedrock"
description: Detailed information on the AWS Bedrock conversation component
---

{{% alert title="Recommended" color="primary" %}}
Authenticate this component with the app's Dapr SPIFFE identity instead of access keys. SPIFFE authentication is secretless: no long-lived credential is stored, and the provider grants access to your app's own Dapr identity. See [SPIFFE authentication](#spiffe-authentication-recommended).
{{% /alert %}}

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
| `maxTokens` | N | Default maximum number of tokens the model may generate per request. A request-level `maxTokens` value overrides this default. When unset, no cap is sent and the provider's own default applies. | `2048` |
| `responseCacheTTL` | N | A time-to-live for the in-memory response cache. When set, identical requests are served from cache until they expire. | `10m` |
| `assumeRoleArn` | N | ARN of the role to assume for authentication. Together with `trustAnchorArn` and `trustProfileArn`, it selects [IAM Roles Anywhere](#iam-roles-anywhere). Together with `webIdentityAudience`, it selects [SPIFFE authentication](#spiffe-authentication-recommended). | `arn:aws:iam::123456789012:role/MyRole` |
| `trustAnchorArn` | N | ARN of the IAM Roles Anywhere trust anchor. See [IAM Roles Anywhere](#iam-roles-anywhere). | `arn:aws:rolesanywhere:us-east-1:123456789012:trust-anchor/12345678-1234-1234-1234-123456789012` |
| `trustProfileArn` | N | ARN of the IAM Roles Anywhere profile. See [IAM Roles Anywhere](#iam-roles-anywhere). | `arn:aws:rolesanywhere:us-east-1:123456789012:profile/12345678-1234-1234-1234-123456789012` |
| `assumeRoleSessionName` | N | Session name for the assumed role. | `dapr-bedrock` |
| `webIdentityAudience` | N | Assume `assumeRoleArn` with a JWT SVID for this audience. See [SPIFFE authentication](#spiffe-authentication-recommended). | `sts.amazonaws.com` |

## Authenticating AWS

Instead of using a `key` parameter, AWS Bedrock authenticates using Dapr's standard AWS authentication profiles. The recommended profiles use the app's SPIFFE identity: [web identity federation](#spiffe-authentication-recommended) with a JWT SVID, or [IAM Roles Anywhere](#iam-roles-anywhere) with the X.509 SVID. [Learn more about authenticating with AWS.]({{% ref authenticating-aws.md %}})

## SPIFFE authentication (recommended)

The component can assume an IAM role with the app's SPIFFE identity, using `AssumeRoleWithWebIdentity` with a JWT SVID minted by Sentry. Set both `assumeRoleArn` and `webIdentityAudience` to enable it. Requires Dapr 1.20 or later. See [SPIFFE authentication]({{% ref spiffe-authentication.md %}}) for why this is recommended, and for the Dapr prerequisites.

1. In IAM, create an OpenID Connect identity provider with the Sentry JWT issuer as the provider URL, and `sts.amazonaws.com` as the audience.
2. Create a role that the identity provider can assume, with a trust policy restricted to the app's SPIFFE ID:

   ```json
   {
     "Effect": "Allow",
     "Principal": { "Federated": "arn:aws:iam::123456789012:oidc-provider/<your-issuer-domain>" },
     "Action": "sts:AssumeRoleWithWebIdentity",
     "Condition": {
       "StringEquals": {
         "<your-issuer-domain>:aud": "sts.amazonaws.com",
         "<your-issuer-domain>:sub": "spiffe://public/ns/default/my-app"
       }
     }
   }
   ```

3. Grant the role access to Bedrock.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: bedrock
spec:
  type: conversation.aws.bedrock
  metadata:
  - name: region
    value: "us-east-1"
  - name: assumeRoleArn
    value: "arn:aws:iam::123456789012:role/dapr-bedrock"
  - name: webIdentityAudience
    value: "sts.amazonaws.com"
```

## IAM Roles Anywhere

The component can also authenticate with the app's X.509 SVID, using [IAM Roles Anywhere]({{% ref "authenticating-aws.md#iam-roles-anywhere" %}}). Set `trustAnchorArn`, `trustProfileArn`, and `assumeRoleArn` to enable it. When all three are set, IAM Roles Anywhere is used, even if `webIdentityAudience` is also set. Requires Dapr 1.20 or later: earlier versions of this component ignored the trust anchor and profile.

IAM Roles Anywhere does not accept the Ed25519 workload keys that Dapr generates by default. Set the `dapr.io/workload-key-algorithm: "ecdsa"` annotation, or the `--workload-key-algorithm ecdsa` flag in self-hosted mode.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: bedrock
spec:
  type: conversation.aws.bedrock
  metadata:
  - name: region
    value: "us-east-1"
  - name: trustAnchorArn
    value: "arn:aws:rolesanywhere:us-east-1:123456789012:trust-anchor/12345678-1234-1234-1234-123456789012"
  - name: trustProfileArn
    value: "arn:aws:rolesanywhere:us-east-1:123456789012:profile/12345678-1234-1234-1234-123456789012"
  - name: assumeRoleArn
    value: "arn:aws:iam::123456789012:role/dapr-bedrock"
```

## Related links

- [Conversation API overview]({{% ref conversation-overview.md %}})
