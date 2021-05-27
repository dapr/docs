---
type: docs
title: "Twilio SendGrid binding spec"
linkTitle: "Twilio SendGrid"
description: "Detailed documentation on the Twilio SendGrid binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/sendgrid/"
---

## Component format

To setup Twilio SendGrid binding create a component of type `bindings.twilio.sendgrid`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: sendgrid
  namespace: default
spec:
  type: bindings.twilio.sendgrid
  version: v1
  metadata:
  - name: emailFrom
    value: "testapp@dapr.io" # optional
  - name: emailTo
    value: "dave@dapr.io" # optional
  - name: subject
    value: "Hello!" # optional
  - name: apiKey
    value: "YOUR_API_KEY" # required, this is your SendGrid key
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support |  Details | Example |
|--------------------|:--------:|------------|-----|---------|
| apiKey | Y | Output | SendGrid API key, this should be considered a secret value | `"apikey"` |
| emailFrom | N | Output | If set this specifies the 'from' email address of the email message. Optional field, see [below](#example-request-payload) | `"me@example.com"` |
| emailTo | N | Output | If set this specifies the 'to' email address of the email message. Optional field, see [below](#example-request-payload) | `"me@example.com"` |
| emailCc | N | Output | If set this specifies the 'cc' email address of the email message. Optional field, see [below](#example-request-payload) | `"me@example.com"` |
| emailBcc | N | Output | If set this specifies the 'bcc' email address of the email message. Optional field, see [below](#example-request-payload) | `"me@example.com"` |
| subject | N | Output | If set this specifies the subject of the email message. Optional field, see [below](#example-request-payload) | `"subject of the email"` |


## Binding support

This component supports **output binding** with the following operations:

- `create`

## Example request payload

You can specify any of the optional metadata properties on the output binding request too (e.g. `emailFrom`, `emailTo`, `subject`, etc.)

```json
{
  "metadata": {
    "emailTo": "changeme@example.net",
    "subject": "An email from Dapr SendGrid binding"
  },
  "data": "<h1>Testing Dapr Bindings</h1>This is a test.<br>Bye!"
}
```
## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
