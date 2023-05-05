---
type: docs
title: "GCP Firestore (Datastore mode)"
linkTitle: "GCP Firestore"
description: Detailed information on the GCP Firestore state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-firestore/"
---

## Component format

To setup GCP Firestore state store create a component of type `state.gcp.firestore`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.gcp.firestore
  version: v1
  metadata:
  - name: project_id
    value: <REPLACE-WITH-PROJECT-ID> # Required.
  - name: endpoint # Optional. 
    value: "http://localhost:8432"
  - name: private_key_id
    value: <REPLACE-WITH-PRIVATE-KEY-ID> # Optional.
  - name: private_key
    value: <REPLACE-WITH-PRIVATE-KEY> # Optional, but Required if `private_key_id` is specified.
  - name: client_email
    value: <REPLACE-WITH-CLIENT-EMAIL> # Optional, but Required if `private_key_id` is specified.
  - name: client_id
    value: <REPLACE-WITH-CLIENT-ID> # Optional, but Required if `private_key_id` is specified.
  - name: auth_uri
    value: <REPLACE-WITH-AUTH-URI> # Optional.
  - name: token_uri
    value: <REPLACE-WITH-TOKEN-URI> # Optional.
  - name: auth_provider_x509_cert_url
    value: <REPLACE-WITH-AUTH-X509-CERT-URL> # Optional.
  - name: client_x509_cert_url
    value: <REPLACE-WITH-CLIENT-x509-CERT-URL> # Optional.
  - name: entity_kind
    value: <REPLACE-WITH-ENTITY-KIND> # Optional. default: "DaprState"
  - name: noindex
    value: <REPLACE-WITH-BOOLEAN> # Optional. default: "false"
  - name: type 
    value: <REPLACE-WITH-CREDENTIALS-TYPE> # Deprecated.
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| project_id         | Y        | The ID of the GCP project to use | `"project-id"`
| endpoint       | N  | GCP endpoint for the component to use. Only used for local development with (for example) [GCP Datastore Emulator](https://cloud.google.com/datastore/docs/tools/datastore-emulator). The `endpoint` is unnecessary when running against the GCP production API. | `"localhost:8432"`
| private_key_id     | N        | The ID of the prvate key to use  | `"private-key-id"`
| client_email       | N        | The email address for the client | `"eample@example.com"`
| client_id          | N        | The client id value to use for authentication | `"client-id"`
| auth_uri           | N        | The authentication URI to use | `"https://accounts.google.com/o/oauth2/auth"`
| token_uri          | N        | The token URI to query for Auth token | `"https://oauth2.googleapis.com/token"`
| auth_provider_x509_cert_url | N | The auth provider certificate URL | `"https://www.googleapis.com/oauth2/v1/certs"`
| client_x509_cert_url | N      | The client certificate URL | `"https://www.googleapis.com/robot/v1/metadata/x509/x"`
| entity_kind          | N      | The entity name in Filestore. Defaults to `"DaprState"` | `"DaprState"`
| noindex              | N      | Whether to disable indexing of state entities. Use this setting if you encounter Firestore index size limitations. Defaults to `"false"` | `"true"`
| type                 | N       | **DEPRECATED** The credentials type | `"serviceaccount"`


## GCP Credentials
Since the GCP Firestore component uses the GCP Go Client Libraries, by default it authenticates using **Application Default Credentials**. This is explained in the [Authenticate to GCP Cloud services using client libraries](https://cloud.google.com/docs/authentication/client-libraries) guide.

## Setup GCP Firestore

{{< tabs "Self-Hosted" "Google Cloud" >}}

{{% codetab %}}
You can use the GCP Datastore emulator to run locally using the instructions [here](https://cloud.google.com/datastore/docs/tools/datastore-emulator).

You can then interact with the server using `http://localhost:8432`.
{{% /codetab %}}

{{% codetab %}}
Follow the instructions [here](https://cloud.google.com/datastore/docs/quickstart) to get started with setting up Firestore in Google Cloud.
{{% /codetab %}}

{{< /tabs >}}


## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
