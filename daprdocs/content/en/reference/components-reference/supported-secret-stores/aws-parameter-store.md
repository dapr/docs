---
type: docs
title: "AWS SSM Parameter Store"
linkTitle: "AWS SSM Parameter Store"
description: Detailed information on the AWS SSM Parameter Store - secret store component
aliases:
  - "/operations/components/setup-secret-store/supported-secret-stores/aws-parameter-store/"
---

## Component format

To setup AWS SSM Parameter Store secret store create a component of type `secretstores.aws.parameterstore`. See [this guide]({{< ref "setup-secret-store.md#apply-the-configuration" >}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

See [Authenticating to AWS]({{< ref authenticating-aws.md >}}) for information about authentication-related attributes.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: awsparameterstore
  namespace: default
spec:
  type: secretstores.aws.parameterstore
  version: v1
  metadata:
  - name: region
    value: "[aws_region]"
  - name: accessKey
    value: "[aws_access_key]"
  - name: secretKey
    value: "[aws_secret_key]"
  - name: sessionToken
    value: "[aws_session_token]"
```
{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a local secret store such as [Kubernetes secret store]({{< ref kubernetes-secret-store.md >}}) or a [local file]({{< ref file-secret-store.md >}}) to bootstrap secure key storage.
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details                                                                 | Example             |
|--------------------|:--------:|-------------------------------------------------------------------------|---------------------|
| region             | Y        | The specific AWS region the AWS SSM Parameter Store instance is deployed in | `"us-east-1"`       |
| accessKey          | Y        | The AWS Access Key to access this resource                              | `"key"`             |
| secretKey          | Y        | The AWS Secret Access Key to access this resource                       | `"secretAccessKey"` |
| sessionToken       | N        | The AWS session token to use                                            | `"sessionToken"`    |
## Create an AWS SSM Parameter Store instance

Setup AWS SSM Parameter Store using the AWS documentation: https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html.

## Related links
- [Secrets building block]({{< ref secrets >}})
- [How-To: Retrieve a secret]({{< ref "howto-secrets.md" >}})
- [How-To: Reference secrets in Dapr components]({{< ref component-secrets.md >}})
- [Secrets API reference]({{< ref secrets_api.md >}})
- [Authenticating to AWS]({{< ref authenticating-aws.md >}})
