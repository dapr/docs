---
type: docs
title: "GCP Pub/Sub"
linkTitle: "GCP Pub/Sub"
description: "Detailed documentation on the GCP Pub/Sub component"
aliases: ["/operations/components/setup-pubsub/supported-pubsub/setup-gcp/"]
---

## Create a Dapr component

To setup GCP pubsub create a component of type `pubsub.gcp.pubsub`. See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: gcp-pubsub
  namespace: default
spec:
  type: pubsub.gcp.pubsub
  version: v1
  metadata:
  - name: type
    value: service_account
  - name: project_id
    value: <PROJECT_ID> # replace
  - name: private_key_id
    value: <PRIVATE_KEY_ID> #replace
  - name: client_email
    value: <CLIENT_EMAIL> #replace
  - name: client_id
    value: <CLIENT_ID> # replace
  - name: auth_uri
    value: https://accounts.google.com/o/oauth2/auth
  - name: token_uri
    value: https://oauth2.googleapis.com/token
  - name: auth_provider_x509_cert_url
    value: https://www.googleapis.com/oauth2/v1/certs
  - name: client_x509_cert_url
    value: https://www.googleapis.com/robot/v1/metadata/x509/<PROJECT_NAME>.iam.gserviceaccount.com #replace PROJECT_NAME
  - name: private_key
    value: <PRIVATE_KEY> # replace x509 cert  
  - name: disableEntityManagement
    value: "false"
```

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| type           | Y | GCP credentials type  | `service_account`
| project_id     | Y | GCP project id| `projectId`
| private_key_id | Y | GCP private key id | `"privateKeyId"`
| private_key    | Y | GCP credentials private key. Replace with x509 cert | `12345-12345`
| client_email   | Y | GCP client email  | `"client@email.com"`
| client_id      | Y |  GCP client id | `0123456789-0123456789`
| auth_uri       | Y | Google account OAuth endpoint | `https://accounts.google.com/o/oauth2/auth`
| token_uri      | Y | Google account token uri | `https://oauth2.googleapis.com/token`
| auth_provider_x509_cert_url | Y | GCP credentials cert url | `https://www.googleapis.com/oauth2/v1/certs`
| client_x509_cert_url | Y | GCP credentials project x509 cert url | `https://www.googleapis.com/robot/v1/metadata/x509/<PROJECT_NAME>.iam.gserviceaccount.com`
| disableEntityManagement | N | When set to `"true"`, topics and subscriptions do not get created automatically. Default: `"false"` | `"true"`, `"false"`

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Create a GCP Pub/Sub

Follow the instructions [here](https://cloud.google.com/pubsub/docs/quickstart-console) on setting up Google Cloud Pub/Sub system.

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [Pub/Sub building block]({{< ref pubsub >}})