---
type: docs
title: "Twilio SMS binding spec"
linkTitle: "Twilio SMS"
description: "Detailed documentation on the Twilio SMS binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/twilio/"
---

## Component format

To setup Twilio SMS binding create a component of type `bindings.twilio.sms`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.



```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.twilio.sms
  version: v1
  metadata:
  - name: toNumber # required.
    value: 111-111-1111
  - name: fromNumber # required.
    value: 222-222-2222
  - name: accountSid # required.
    value: *****************
  - name: authToken # required.
    value: *****************
```
{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support |  Details | Example |
|--------------------|:--------:|------------|-----|---------|
| toNumber | Y | Output | The target number to send the sms to | `"111-111-1111"` |
| fromNumber | Y | Output | The sender phone number | `"122-222-2222"` |
| accountSid | Y | Output | The Twilio account SID | `"account sid"` |
| authToken | Y | Output | The Twilio auth token | `"auth token"` |

## Binding support

This component supports **output binding** with the following operations:

- `create`


## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
