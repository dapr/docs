---
type: docs
title: "SMTP binding spec"
linkTitle: "SMTP"
description: "Detailed documentation on the SMTP binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/smtp/"
---

## Component format

To setup SMTP binding create a component of type `bindings.smtp`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: smtp
  namespace: default
spec:
  type: bindings.smtp
  version: v1
  metadata:
  - name: host
    value: "smtp host"
  - name: port
    value: "smtp port"
  - name: user
    value: "username"
  - name: password
    value: "password"
  - name: skipTLSVerify
    value: true|false
  - name: emailFrom
    value: "sender@example.com"
  - name: emailTo
    value: "receiver@example.com"
  - name: emailCC
    value: "cc@example.com"
  - name: emailBCC
    value: "bcc@example.com"
  - name: subject
    value: "subject"
  - name: priority
    value: "[value 1-5]"
```

{{% alert title="Warning" color="warning" %}}
The example configuration shown above, contain a username and password as plain-text strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support |  Details | Example |
|--------------------|:--------:|------------|-----|---------|
| host | Y | Output |  The host where your SMTP server runs | `"smtphost"` |
| port | Y | Output |  The port your SMTP server listens on | `"9999"` |
| user | Y | Output |  The user to authenticate against the SMTP server | `"user"` |
| password | Y | Output | The password of the user | `"password"` |
| skipTLSVerify | N | Output | If set to true, the SMPT server's TLS certificate will not be verified. Defaults to `"false"` | `"true"`, `"false"` |
| emailFrom | N | Output | If set, this specifies the email address of the sender. See [also](#example-request) | `"me@example.com"` |
| emailTo | N | Output | If set, this specifies the email address of the receiver. See [also](#example-request) | `"me@example.com"` |
| emailCc | N | Output | If set, this specifies the email address to CC in. See [also](#example-request) | `"me@example.com"` |
| emailBcc | N | Output | If set, this specifies email address to BCC in. See [also](#example-request) | `"me@example.com"` |
| subject | N | Output | If set, this specifies the subject of the email message. See [also](#example-request) | `"subject of mail"` |
| priority | N | Output | If set, this specifies the priority (X-Priority) of the email message, from 1 (lowest) to 5 (highest) (default value: 3). See [also](#example-request) | `"1"` |

## Binding support

This component supports **output binding** with the following operations:

- `create`

## Example request

You can specify any of the following optional metadata properties with each request:

- `emailFrom`
- `emailTo`
- `emailCC`
- `emailBCC`
- `subject`
- `priority`

When sending an email, the metadata in the configuration and in the request is combined. The combined set of metadata must contain at least the `emailFrom`, `emailTo` and `subject` fields.

The `emailTo`, `emailCC` and `emailBCC` fields can contain multiple email addresses separated by a semicolon.

Example:
```json
{
  "operation": "create",
  "metadata": {
    "emailTo": "dapr-smtp-binding@example.net",
    "emailCC": "cc1@example.net; cc2@example.net",
    "subject": "Email subject",
    "priority: "1"
  },
  "data": "Testing Dapr SMTP Binding"
}
```

The `emailTo`, `emailCC` and `emailBCC` fields can contain multiple email addresses separated by a semicolon.
## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
