---
type: docs
title: "GCP Secret Manager"
linkTitle: "GCP Secret Manager"
description: Detailed information on the GCP Secret Manager secret store component
aliases:
  - "/operations/components/setup-secret-store/supported-secret-stores/gcp-secret-manager/"
---

## Component format

To setup GCP Secret Manager secret store create a component of type `secretstores.gcp.secretmanager`. See [this guide]({{< ref "setup-secret-store#apply-the-configuration" >}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

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
    value: <replace-with-account-type>
  - name: project_id
    value: <replace-with-project-id>
  - name: private_key_id
    value: <replace-with-private-key-id>
  - name: client_email
    value: <replace-with-email>
  - name: client_id
    value: <replace-with-client-id>
  - name: auth_uri
    value: <replace-with-auth-uri>
  - name: token_uri
    value: <replace-with-token-uri>
  - name: auth_provider_x509_cert_url
    value: <replace-with-auth-provider-cert-url>
  - name: client_x509_cert_url
    value: <replace-with-client-cert-url>
  - name: private_key
    value: <replace-with-private-key>
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a local secret store such as [Kubernetes secret store]({{< ref kubernetes-secret-store.md >}}) or a [local file]({{< ref file-secret-store.md >}}) to bootstrap secure key storage.
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details                        | Example             |
|--------------------|:--------:|--------------------------------|---------------------|
| type               | Y        | The type of the account.   | `"serviceAccount"` |
| project_id         | Y        | The project ID associated with this component. | `"project_id"` |
| private_key_id     | N        | The private key ID  | `"privatekey"` |
| client_email       | Y        | The client email address | `"client@example.com"` |
| client_id          | N        | The ID of the client     | `"11111111"` |
| auth_uri           | N        | The authentication URI   | `"https://accounts.google.com/o/oauth2/auth"` |
| token_uri          | N        | The authentication token URI | `"https://oauth2.googleapis.com/token"` |
| auth_provider_x509_cert_url | N | The certificate URL for the auth provider | `"https://www.googleapis.com/oauth2/v1/certs"` |
| client_x509_cert_url | N | The certificate URL for the client | `"https://www.googleapis.com/robot/v1/metadata/x509/<project-name>.iam.gserviceaccount.com"`|
| private_key | Y | The private key for authentication | `"privateKey"` |

## Setup GCP Secret Manager instance

Setup GCP Secret Manager using the GCP documentation: https://cloud.google.com/secret-manager/docs/quickstart.

## Related links
- [Secrets building block]({{< ref secrets >}})
- [How-To: Retrieve a secret]({{< ref "howto-secrets.md" >}})
- [How-To: Reference secrets in Dapr components]({{< ref component-secrets.md >}})
- [Secrets API reference]({{< ref secrets_api.md >}})
