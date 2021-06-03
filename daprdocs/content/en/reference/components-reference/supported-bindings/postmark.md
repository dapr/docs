---
type: docs
title: "Postmark binding spec"
linkTitle: "Postmark"
description: "Detailed documentation on the Postmark binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/postmark/"
---

## Component format

To setup Postmark binding create a component of type `bindings.postmark`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: postmark
  namespace: default
spec:
  type: bindings.postmark
  metadata:
  - name: accountToken
    value: "YOUR_ACCOUNT_TOKEN" # required, this is your Postmark account token
  - name: serverToken
    value: "YOUR_SERVER_TOKEN" # required, this is your Postmark server token
  - name: emailFrom
    value: "testapp@dapr.io" # optional
  - name: emailTo
    value: "dave@dapr.io" # optional
  - name: subject
    value: "Hello!" # optional
```
{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support |  Details | Example |
|--------------------|:--------:|------------|-----|---------|
| accountToken | Y | Output |  The Postmark account token, this should be considered a secret value | `"account token"` |
| serverToken | Y | Output  | The Postmark server token, this should be considered a secret value | `"server token"` |
| emailFrom | N | Output | If set this specifies the 'from' email address of the email message | `"me@exmaple.com"` |
| emailTo | N | Output | If set this specifies the 'to' email address of the email message | `"me@example.com"` |
| emailCc | N | Output | If set this specifies the 'cc' email address of the email message | `"me@example.com"` |
| emailBcc | N | Output | If set this specifies the 'bcc' email address of the email message | `"me@example.com"` |
| subject | N | Output | If set this specifies the subject of the email message | `"me@example.com"` |

You can specify any of the optional metadata properties on the output binding request too (e.g. `emailFrom`, `emailTo`, `subject`, etc.)

Combined, the optional metadata properties in the component configuration and the request payload should at least contain the `emailFrom`, `emailTo` and `subject` fields, as these are required to send an email with success.


## Binding support

This component supports **output binding** with the following operations:

- `create`


## Example request payload

```json
{
  "operation": "create",
  "metadata": {
    "emailTo": "changeme@example.net",
    "subject": "An email from Dapr Postmark binding"
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
