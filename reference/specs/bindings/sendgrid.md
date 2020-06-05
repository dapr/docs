# SendGrid Binding Spec

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: sendgrid
  namespace: default
spec:
  type: bindings.twilio.sendgrid
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

- `emailFrom` If set this specifies the 'from' email address of the email message. Optional field, see below.
- `emailTo` If set this specifies the 'to' email address of the email message. Optional field, see below.
- `emailCc` If set this specifies the 'cc' email address of the email message. Optional field, see below.
- `emailBcc` If set this specifies the 'bcc' email address of the email message. Optional field, see below.
- `subject` If set this specifies the subject of the email message. Optional field, see below.
- `apiKey` is your SendGrid API key, this should be considered a secret value. Required.

You can specify any of the optional metadata properties on the output binding request too (e.g. `emailFrom`, `emailTo`, `subject`, etc.)

Example request payload
```
{
  "metadata": {
    "emailTo": "changeme@example.net",
    "subject": "An email from Dapr SendGrid binding"
  }, 
  "data": "<h1>Testing Dapr Bindings</h1>This is a test.<br>Bye!"
}
```

> **Note:** In production never place passwords or secrets within Dapr components. For information on securely storing and retrieving secrets refer to [Setup Secret Store](../../../howto/setup-secret-store)

## Output Binding Supported Operations

* create
