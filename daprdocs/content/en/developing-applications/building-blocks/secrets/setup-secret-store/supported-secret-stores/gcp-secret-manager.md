---
type: docs
title: "GCP Secret Manager"
linkTitle: "GCP Secret Manager"
description: Detailed information on the GCP Secret Manager secret store component
---

This document shows how to enable GCP Secret Manager secret store using [Dapr Secrets Component./../concepts/secrets/README.md) for self hosted and Kubernetes mode.

## Setup GCP Secret Manager instance

Setup GCP Secret Manager using the GCP documentation: https://cloud.google.com/secret-manager/docs/quickstart.

## Setup Dapr component

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: gcpsecretmanager
  namespace: default
spec:
  type: secretstores.gcp.secretmanager
  version: v1
  metadata:
  - name: type
    value: service_account
  - name: project_id
    value: project_111
  - name: private_key_id
    value: *************
  - name: client_email
    value: name@domain.com
  - name: client_id
    value: '1111111111111111'
  - name: auth_uri
    value: https://accounts.google.com/o/oauth2/auth
  - name: token_uri
    value: https://oauth2.googleapis.com/token
  - name: auth_provider_x509_cert_url
    value: https://www.googleapis.com/oauth2/v1/certs
  - name: client_x509_cert_url
    value: https://www.googleapis.com/robot/v1/metadata/x509/<project-name>.iam.gserviceaccount.com
  - name: private_key
    value: PRIVATE KEY
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a local secret store such as [Kubernetes secret store]({{< ref kubernetes-secret-store.md >}}) or a [local file]({{< ref file-secret-store.md >}}) to bootstrap secure key storage.
{{% /alert %}}

## Apply the component

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
To run locally, create a `components` dir containing the YAML file and provide the path to the `dapr run` command with the flag `--components-path`.

{{% /codetab %}}

{{% codetab %}}
To deploy in Kubernetes, save the file above to `gcp_secret_manager.yaml` and then run:

```bash
kubectl apply -f gcp_secret_manager.yaml
```
{{% /codetab %}}

{{< /tabs >}}

## Example

This example shows you how to take the Redis password from the GCP Secret Manager secret store.
Here, you created a secret named `redisPassword` in GCP Secret Manager. Note its important to set it both as the `name` and `key` properties.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: default
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: "[redis]:6379"
  - name: redisPassword
    secretKeyRef:
      name: redisPassword
      key: redisPassword
auth:
    secretStore: gcpsecretmanager
```

## Related links
- [Secrets building block]({{< ref secrets >}})
- [How-To: Retreive a secret]({{< ref "howto-secrets.md" >}})
- [How-To: Reference secrets in Dapr components]({{< ref component-secrets.md >}})
- [Secrets API reference]({{< ref secrets_api.md >}})