---
type: docs
title: "Use a custom CloudEvent"
linkTitle: "Custom CloudEvent"
weight: 8000
description: "Take the default Dapr CloudEvent wrapping a step further with your own custom CloudEvent"
---

## Sending a custom CloudEvent

Dapr automatically takes the data sent on the publish request and [wraps it in a CloudEvent 1.0 envelope]({{< ref "pubsub-overview.md#cloud-events-message-format" >}}). If you want to use your own custom CloudEvent, make sure to specify the [content type]({{< ref "pubsub-overview.md#content-types" >}}) as `application/cloudevents+json`.

### Example

{{< tabs "Dapr CLI" "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}

Publish a custom CloudEvent to the `orders` topic:

```bash
dapr publish --publish-app-id orderprocessing --pubsub order-pub-sub --topic orders --data '{"specversion" : "1.0", "type" : "com.dapr.cloudevent.sent", "source" : "testcloudeventspubsub", "subject" : "Cloud Events Test", "id" : "someCloudEventId", "time" : "2021-08-02T09:00:00Z", "datacontenttype" : "application/cloudevents+json", "data" : {"orderId": "100"}}'
```

{{% /codetab %}}

{{% codetab %}}

Publish a custom CloudEvent to the `orders` topic:

```bash
curl -X POST http://localhost:3601/v1.0/publish/order-pub-sub/orders -H "Content-Type: application/cloudevents+json" -d '{"specversion" : "1.0", "type" : "com.dapr.cloudevent.sent", "source" : "testcloudeventspubsub", "subject" : "Cloud Events Test", "id" : "someCloudEventId", "time" : "2021-08-02T09:00:00Z", "datacontenttype" : "application/cloudevents+json", "data" : {"orderId": "100"}}'
```

{{% /codetab %}}

{{% codetab %}}

Publish a custom CloudEvent to the `orders` topic:

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/cloudevents+json' -Body '{"specversion" : "1.0", "type" : "com.dapr.cloudevent.sent", "source" : "testcloudeventspubsub", "subject" : "Cloud Events Test", "id" : "someCloudEventId", "time" : "2021-08-02T09:00:00Z", "datacontenttype" : "application/cloudevents+json", "data" : {"orderId": "100"}}' -Uri 'http://localhost:3601/v1.0/publish/order-pub-sub/orders'
```

{{% /codetab %}}

{{< /tabs >}}

## Next steps

- Try out the [Pub/sub Quickstart]({{< ref pubsub-quickstart.md >}})
- List of [Pub/sub components]({{< ref setup-pubsub >}})
- Read the [API reference]({{< ref pubsub_api.md >}})
