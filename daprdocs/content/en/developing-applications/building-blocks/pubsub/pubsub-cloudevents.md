---
type: docs
title: "Publishing & subscribing messages with Cloudevents"
linkTitle: "Messages with Cloudevents"
weight: 2100
description: "Learn why Dapr uses CloudEvents, how they work in Dapr pub/sub, and how to create CloudEvents."
---

To enable message routing and provide additional context with each message, Dapr uses the [CloudEvents 1.0 specification](https://github.com/cloudevents/spec/tree/v1.0) as its message format. Any message sent by an application to a topic using Dapr is automatically wrapped in a CloudEvents envelope, using the [`Content-Type` header value]({{< ref "pubsub-overview.md#content-types" >}}) for `datacontenttype` attribute.

Dapr uses CloudEvents to provide additional context to the event payload, enabling features like:

- Tracing
- Deduplication by message Id
- Content-type for proper deserialization of event data

## CloudEvents example

Dapr implements the following CloudEvents fields when creating a message topic.

- `id`
- `source`
- `specversion`
- `type`
- `traceparent`
- `time`
- `datacontenttype` (optional)

The following example demonstrates an `orders` topic message sent by Dapr that includes a W3C `traceid` unique to the message, the `data` and the fields for the CloudEvent where the data content is serialized as JSON.

```json
{
    "topic": "orders",
    "pubsubname": "order_pub_sub",
    "traceid": "00-113ad9c4e42b27583ae98ba698d54255-e3743e35ff56f219-01",
    "tracestate": "",
    "data": {
    "orderId": 1
    },
    "id": "5929aaac-a5e2-4ca1-859c-edfe73f11565",
    "specversion": "1.0",
    "datacontenttype": "application/json; charset=utf-8",
    "source": "checkout",
    "type": "com.dapr.event.sent",
    "time": "2020-09-23T06:23:21Z",
    "traceparent": "00-113ad9c4e42b27583ae98ba698d54255-e3743e35ff56f219-01"
}
```

As another example of a v1.0 CloudEvent, the following shows data as XML content in a CloudEvent message serialized as JSON:

```json
{
    "specversion" : "1.0",
    "type" : "xml.message",
    "source" : "https://example.com/message",
    "subject" : "Test XML Message",
    "id" : "id-1234-5678-9101",
    "time" : "2020-09-23T06:23:21Z",
    "datacontenttype" : "text/xml",
    "data" : "<note><to>User1</to><from>user2</from><message>hi</message></note>"
}
```

## Publish your own CloudEvent

If you want to use your own CloudEvent, make sure to specify the [`datacontenttype`]({{< ref "pubsub-overview.md#setting-message-content-types" >}}) as `application/cloudevents+json`.

### Example

{{< tabs "Dapr CLI" "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}

Publish a CloudEvent to the `orders` topic:

```bash
dapr publish --publish-app-id orderprocessing --pubsub order-pub-sub --topic orders --data '{"specversion" : "1.0", "type" : "com.dapr.cloudevent.sent", "source" : "testcloudeventspubsub", "subject" : "Cloud Events Test", "id" : "someCloudEventId", "time" : "2021-08-02T09:00:00Z", "datacontenttype" : "application/cloudevents+json", "data" : {"orderId": "100"}}'
```

{{% /codetab %}}

{{% codetab %}}

Publish a CloudEvent to the `orders` topic:

```bash
curl -X POST http://localhost:3601/v1.0/publish/order-pub-sub/orders -H "Content-Type: application/cloudevents+json" -d '{"specversion" : "1.0", "type" : "com.dapr.cloudevent.sent", "source" : "testcloudeventspubsub", "subject" : "Cloud Events Test", "id" : "someCloudEventId", "time" : "2021-08-02T09:00:00Z", "datacontenttype" : "application/cloudevents+json", "data" : {"orderId": "100"}}'
```

{{% /codetab %}}

{{% codetab %}}

Publish a CloudEvent to the `orders` topic:

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/cloudevents+json' -Body '{"specversion" : "1.0", "type" : "com.dapr.cloudevent.sent", "source" : "testcloudeventspubsub", "subject" : "Cloud Events Test", "id" : "someCloudEventId", "time" : "2021-08-02T09:00:00Z", "datacontenttype" : "application/cloudevents+json", "data" : {"orderId": "100"}}' -Uri 'http://localhost:3601/v1.0/publish/order-pub-sub/orders'
```

{{% /codetab %}}

{{< /tabs >}}

## Next steps

- Learn why you might [not want to use CloudEvents]({{< ref pubsub-raw.md >}})
- Try out the [pub/sub Quickstart]({{< ref pubsub-quickstart.md >}})
- List of [pub/sub components]({{< ref setup-pubsub >}})
- Read the [API reference]({{< ref pubsub_api.md >}})

