---
type: docs
title: "GCP Pub/Sub binding spec"
linkTitle: "GCP Pub/Sub"
description: "Detailed documentation on the GCP Pub/Sub binding component"
---

## Setup Dapr component

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.gcp.pubsub
  metadata:
  - name: topic
    value: topic1
  - name: subscription
    value: subscription1
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

- `topic` is the Pub/Sub topic name.
- `subscription` is the Pub/Sub subscription name.
- `type` is the GCP credentials type.
- `project_id` is the GCP project id.
- `private_key_id` is the GCP private key id.
- `client_email` is the GCP client email.
- `client_id` is the GCP client id.
- `auth_uri` is Google account OAuth endpoint.
- `token_uri` is Google account token uri.
- `auth_provider_x509_cert_url` is the GCP credentials cert url.
- `client_x509_cert_url` is the GCP credentials project x509 cert url.
- `private_key` is the GCP credentials private key.

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Output Binding Supported Operations

* create

## Related links
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})