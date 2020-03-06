# Twilio SMS Binding Spec

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <name>
spec:
  type: bindings.twilio.sms
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

`toNumber` is the target number to send the sms to.
`fromNumber` is the sender phone number.
`accountSid` is the Twilio account SID.
`authToken` is the Twilio auth token.
