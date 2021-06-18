---
type: docs
title: "GCP Pub/Sub binding spec"
linkTitle: "GCP Pub/Sub"
description: "Detailed documentation on the GCP Pub/Sub binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/gcppubsub/"
---

## Component format

To setup Azure Pub/Sub binding create a component of type `bindings.gcp.pubsub`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.gcp.pubsub
  version: v1
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
{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required  | Binding support | Details | Example |
|--------------------|:--------:|-----------| -----|---------|
| topic | Y | Output | GCP Pub/Sub topic name | `"topic1"` |
| subscription | N | GCP Pub/Sub subscription name | `"name1"` |
| type           | Y | Output | GCP credentials type  | `service_account`
| project_id     | Y | Output | GCP project id| `projectId`
| private_key_id | N | Output | GCP private key id | `"privateKeyId"`
| private_key    | Y | Output | GCP credentials private key. Replace with x509 cert | `12345-12345`
| client_email   | Y | Output | GCP client email  | `"client@email.com"`
| client_id      | N | Output | GCP client id | `0123456789-0123456789`
| auth_uri       | N | Output | Google account OAuth endpoint | `https://accounts.google.com/o/oauth2/auth`
| token_uri      | N | Output | Google account token uri | `https://oauth2.googleapis.com/token`
| auth_provider_x509_cert_url | N | Output |GCP credentials cert url | `https://www.googleapis.com/oauth2/v1/certs`
| client_x509_cert_url | N | Output | GCP credentials project x509 cert url | `https://www.googleapis.com/robot/v1/metadata/x509/<PROJECT_NAME>.iam.gserviceaccount.com`

## Binding support

This component supports **output binding** with the following operations:

- `create`

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
