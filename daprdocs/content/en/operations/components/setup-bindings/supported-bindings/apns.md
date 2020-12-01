
---
type: docs
title: "Apple Push Notification Service binding spec"
linkTitle: "Apple Push Notification Service"
description: "Detailed documentation on the Apple Push Notification Service binding component"
---

## Configuration

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
      value: <true | false>
    - name: key-id
      value: <APPLE_KEY_ID>
    - name: team-id
      value: <APPLE_TEAM_ID>
    - name: private-key
      secretKeyRef:
        name: <SECRET>
        key: <SECRET-KEY-NAME>
```

- `database` tells the binding which APNs service to use. Set to `true` to use the development service or `false` to use the production service. If not specified, the binding will default to production.
- `key-id` is the identifier for the private key from the Apple Developer Portal.
- `team-id` is the identifier for the organization or author from the Apple Developer Portal.
- `private-key` is a PKCS #8-formatted private key. It is intended that the private key is stored in the secret store and not exposed directly in the configuration.

## Request Format

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

## Response Format

```json
{
    "messageID": "UNIQUE-ID-FOR-NOTIFICATION"
}
```

## Output Binding Supported Operations

* `create`
