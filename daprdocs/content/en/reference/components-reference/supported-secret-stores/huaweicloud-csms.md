---
type: docs
title: "HuaweiCloud Cloud Secret Management Service (CSMS)"
linkTitle: "HuaweiCloud Cloud Secret Management Service (CSMS)"
description: Detailed information on the HuaweiCloud Cloud Secret Management Service (CSMS) - secret store component
aliases:
  - "/operations/components/setup-secret-store/supported-secret-stores/huaweicloud-csms/"
---

## Component format

To setup HuaweiCloud Cloud Secret Management Service (CSMS) secret store create a component of type `secretstores.huaweicloud.csms`. See [this guide]({{< ref "setup-secret-store.md#apply-the-configuration" >}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: huaweicloudcsms
  namespace: default
spec:
  type: secretstores.huaweicloud.csms
  version: v1
  metadata:
  - name: region
    value: "[huaweicloud_region]"
  - name: accessKey 
    value: "[huaweicloud_access_key]"
  - name: secretAccessKey
    value: "[huaweicloud_secret_access_key]"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a local secret store such as [Kubernetes secret store]({{< ref kubernetes-secret-store.md >}}) or a [local file]({{< ref file-secret-store.md >}}) to bootstrap secure key storage.
{{% /alert %}}

## Spec metadata fields

| Field           | Required | Details                                                          | Example             |
| --------------- | :------: | ---------------------------------------------------------------- | ------------------- |
| region          |    Y     | The specific region the HuaweiCloud CSMS instance is deployed in | `"cn-north-4"`      |
| accessKey       |    Y     | The HuaweiCloud Access Key to access this resource               | `"accessKey"`       |
| secretAccessKey |    Y     | The HuaweiCloud Secret Access Key to access this resource        | `"secretAccessKey"` |

## Setup HuaweiCloud Cloud Secret Management Service (CSMS) instance

Setup HuaweiCloud Cloud Secret Management Service (CSMS) using the HuaweiCloud documentation: https://support.huaweicloud.com/intl/en-us/usermanual-dew/dew_01_9993.html.

## Related links

- [Secrets building block]({{< ref secrets >}})
- [How-To: Retrieve a secret]({{< ref "howto-secrets.md" >}})
- [How-To: Reference secrets in Dapr components]({{< ref component-secrets.md >}})
- [Secrets API reference]({{< ref secrets_api.md >}})
