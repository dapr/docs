---
type: docs
title: "RavenDB"
linkTitle: "RavenDB"
description: Detailed information on the RavenDB state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-ravendb/"
---

## Component format

To setup RavenDB state store create a component of type `state.ravendb`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.ravendb
  version: v1
  metadata:
  - name: databaseName
    value: <REPLACE-WITH-DATABASE-NAME> # Optional. default: "daprStore"
  - name: serverURL
    value: <REPLACE-WITH-SERVER-URL> #Required Example: "server.example.com"
  - name: certPath
    value: <REPLACE-WITH-CERT-PATH> # Required unless server is insecure.
  - name: KeyPath
    value: <REPLACE-WITH-KEY-PATH> # Required unless server is insecure.
  - name: EnableTTL
    value: <REPLACE-WITH-ENABLE-TTL> # Optional. default: "true"
  - name: TTLFrequency
    value: <REPLACE-WITH-TTL:-FREQUENCY> # Optional. Example: "15"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| databaseName       | N        | The name of the database to use. Defaults to `"daprStore"` | `"daprStore"`
| serverURL          | Y        | Url to RavenDB instance | `"http://localhost:8080"`
| certPath           | N<sup>1</sup> | Path to certificate file | `"majority"`
| keyPath            | N<sup>1</sup> | Path to key file  | `"majority"`, `"local"`,`"available"`, `"linearizable"`, `"snapshot"`
| EnableTTL          | N        | Boolean value to enable TTL capability. Defaults to `"true"` | `"5s"`
| TTLFrequency       | N | Additional parameters to use | `"?authSource=daprStore&ssl=true"`

> <sup>[1]</sup> The `certPath` and `keyPath` fields are not mandatory if server url is http, however if server url is https and no certPath and keyPath is present dapr returns an error.

### TTLs and cleanups

This state store supports [Time-To-Live (TTL)]({{< ref state-store-ttl.md >}}) for records stored with Dapr. When storing data using Dapr, you can set the `ttlInSeconds` metadata property to indicate when the data should be considered "expired".

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
