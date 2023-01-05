---
type: docs
title: "Send and receive messages in bulk"
linkTitle: "Send and receive messages in bulk"
weight: 7100
description: "Learn how to use the bulk publish and subscribe APIs in Dapr."
---

{{% alert title="alpha" color="warning" %}}
The bulk publish and subscribe APIs are in **alpha** stage.
{{% /alert %}}

With the bulk publish and subscribe APIs, you can send and receive multiple messages in a single request.

## Native bulk publish and subscribe support

When a pub/sub component supports the bulk publish API natively, Dapr also publishes messages to the underlying pub/sub component in bulk.

Otherwise, Dapr falls back to sending messages one by one to the underlying pub/sub component. This is still more efficient than using the regular publish API, because applications can still send multiple messages in a single request to Dapr.

## Supported components

Refer [component reference]({{< ref supported-pubsub >}}) to see which components support the bulk publish API natively.

## Publishing messages in bulk

### Example

{{< tabs Javascript "HTTP API (Bash)" "HTTP API (PowerShell)" >}}

{{% codetab %}}

```typescript

import { DaprClient } from "@dapr/dapr";

const pubSubName = "my-pubsub-name";
const topic = "topic-a";

async function start() {
    const client = new DaprClient();

    // Publish multiple messages to a topic.
    await client.pubsub.publishBulk(pubSubName, topic, ["message 1", "message 2", "message 3"]);

    // Publish multiple messages to a topic with explicit bulk publish messages.
    const bulkPublishMessages = [
    {
      entryID: "entry-1",
      contentType: "application/json",
      event: { hello: "foo message 1" },
    },
    {
      entryID: "entry-2",
      contentType: "application/cloudevents+json",
      event: { 
        specversion: "1.0",
        source: "/some/source",
        type: "example",
        id: "1234", 
        data: "foo message 2", 
        datacontenttype: "text/plain" 
      },
    },
    {
      entryID: "entry-3",
      contentType: "text/plain",
      event: "foo message 3",
    },
  ];
  await client.pubsub.publishBulk(pubSubName, topic, bulkPublishMessages);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

{{% /codetab %}}

{{% codetab %}}

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/publish/bulk/my-pubsub-name/topic-a \
  -H 'Content-Type: application/json' \
  -d '[
        {
            "entryId": "ae6bf7c6-4af2-11ed-b878-0242ac120002",
            "event":  "first",
            "contentType": "text/plain"
        },
        {
            "entryId": "b1f40bd6-4af2-11ed-b878-0242ac120002",
            "event":  {
                "message": "second"   
            },
            "contentType": "application/json"
        },
      ]'
```

{{% /codetab %}}

{{% codetab %}}

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Uri 'http://localhost:3500/v1.0-alpha1/publish/bulk/my-pubsub-name/topic-a' `
-Body '[
        {
            "entryId": "ae6bf7c6-4af2-11ed-b878-0242ac120002",
            "event":  "first",
            "contentType": "text/plain"
        },
        {
            "entryId": "b1f40bd6-4af2-11ed-b878-0242ac120002",
            "event":  {
                "message": "second"   
            },
            "contentType": "application/json"
        },
      ]'
```

{{% /codetab %}}

{{< /tabs >}}

## Related links

- List of [supported pub/sub components]({{< ref supported-pubsub >}})
- Read the [API reference]({{< ref pubsub_api.md >}})
