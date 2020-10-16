---
type: docs
title: "AWS Secrets Manager"
linkTitle: "AWS Secrets Manager"
description: Detailed information on the  decret store component
---

## Create an AWS Secrets Manager instance

Setup AWS Secrets Manager using the AWS documentation: https://docs.aws.amazon.com/secretsmanager/latest/userguide/tutorials_basic.html.

## Create the Dapr component

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: awssecretmanager
  namespace: default
spec:
  type: secretstores.aws.secretmanager
  metadata:
  - name: region
    value: [aws_region] # Required.
  - name: accessKey # Required.
    value: "[aws_access_key]"
  - name: secretKey # Required.
    value: "[aws_secret_key]"
  - name: sessionToken # Required.
    value: "[aws_session_token]"
```

## Apply the configuration

Read [this guide]({{< ref howto-secrets.md >}}) to learn how to apply a Dapr component.

## Example

This example shows you how to set the Redis password from the AWS Secret Manager secret store.
Here, you created a secret named `redisPassword` in AWS Secret Manager. Note its important to set it both as the `name` and `key` properties.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: default
spec:
  type: state.redis
  metadata:
  - name: redisHost
    value: "[redis]:6379"
  - name: redisPassword
    secretKeyRef:
      name: redisPassword
      key: redisPassword
auth:
    secretStore: awssecretmanager
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a local secret store such as [Kubernetes secret store]({{< ref kubernetes-secret-store.md >}}) or a [local file]({{< ref file-secret-store.md >}}) to bootstrap secure key storage.
{{% /alert %}}

## Related links
- [Secrets building block]({{< ref secrets >}})
- [How-To: Retreive a secret]({{< ref "howto-secrets.md" >}})
- [How-To: Reference secrets in Dapr components]({{< ref component-secrets.md >}})
- [Secrets API reference]({{< ref secrets_api.md >}})