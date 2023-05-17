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
spec:
  type: bindings.twilio.sendgrid
  version: v1
  metadata:
  - name: emailFrom
    value: "testapp@dapr.io" # optional
  - name: emailFromName
    value: "test app" # optional
  - name: emailTo
    value: "dave@dapr.io" # optional
  - name: emailToName
    value: "dave" # optional
  - name: subject
    value: "Hello!" # optional
  - name: emailCc
    value: "jill@dapr.io" # optional
  - name: emailBcc
    value: "bob@dapr.io" # optional
  - name: dynamicTemplateId
    value: "d-123456789" # optional
  - name: dynamicTemplateData
    value: '{"customer":{"name":"John Smith"}}' # optional
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
| emailFrom | N | Output | If set this specifies the 'from' email address of the email message. Only a single email address is allowed. Optional field, see [below](#example-request-payload) | `"me@example.com"` |
| emailFromName | N | Output | If set this specifies the 'from' name of the email message. Optional field, see [below](#example-request-payload) | `"me"` |
| emailTo | N | Output | If set this specifies the 'to' email address of the email message. Only a single email address is allowed. Optional field, see [below](#example-request-payload) | `"me@example.com"` |
| emailToName | N | Output | If set this specifies the 'to' name of the email message. Optional field, see [below](#example-request-payload) | `"me"` |
| emailCc | N | Output | If set this specifies the 'cc' email address of the email message. Only a single email address is allowed. Optional field, see [below](#example-request-payload) | `"me@example.com"` |
| emailBcc | N | Output | If set this specifies the 'bcc' email address of the email message. Only a single email address is allowed. Optional field, see [below](#example-request-payload) | `"me@example.com"` |
| subject | N | Output | If set this specifies the subject of the email message. Optional field, see [below](#example-request-payload) | `"subject of the email"` |
| dynamicTemplateId | N | Output | If set this specifies the dynamic template id. Optional field, see [below](#example-request-payload) | `"d-123456789"` |
| dynamicTemplateData | N | Output | If set this specifies the dynamic template data. Optional field, see [below](#example-request-payload) | `'{"customer":{"name":"John Smith"}}'` |

## Binding support

This component supports **output binding** with the following operations:

- `create`

## Example request payload

You can specify any of the optional metadata properties on the output binding request too (e.g. `emailFrom`, `emailTo`, `subject`, etc.)

```json
{
  "operation": "create",
  "metadata": {
    "emailTo": "changeme@example.net",
    "subject": "An email from Dapr SendGrid binding"
  },
  "data": "<h1>Testing Dapr Bindings</h1>This is a test.<br>Bye!"
}
```

## Dynamic templates
If a dynamic template is used, a `dynamicTemplateId` needs to be provided and then the `dynamicTemplateData` is used:

```json
{
  "operation": "create",
  "metadata": {
    "emailTo": "changeme@example.net",
    "subject": "An template email from Dapr SendGrid binding",
    "dynamicTemplateId": "d-123456789",
    "dynamicTemplateData": "{\"customer\":{\"name\":\"John Smith\"}}"
  }
}
```

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
