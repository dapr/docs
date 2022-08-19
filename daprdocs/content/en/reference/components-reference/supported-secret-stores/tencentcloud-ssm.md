---
type: docs
title: "TencentCloud SSM(Secrets Manager)"
linkTitle: "TencentCloud SSM(Secrets Manager)"
description: Detailed information on the TencentCloud SSM - secret store component
aliases:
  - "/operations/components/setup-secret-store/supported-secret-stores/tencentcloud-ssm"
---

## Component format

To setup TencentCloud SSM secret store create a component of type `secretstores.tencent.ssm`. See [this guide]({{< ref "setup-secret-store.md#apply-the-configuration" >}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: tencentcloudssm
spec:
  type: secretstores.tencentcloud.ssm
  version: v1
  metadata:
  - name: SecretID
    value: "[tencentcloud_secret_id]"
  - name: SecretKey
    value: "[tencentcloud_secret_key]"
  - name: Token
    value: "[tencentcloud_token]"
  - name: Region
    value: "[tencentcloud_region]"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a local secret store such as [Kubernetes secret store]({{< ref kubernetes-secret-store.md >}}) or a [local file]({{< ref file-secret-store.md >}}) to bootstrap secure key storage.
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details                                                                 | Example             |
|--------------------|:--------:|-------------------------------------------------------------------------|---------------------|
| SecretID        | Y        | The TencentCloud Secret ID to access this resource                  | `"SecretID"`      |
| SecretKey    | Y        | The TencentCloud Secret Key to access this resource              | `"SecretKey"`  |
| Region           | Y        | The specific region the TencentCloud SSM instance is deployed in [Region](https://github.com/TencentCloud/tencentcloud-sdk-go/blob/master/tencentcloud/common/regions/regions.go#L19) | `"ap-shanghai"`     |
| Token      | N        | The TencentCloud SSM to use                                  | `"Token"`    |

## Create an TencentCloud SSM instance

Setup TencentCloud SSM using the TencentCloud documentation: [en](https://www.tencentcloud.com/products/ssm) | [zh-CN](https://cloud.tencent.com/document/product/1140).

## Related links

- [Secrets building block]({{< ref secrets >}})
- [How-To: Retrieve a secret]({{< ref "howto-secrets.md" >}})
- [How-To: Reference secrets in Dapr components]({{< ref component-secrets.md >}})
- [Secrets API reference]({{< ref secrets_api.md >}})
