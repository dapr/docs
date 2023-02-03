---
type: docs
title: "Publish and subscribe to bulk messages"
linkTitle: "Publish and subscribe to bulk messages"
weight: 7100
description: "Learn how to use the bulk publish and subscribe APIs in Dapr."
---

{{% alert title="alpha" color="warning" %}}
The bulk publish and subscribe APIs are in **alpha** stage.
{{% /alert %}}

With the bulk publish and subscribe APIs, you can publish and subscribe to multiple messages in a single request. When writing applications that need to send or receive a large number of messages, using bulk operations allows achieving high throughput by reducing the overall number of requests between the Dapr sidecar, the application, and the underlying pub/sub broker.

## Publishing messages in bulk

### Restrictions when publishing messages in bulk

The bulk publish API allows you to publish multiple messages to a topic in a single request. It is *non-transactional*, i.e., from a single bulk request, some messages can succeed and some can fail. If any of the messages fail to publish, the bulk publish operation returns a list of failed messages.

The bulk publish operation also does not guarantee any ordering of messages.

### Example

{{< tabs Java Javascript Dotnet Python Go "HTTP API (Bash)" "HTTP API (PowerShell)" >}}

{{% codetab %}}

```java
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.DaprPreviewClient;
import io.dapr.client.domain.BulkPublishResponse;
import io.dapr.client.domain.BulkPublishResponseFailedEntry;
import java.util.ArrayList;
import java.util.List;

class BulkPublisher {
  private static final String PUBSUB_NAME = "my-pubsub-name";
  private static final String TOPIC_NAME = "topic-a";

  public void publishMessages() {
    try (DaprPreviewClient client = (new DaprClientBuilder()).buildPreviewClient()) {
      // Create a list of messages to publish
      List<String> messages = new ArrayList<>();
      for (int i = 0; i < 10; i++) {
        String message = String.format("This is message #%d", i);
        messages.add(message);
      }

      // Publish list of messages using the bulk publish API
      BulkPublishResponse<String> res = client.publishEvents(PUBSUB_NAME, TOPIC_NAME, "text/plain", messages).block();
    }
  }
}
```

{{% /codetab %}}

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

```csharp
using System;
using System.Collections.Generic;
using Dapr.Client;

const string PubsubName = "my-pubsub-name";
const string TopicName = "topic-a";        
IReadOnlyList<object> BulkPublishData = new List<object>() {
    new { Id = "17", Amount = 10m },
    new { Id = "18", Amount = 20m },
    new { Id = "19", Amount = 30m }
};

using var client = new DaprClientBuilder().Build();

var res = await client.BulkPublishEventAsync(PubsubName, TopicName, BulkPublishData);
if (res == null) {
    throw new Exception("null response from dapr");
}
if (res.FailedEntries.Count > 0)
{
    Console.WriteLine("Some events failed to be published!");   
    foreach (var failedEntry in res.FailedEntries)
    {
        Console.WriteLine("EntryId: " + failedEntry.Entry.EntryId + " Error message: " + 
                          failedEntry.ErrorMessage);
    }
}
else
{
    Console.WriteLine("Published all events!");
}
```

{{% /codetab %}}

{{% codetab %}}

```python
import requests
import json

base_url = "http://localhost:3500/v1.0-alpha1/publish/bulk/{}/{}"
pubsub_name = "my-pubsub-name"
topic_name = "topic-a"
payload = [
  {
    "entryId": "ae6bf7c6-4af2-11ed-b878-0242ac120002",
    "event": "first text message",
    "contentType": "text/plain"
  },
  {
    "entryId": "b1f40bd6-4af2-11ed-b878-0242ac120002",
    "event": {
      "message": "second JSON message"
    },
    "contentType": "application/json"
  }
]

response = requests.post(base_url.format(pubsub_name, topic_name), json=payload)
print(response.status_code)
```

{{% /codetab %}}

{{% codetab %}}

```go
package main

import (
  "fmt"
  "strings"
  "net/http"
  "io/ioutil"
)

const (
  pubsubName = "my-pubsub-name"
  topicName = "topic-a"
  baseUrl = "http://localhost:3500/v1.0-alpha1/publish/bulk/%s/%s"
)

func main() {
  url := fmt.Sprintf(baseUrl, pubsubName, topicName)
  method := "POST"
  payload := strings.NewReader(`[
        {
            "entryId": "ae6bf7c6-4af2-11ed-b878-0242ac120002",
            "event":  "first text message",
            "contentType": "text/plain"
        },
        {
            "entryId": "b1f40bd6-4af2-11ed-b878-0242ac120002",
            "event":  {
                "message": "second JSON message"   
            },
            "contentType": "application/json"
        }
]`)

  client := &http.Client {}
  req, _ := http.NewRequest(method, url, payload)

  req.Header.Add("Content-Type", "application/json")
  res, err := client.Do(req)
  // ...
}
```

{{% /codetab %}}

{{% codetab %}}

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/publish/bulk/my-pubsub-name/topic-a \
  -H 'Content-Type: application/json' \
  -d '[
        {
            "entryId": "ae6bf7c6-4af2-11ed-b878-0242ac120002",
            "event":  "first text message",
            "contentType": "text/plain"
        },
        {
            "entryId": "b1f40bd6-4af2-11ed-b878-0242ac120002",
            "event":  {
                "message": "second JSON message"   
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
            "event":  "first text message",
            "contentType": "text/plain"
        },
        {
            "entryId": "b1f40bd6-4af2-11ed-b878-0242ac120002",
            "event":  {
                "message": "second JSON message"   
            },
            "contentType": "application/json"
        },
      ]'
```

{{% /codetab %}}

{{< /tabs >}}

## How components handle publishing and subscribing to bulk messages

Some pub/sub brokers support sending and receiving multiple messages in a single request. When a component supports bulk publish or subscribe operations, Dapr runtime uses them to further optimize the communication between the Dapr sidecar and the underlying pub/sub broker. 

For components that do not have bulk publish or subscribe support, Dapr runtime uses the regular publish and subscribe APIs to send and receive messages one by one. This is still more efficient than directly using the regular publish or subscribe APIs, because applications can still send/receive multiple messages in a single request to/from Dapr.

## Supported components

Refer to the [component reference]({{< ref supported-pubsub >}}) to see which components support bulk publish and subscribe operations.

## Related links

- List of [supported pub/sub components]({{< ref supported-pubsub >}})
- Read the [API reference]({{< ref pubsub_api.md >}})
