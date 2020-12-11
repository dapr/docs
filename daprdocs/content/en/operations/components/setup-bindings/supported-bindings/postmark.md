---
type: docs
title: "Postmark binding spec"
linkTitle: "Postmark"
description: "Detailed documentation on the Postmark binding component"
---

## Setup Dapr component

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

- `accountToken` is your Postmark account token, this should be considered a secret value. Required.
- `serverToken` is your Postmark server token, this should be considered a secret value. Required.
- `emailFrom` If set this specifies the 'from' email address of the email message. Optional field, see below.
- `emailTo` If set this specifies the 'to' email address of the email message. Optional field, see below.
- `emailCc` If set this specifies the 'cc' email address of the email message. Optional field, see below.
- `emailBcc` If set this specifies the 'bcc' email address of the email message. Optional field, see below.
- `subject` If set this specifies the subject of the email message. Optional field, see below.

You can specify any of the optional metadata properties on the output binding request too (e.g. `emailFrom`, `emailTo`, `subject`, etc.)

Combined, the optional metadata properties in the component configuration and the request payload should at least contain the `emailFrom`, `emailTo` and `subject` fields, as these are required to send an email with success.

Example request payload

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

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Output Binding Supported Operations

- `create`

## Related links

- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
