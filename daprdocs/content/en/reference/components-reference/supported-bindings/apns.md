---
type: docs
title: "Apple Push Notification Service binding spec"
linkTitle: "Apple Push Notification Service"
description: "Detailed documentation on the Apple Push Notification Service binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/apns/"
---

## Component format

To setup Apple Push Notifications binding create a component of type `bindings.apns`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.apns
  version: v1
  metadata:
    - name: development
      value: <bool>
    - name: key-id
      value: <APPLE_KEY_ID>
    - name: team-id
      value: <APPLE_TEAM_ID>
    - name: private-key
      secretKeyRef:
        name: <SECRET>
        key: <SECRET-KEY-NAME>
```
## Spec metadata fields

| Field              | Required | Binding support | Details | Example |
|--------------------|:--------:| ----------------|---------|---------|
| development | Y | Output | Tells the binding which APNs service to use. Set to `"true"` to use the development service or `"false"` to use the production service. Default: `"true"` | `"true"` |
| key-id | Y | Output | The identifier for the private key from the Apple Developer Portal | `"private-key-id`" |
| team-id | Y | Output | The identifier for the organization or author from the Apple Developer Portal | `"team-id"` |
| private-key | Y | Output| Is a PKCS #8-formatted private key. It is intended that the private key is stored in the secret store and not exposed directly in the configuration. See [here](#private-key) for more details | `"pem file"` |

### Private key
The APNS binding needs a cryptographic private key in order to generate authentication tokens for the APNS service.
The private key can be generated from the Apple Developer Portal and is provided as a PKCS #8 file with the private key stored in PEM format.
The private key should be stored in the Dapr secret store and not stored directly in the binding's configuration file.

A sample configuration file for the APNS binding is shown below:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: apns
  namespace: default
spec:
  type: bindings.apns
  metadata:
  - name: development
    value: false
  - name: key-id
    value: PUT-KEY-ID-HERE
  - name: team-id
    value: PUT-APPLE-TEAM-ID-HERE
  - name: private-key
    secretKeyRef:
      name: apns-secrets
      key: private-key
```
If using Kubernetes, a sample secret configuration may look like this:
```yaml
apiVersion: v1
kind: Secret
metadata:
    name: apns-secrets
    namespace: default
stringData:
    private-key: |
        -----BEGIN PRIVATE KEY-----
        KEY-DATA-GOES-HERE
        -----END PRIVATE KEY-----
```

## Binding support

This component supports **output binding** with the following operations:

- `create`

## Push notification format

The APNS binding is a pass-through wrapper over the Apple Push Notification Service. The APNS binding will send the request directly to the APNS service without any translation.
It is therefore important to understand the payload for push notifications expected by the APNS service.
The payload format is documented [here](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/generating_a_remote_notification).

### Request format

```json
{
    "data": {
        "aps": {
            "alert": {
                "title": "New Updates!",
                "body": "There are new updates for your review"
            }
        }
    },
    "metadata": {
        "device-token": "PUT-DEVICE-TOKEN-HERE",
        "apns-push-type": "alert",
        "apns-priority": "10",
        "apns-topic": "com.example.helloworld"
    },
    "operation": "create"
}
```

The `data` object contains a complete push notification specification as described in the [Apple documentation](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/generating_a_remote_notification). The `data` object will be sent directly to the APNs service.

Besides the `device-token` value, the HTTP headers specified in the [Apple documentation](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/sending_notification_requests_to_apns) can be sent as metadata fields and will be included in the HTTP request to the APNs service.

### Response format

```json
{
    "messageID": "UNIQUE-ID-FOR-NOTIFICATION"
}
```

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
