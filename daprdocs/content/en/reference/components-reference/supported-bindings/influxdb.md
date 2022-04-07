---
type: docs
title: "InfluxDB binding spec"
linkTitle: "InfluxDB"
description: "Detailed documentation on the InfluxDB binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/influxdb/"
---

## Component format

To setup InfluxDB binding create a component of type `bindings.influx`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.influx
  version: v1
  metadata:
  - name: url # Required
    value: <INFLUX-DB-URL>
  - name: token # Required
    value: <TOKEN>
  - name: org # Required
    value: <ORG>
  - name: bucket # Required
    value: <BUCKET>
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support |  Details | Example |
|--------------------|:--------:|------------|-----|---------|
| url  | Y | Output | The URL for the InfluxDB instance| `"http://localhost:8086"` |
| token | Y | Output | The authorization token for InfluxDB | `"mytoken"` |
| org | Y | Output | The InfluxDB organization | `"myorg"` |
| bucket | Y | Output | Bucket name to write to | `"mybucket"` |

## Binding support

This component supports **output binding** with the following operations:

- `create`
- `query`

### Query

In order to query InfluxDB, use a `query` operation along with a `raw` key in the call's metadata, with the query as the value:

```
curl -X POST http://localhost:3500/v1.0/bindings/myInfluxBinding \
  -H "Content-Type: application/json" \
  -d "{
        \"metadata\": {
          \"raw\": "SELECT * FROM 'sith_lords'"
        },
        \"operation\": \"query\"
      }"
```

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
