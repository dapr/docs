---
type: docs
title: "AWS SES binding spec"
linkTitle: "AWS SES"
description: "Detailed documentation on the AWS SES binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/ses/"
---

## Component format

To setup AWS binding create a component of type `bindings.aws.ses`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

See [Authenticating to AWS]({{< ref authenticating-aws.md >}}) for information about authentication-related attributes

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: ses
  namespace: default
spec:
  type: bindings.aws.ses
  version: v1
  metadata:
  - name: accessKey
    value: *****************
  - name: secretKey
    value: *****************
  - name: region
    value: "eu-west-1"
  - name: sessionToken
    value: mysession
  - name: emailFrom
    value: "sender@example.com"
  - name: emailTo
    value: "receiver@example.com"
  - name: emailCc
    value: "cc@example.com"
  - name: emailBcc
    value: "bcc@example.com"
  - name: subject
    value: "subject"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support |  Details | Example |
|--------------------|:--------:|------------|-----|---------|
| region             | Y        | Output |  The specific AWS region | `"eu-west-1"`       |
| accessKey          | Y        | Output | The AWS Access Key to access this resource                              | `"key"`             |
| secretKey          | Y        | Output | The AWS Secret Access Key to access this resource                       | `"secretAccessKey"` |
| sessionToken       | N        | Output | The AWS session token to use                                            | `"sessionToken"`    |
| emailFrom | N | Output | If set, this specifies the email address of the sender. See [also](#example-request) | `"me@example.com"` |
| emailTo | N | Output | If set, this specifies the email address of the receiver. See [also](#example-request) | `"me@example.com"` |
| emailCc | N | Output | If set, this specifies the email address to CC in. See [also](#example-request) | `"me@example.com"` |
| emailBcc | N | Output | If set, this specifies email address to BCC in. See [also](#example-request) | `"me@example.com"` |
| subject | N | Output | If set, this specifies the subject of the email message. See [also](#example-request) | `"subject of mail"` |



## Binding support

This component supports **output binding** with the following operations:

- `create`

## Example request

You can specify any of the following optional metadata properties with each request:

- `emailFrom`
- `emailTo`
- `emailCc`
- `emailBcc`
- `subject`

When sending an email, the metadata in the configuration and in the request is combined. The combined set of metadata must contain at least the `emailFrom`, `emailTo`, `emailCc`, `emailBcc` and `subject` fields.

The `emailTo`, `emailCc` and `emailBcc` fields can contain multiple email addresses separated by a semicolon.

Example:
```json
{
  "operation": "create",
  "metadata": {
    "emailTo": "dapr-smtp-binding@example.net",
    "emailCc": "cc1@example.net",
    "subject": "Email subject"
  },
  "data": "Testing Dapr SMTP Binding"
}
```
The `emailTo`, `emailCc` and `emailBcc` fields can contain multiple email addresses separated by a semicolon.
## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
