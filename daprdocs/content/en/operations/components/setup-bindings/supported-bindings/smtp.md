---
type: docs
title: "SMTP binding spec"
linkTitle: "SMTP"
description: "Detailed documentation on the SMTP binding component"
---

## Setup Dapr component

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
```

{{% alert title="Warning" color="warning" %}}
The example configuration shown above, contain a username and password as plain-text strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

- `host` The host where your SMTP server runs. Required.
- `port` The port your SMTP server listens on. Required.
- `user` The user to authenticate against the SMTP server. Required.
- `password` The password of the user. Required.
- `skipTLSVerify` If set to true, the SMPT server's TLS certificate will not be verified. Optional field.
- `emailFrom` If set, this specifies the email address of the sender. Optional field, see below.
- `emailTo` If set, this specifies the email address of the receiver. Optional field, see below.
- `emailCc` If set, this specifies the email address to CC in. Optional field, see below.
- `emailBcc` If set, this specifies email address to BCC in. Optional field, see below.
- `subject` If set, this specifies the subject of the email message. Optional field, see below.

{{% alert title="Warning" color="warning" %}}
Skipping TLS certificate verification by setting `skipTLSVerify` to `true`, is only allowed for development- or test-activities and not suitable in production scenarios.
{{% /alert %}}

You can specify any of the following optional metadata properties with each request:

- `emailFrom`
- `emailTo`
- `emailCC`
- `emailBCC`
- `subject`

When sending an email, the metadata in the configuration and in the request is combined. The combined set of metadata must contain at least the `emailFrom`, `emailTo` and `subject` fields.

The `emailTo`, `emailCC` and `emailBCC` fields can contain multiple email addresses separated by a semicolon.

Example request payload:

```json
{
  "operation": "create",
  "metadata": {
    "emailTo": "dapr-smtp-binding@example.net",
    "emailCC": "cc1@example.net; cc2@example.net",
    "subject": "Email subject"
  },
  "data": "Testing Dapr SMTP Binding"
}
```

The `emailTo`, `emailCC` and `emailBCC` fields can contain multiple email addresses separated by a semicolon.

## Output Binding Supported Operations

- `create`

## Related links

- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
