---
type: docs
title: "Tencent Cloud Secrets Manager (SSM)"
linkTitle: "Tencent Cloud Secrets Manager (SSM)"
description: Detailed information on the Tencent Cloud Secrets Manager (SSM) - secret store component
aliases:
  - "/operations/components/setup-secret-store/supported-secret-stores/tencentcloud-ssm/"
---

## Component format

To setup Tencent Cloud Secrets Manager (SSM) secret store create a component of type `secretstores.tencentcloud.ssm`.
See [this guide]({{% ref "setup-secret-store.md#apply-the-configuration" %}}) on how to create and apply a secretstore configuration.
See this guide on [referencing secrets]({{% ref component-secrets.md %}}) to retrieve and use the secret with Dapr components.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: tencentcloudssm
spec:
  type: secretstores.tencentcloud.ssm
  version: v1
  metadata:
  - name: region
    value: "[tencentcloud_region]"
  - name: secretId
    value: "[tencentcloud_secret_id]"
  - name: secretKey
    value: "[tencentcloud_secret_key]"
  - name: token
    value: "[tencentcloud_secret_token]"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings.
It is recommended to use a local secret store such as [Kubernetes secret store]({{% ref kubernetes-secret-store.md %}}) or a [local file]({{% ref file-secret-store.md %}}) to bootstrap secure key storage.
{{% /alert %}}

## Spec metadata fields

| Field           | Required | Details                                                          | Example             |
| --------------- | :------: | ---------------------------------------------------------------- | ------------------- |
| region          |    Y     | The specific region the Tencent SSM instance is deployed in      | `"ap-beijing-3"`      |
| secretId        |    Y     | The SecretId of the Tencent Cloud account                        | `"xyz"` |
| secretKey       |    Y     | The SecretKey of the Tencent Cloud account                       | `"xyz"` |
| token           |    N     | The Token of the Tencent Cloud account. This is required only if using temporary credentials | `""`                |

## Optional per-request metadata properties

The following [optional query parameters]({{% ref "secrets_api#query-parameters" %}}) can be provided when retrieving secrets from this secret store:

Query Parameter | Description
--------- | -----------
`metadata.version_id` | Version for the given secret key.

## Setup Tencent Cloud Secrets Manager (SSM)

Setup Tencent Cloud Secrets Manager (SSM) using the Tencent Cloud documentation: https://www.tencentcloud.com/products/ssm

## Related links

- [Secrets building block]({{% ref secrets %}})
- [How-To: Retrieve a secret]({{% ref "howto-secrets.md" %}})
- [How-To: Reference secrets in Dapr components]({{% ref component-secrets.md %}})
- [Secrets API reference]({{% ref secrets_api.md %}})
