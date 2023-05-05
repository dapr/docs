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
spec:
  type: pubsub.gcp.pubsub
  version: v1
  metadata:
  - name: type
    value: service_account
  - name: projectId
    value: <PROJECT_ID> # replace
  - name: endpoint # Optional. 
    value: "http://localhost:8085"
  - name: consumerID # Optional - defaults to the app's own ID
    value: <CONSUMER_ID> 
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
  - name: orderingKey # Optional
    value: <ORDERING_KEY>
  - name: maxReconnectionAttempts # Optional
    value: 30
  - name: connectionRecoveryInSec # Optional
    value: 2
  - name: deadLetterTopic # Optional
    value: <EXISTING_PUBSUB_TOPIC>
  - name: maxDeliveryAttempts # Optional
    value: 5
```
{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| projectId     | Y | GCP project id| `myproject-123`
| endpoint       | N  | GCP endpoint for the component to use. Only used for local development with, for example, [GCP Pub/Sub Emulator](https://cloud.google.com/pubsub/docs/emulator). The `endpoint` is unncessary when running against the GCP production API. | `"http://localhost:8085"`
| `consumerID`         | N        | The Consumer ID organizes one or more consumers into a group. Consumers with the same consumer ID work as one virtual consumer; for example, a message is processed only once by one of the consumers in the group. If the consumer ID is not set, the Dapr runtime will set it to the Dapr application ID. The `consumerID`, along with the `topic` provided as part of the request, are used to build the Pub/Sub subscription ID |
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
| orderingKey |N | The key provided in the request. It's used when `enableMessageOrdering` is set to `true` to order messages based on such key. | "my-orderingkey"
| maxReconnectionAttempts | N  |Defines the maximum number of reconnect attempts. Default: `30` | `30`
| connectionRecoveryInSec | N  |Time in seconds to wait between connection recovery attempts. Default: `2` | `2`
| deadLetterTopic | N  | Name of the GCP Pub/Sub Topic. This topic **must** exist before using this component.  | `"myapp-dlq"`
| maxDeliveryAttempts | N  | Maximun number of attempts to deliver the message. If `deadLetterTopic` is specified, `maxDeliveryAttempts` is the maximun number of attempts for failed processing of messages, once that number is reached, the message will be moved to the dead-letter Topic. Default: `5` | `5`
| type           | N | **DEPRECATED** GCP credentials type. Only `service_account` is supported. Defaults to `service_account`  | `service_account`



{{% alert title="Warning" color="warning" %}}
If `enableMessageOrdering` is set to "true", the roles/viewer or roles/pubsub.viewer role will be required on the service account in order to guarantee ordering in cases where order tokens are not embedded in the messages. If this role is not given, or the call to Subscription.Config() fails for any other reason, ordering by embedded order tokens will still function correctly.
{{% /alert %}}

## GCP Credentials

The GCP Pub/Sub component uses the GCP Go Client Libraries and by default it authenticates using **Application Default Credentials** as explained in the [Authenticate to GCP Cloud services using client libraries](https://cloud.google.com/docs/authentication/client-libraries) 

## Create a GCP Pub/Sub

{{< tabs "Self-Hosted" "GCP" >}}

{{% codetab %}}
For local development, the [GCP Pub/Sub Emulator](https://cloud.google.com/pubsub/docs/emulator) is used to test the GCP Pub/Sub Component. Follow [these instructions](https://cloud.google.com/pubsub/docs/emulator#start) to run the GCP Pub/Sub Emulator.

To run the GCP Pub/Sub Emulator locally using Docker, use the following `docker-compose.yaml`:

```yaml
version: '3'
services:
  pubsub:
    image: gcr.io/google.com/cloudsdktool/cloud-sdk:422.0.0-emulators
    ports:
      - "8085:8085"
    container_name: gcp-pubsub
    entrypoint: gcloud beta emulators pubsub start --project local-test-prj --host-port 0.0.0.0:8085

```

In order to use the GCP Pub/Sub Emulator with your pub/sub binding, you need to provide the `endpoint` configuration in the component metadata. The `endpoint` is unnecessary when running against the GCP Production API.

The **projectId** attribute must match the `--project` used in either the `docker-compose.yaml` or Docker command.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: gcp-pubsub
spec:
  type: pubsub.gcp.pubsub
  version: v1
  metadata:
  - name: projectId
    value: "local-test-prj"
  - name: consumerID
    value: "testConsumer"
  - name: endpoint
    value: "localhost:8085"
```

{{% /codetab %}}


{{% codetab %}}

You can use either "explicit" or "implicit" credentials to configure access to your GCP pubsub instance. If using explicit, most fields are required. Implicit relies on dapr running under a Kubernetes service account (KSA) mapped to a Google service account (GSA) which has the necessary permissions to access pubsub. In implicit mode, only the `projectId` attribute is needed, all other are optional.

Follow the instructions [here](https://cloud.google.com/pubsub/docs/quickstart-console) on setting up Google Cloud Pub/Sub system.

{{% /codetab %}}

{{< /tabs >}}

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [Pub/Sub building block]({{< ref pubsub >}})
