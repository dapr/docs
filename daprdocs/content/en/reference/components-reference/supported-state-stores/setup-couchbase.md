---
type: docs
title: "Couchbase"
linkTitle: "Couchbase"
description: Detailed information on the Couchbase state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-couchbase/"
---

## Component format

To setup Couchbase state store create a component of type `state.couchbase`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.couchbase
  version: v1
  metadata:
  - name: couchbaseURL
    value: <REPLACE-WITH-URL> # Required. Example: "http://localhost:8091"
  - name: username
    value: <REPLACE-WITH-USERNAME> # Required.
  - name: password
    value: <REPLACE-WITH-PASSWORD> # Required.
  - name: bucketName
    value: <REPLACE-WITH-BUCKET> # Required.
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| couchbaseURL       | Y        | The URL of the Couchbase server | `"http://localhost:8091"`
| username           | Y        | The username for the database   | `"user"`
| password           | Y        | The password for access         | `"password"`
| bucketName         | Y        | The bucket name to write to     |  `"bucket"`

## Setup Couchbase

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
You can run Couchbase locally using Docker:

```
docker run -d --name db -p 8091-8094:8091-8094 -p 11210:11210 couchbase
```

You can then interact with the server using `localhost:8091` and start the server setup.
{{% /codetab %}}

{{% codetab %}}
The easiest way to install Couchbase on Kubernetes is by using the [Helm chart](https://github.com/couchbase-partners/helm-charts#deploying-for-development-quick-start):

```
helm repo add couchbase https://couchbase-partners.github.io/helm-charts/
helm install couchbase/couchbase-operator
helm install couchbase/couchbase-cluster
```
{{% /codetab %}}

{{< /tabs >}}

## Related links
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
