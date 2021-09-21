---
type: docs
title: "GCP Pub/Sub"
linkTitle: "GCP Pub/Sub"
description: "Detailed documentation on the GCP Pub/Sub component"
aliases:
  - "/operations/components/setup-pubsub/supported-pubsub/setup-gcp/"
  - "/operations/components/setup-pubsub/supported-pubsub/setup-gcp-pubsub/"
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
  - name: projectId
    value: <PROJECT_ID> # replace
  - name: identityProjectId
    value: <IDENTITY_PROJECT_ID> # replace
  - name: privateKeyId
    value: <PRIVATE_KEY_ID> #replace
  - name: clientEmail
    value: <CLIENT_EMAIL> #replace
  - name: clientId
    value: <CLIENT_ID> # replace
  - name: authUri
    value: https://accounts.google.com/o/oauth2/auth
  - name: tokenUri
    value: https://oauth2.googleapis.com/token
  - name: authProviderX509CertUrl
    value: https://www.googleapis.com/oauth2/v1/certs
  - name: clientX509CertUrl
    value: https://www.googleapis.com/robot/v1/metadata/x509/<PROJECT_NAME>.iam.gserviceaccount.com #replace PROJECT_NAME
  - name: privateKey
    value: <PRIVATE_KEY> # replace x509 cert
  - name: disableEntityManagement
    value: "false"
  - name: enableMessageOrdering
    value: "false"
```
{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| type           | N | GCP credentials type. Only `service_account` is supported. Defaults to `service_account`  | `service_account`
| projectId     | Y | GCP project id| `myproject-123`
| identityProjectId | N | If the GCP pubsub project is different from the identity project, specify the identity project using this attribute  | `"myproject-123"`
| privateKeyId | N | If using explicit credentials, this field should contain the `private_key_id` field from the service account json document | `"my-private-key"`
| privateKey    | N |  If using explicit credentials, this field should contain the `private_key` field from the service account json | `-----BEGIN PRIVATE KEY-----MIIBVgIBADANBgkqhkiG9w0B`
| clientEmail   | N | If using explicit credentials, this field should contain the `client_email` field from the service account json  | `"myservice@myproject-123.iam.gserviceaccount.com"`
| clientId      | N |  If using explicit credentials, this field should contain the `client_id` field from the service account json | `106234234234`
| authUri       | N | If using explicit credentials, this field should contain the `auth_uri` field from the service account json | `https://accounts.google.com/o/oauth2/auth`
| tokenUri      | N | If using explicit credentials, this field should contain the `token_uri` field from the service account json | `https://oauth2.googleapis.com/token`
| authProviderX509CertUrl | N | If using explicit credentials, this field should contain the `auth_provider_x509_cert_url` field from the service account json | `https://www.googleapis.com/oauth2/v1/certs`
| clientX509CertUrl | N | If using explicit credentials, this field should contain the `client_x509_cert_url` field from the service account json | `https://www.googleapis.com/robot/v1/metadata/x509/myserviceaccount%40myproject.iam.gserviceaccount.com`
| disableEntityManagement | N | When set to `"true"`, topics and subscriptions do not get created automatically. Default: `"false"` | `"true"`, `"false"`
| enableMessageOrdering | N | When set to `"true"`, subscribed messages will be received in order, depending on publishing and permissions configuration. | `"true"`, `"false"`

{{% alert title="Warning" color="warning" %}}
If `enableMessageOrdering` is set to "true", the roles/viewer or roles/pubsub.viewer role will be required on the service account in order to guarantee ordering in cases where order tokens are not embedded in the messages. If this role is not given, or the call to Subscription.Config() fails for any other reason, ordering by embedded order tokens will still function correctly.
{{% /alert %}}

## Create a GCP Pub/Sub
You can use either "explicit" or "implicit" credentials to configure access to your GCP pubsub instance. If using explicit, most fields are required. Implicit relies on dapr running under a Kubernetes service account (KSA) mapped to a Google service account (GSA) which has the necessary permissions to access pubsub. In implicit mode, only the `projectId` attribute is needed, all other are optional.

Follow the instructions [here](https://cloud.google.com/pubsub/docs/quickstart-console) on setting up Google Cloud Pub/Sub system.

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [Pub/Sub building block]({{< ref pubsub >}})
