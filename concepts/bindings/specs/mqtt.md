# MQTT Binding Spec

```
apiVersion: actions.io/v1alpha1
kind: Component
metadata:
  name: <name>
spec:
  type: bindings.mqtt
  metadata:
  - name: url
    value: mqtt[s]://[username][:password]@host.domain[:port]
  - name: topic
    value: topic1
```

`url` is the MQTT broker url.
`topic` is the topic to listen on or send events to.
