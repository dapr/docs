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

{{< tabs Java JavaScript ".NET" Python Go "HTTP API (Bash)" "HTTP API (PowerShell)" >}}

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

## Subscribing messages in bulk

The bulk subscribe API allows you to subscribe multiple messages from a topic in a single request.
As we know from [How to: Publish & Subscribe to topics]({{< ref howto-publish-subscribe.md >}}), there are three ways to subscribe to topic(s):

- **Declaratively** - subscriptions are defined in an external file.
- **Programmatically** - subscriptions are defined in code.
- **Streaming** - *Not supported* for bulk subscribe as messages are sent to handler code.

To Bulk Subscribe to topic(s), we just need to use `bulkSubscribe` spec attribute, something like following:

```yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: order-pub-sub
spec:
  topic: orders
  routes:
    default: /checkout
  pubsubname: order-pub-sub
  bulkSubscribe:
    enabled: true
    maxMessagesCount: 100
    maxAwaitDurationMs: 40
scopes:
- orderprocessing
- checkout
```

In the example above, `bulkSubscribe` is _optional_. If you use `bulkSubscribe`, then:
- `enabled` is mandatory and enables or disables bulk subscriptions on this topic
- You can optionally configure the max number of messages (`maxMessagesCount`) delivered in a bulk message.
Default value of `maxMessagesCount` for components not supporting bulk subscribe is 100 i.e. for default bulk events between App and Dapr. Please refer [How components handle publishing and subscribing to bulk messages]({{< ref pubsub-bulk >}}).
If a component supports bulk subscribe, then default value for this parameter can be found in that component doc.
- You can optionally provide the max duration to wait (`maxAwaitDurationMs`) before a bulk message is sent to the app.
Default value of `maxAwaitDurationMs` for components not supporting bulk subscribe is 1000 i.e. for default bulk events between App and Dapr. Please refer [How components handle publishing and subscribing to bulk messages]({{< ref pubsub-bulk >}}).
If a component supports bulk subscribe, then default value for this parameter can be found in that component doc.

The application receives an `EntryId` associated with each entry (individual message) in the bulk message. This `EntryId` must be used by the app to communicate the status of that particular entry. If the app fails to notify on an `EntryId` status, it's considered a `RETRY`.

A JSON-encoded payload body with the processing status against each entry needs to be sent:

```json
{
  "statuses":
  [
    {
    "entryId": "<entryId1>",
    "status": "<status>"
    },
    {
    "entryId": "<entryId2>",
    "status": "<status>"
    }
  ]
}
```

Possible status values:

Status | Description
--------- | -----------
`SUCCESS` | Message is processed successfully
`RETRY` | Message to be retried by Dapr
`DROP` | Warning is logged and message is dropped

Refer to [Expected HTTP Response for Bulk Subscribe]({{< ref pubsub_api.md >}}) for further insights on response.

### Example

The following code examples demonstrate how to use Bulk Subscribe.

{{< tabs "Java" "JavaScript" ".NET" "Python" >}}
{{% codetab %}}

```java
import io.dapr.Topic;
import io.dapr.client.domain.BulkSubscribeAppResponse;
import io.dapr.client.domain.BulkSubscribeAppResponseEntry;
import io.dapr.client.domain.BulkSubscribeAppResponseStatus;
import io.dapr.client.domain.BulkSubscribeMessage;
import io.dapr.client.domain.BulkSubscribeMessageEntry;
import io.dapr.client.domain.CloudEvent;
import io.dapr.springboot.annotations.BulkSubscribe;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import reactor.core.publisher.Mono;

class BulkSubscriber {
  @BulkSubscribe()
  // @BulkSubscribe(maxMessagesCount = 100, maxAwaitDurationMs = 40)
  @Topic(name = "topicbulk", pubsubName = "orderPubSub")
  @PostMapping(path = "/topicbulk")
  public Mono<BulkSubscribeAppResponse> handleBulkMessage(
          @RequestBody(required = false) BulkSubscribeMessage<CloudEvent<String>> bulkMessage) {
    return Mono.fromCallable(() -> {
      List<BulkSubscribeAppResponseEntry> entries = new ArrayList<BulkSubscribeAppResponseEntry>();
      for (BulkSubscribeMessageEntry<?> entry : bulkMessage.getEntries()) {
        try {
          CloudEvent<?> cloudEvent = (CloudEvent<?>) entry.getEvent();
          System.out.printf("Bulk Subscriber got: %s\n", cloudEvent.getData());
          entries.add(new BulkSubscribeAppResponseEntry(entry.getEntryId(), BulkSubscribeAppResponseStatus.SUCCESS));
        } catch (Exception e) {
          e.printStackTrace();
          entries.add(new BulkSubscribeAppResponseEntry(entry.getEntryId(), BulkSubscribeAppResponseStatus.RETRY));
        }
      }
      return new BulkSubscribeAppResponse(entries);
    });
  }
}
```

{{% /codetab %}}

{{% codetab %}}

```typescript

import { DaprServer } from "@dapr/dapr";

const pubSubName = "orderPubSub";
const topic = "topicbulk";

const daprHost = process.env.DAPR_HOST || "127.0.0.1";
const daprPort = process.env.DAPR_HTTP_PORT || "3502";
const serverHost = process.env.SERVER_HOST || "127.0.0.1";
const serverPort = process.env.APP_PORT || 5001;

async function start() {
    const server = new DaprServer({
        serverHost,
        serverPort,
        clientOptions: {
            daprHost,
            daprPort,
        },
    });

    // Publish multiple messages to a topic with default config.
    await client.pubsub.bulkSubscribeWithDefaultConfig(pubSubName, topic, (data) => console.log("Subscriber received: " + JSON.stringify(data)));

    // Publish multiple messages to a topic with specific maxMessagesCount and maxAwaitDurationMs.
    await client.pubsub.bulkSubscribeWithConfig(pubSubName, topic, (data) => console.log("Subscriber received: " + JSON.stringify(data)), 100, 40);
}

```

{{% /codetab %}}

{{% codetab %}}

```csharp
using Microsoft.AspNetCore.Mvc;
using Dapr.AspNetCore;
using Dapr;

namespace DemoApp.Controllers;

[ApiController]
[Route("[controller]")]
public class BulkMessageController : ControllerBase
{
    private readonly ILogger<BulkMessageController> logger;

    public BulkMessageController(ILogger<BulkMessageController> logger)
    {
        this.logger = logger;
    }

    [BulkSubscribe("messages", 10, 10)]
    [Topic("pubsub", "messages")]
    public ActionResult<BulkSubscribeAppResponse> HandleBulkMessages([FromBody] BulkSubscribeMessage<BulkMessageModel<BulkMessageModel>> bulkMessages)
    {
        List<BulkSubscribeAppResponseEntry> responseEntries = new List<BulkSubscribeAppResponseEntry>();
        logger.LogInformation($"Received {bulkMessages.Entries.Count()} messages");
        foreach (var message in bulkMessages.Entries)
        {
            try
            {
                logger.LogInformation($"Received a message with data '{message.Event.Data.MessageData}'");
                responseEntries.Add(new BulkSubscribeAppResponseEntry(message.EntryId, BulkSubscribeAppResponseStatus.SUCCESS));
            }
            catch (Exception e)
            {
                logger.LogError(e.Message);
                responseEntries.Add(new BulkSubscribeAppResponseEntry(message.EntryId, BulkSubscribeAppResponseStatus.RETRY));
            }
        }
        return new BulkSubscribeAppResponse(responseEntries);
    }
    public class BulkMessageModel
    {
        public string MessageData { get; set; }
    }
}
```

{{% /codetab %}}

{{% codetab %}}
Currently, you can only bulk subscribe in Python using an HTTP client. 

```python
import json
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/dapr/subscribe', methods=['GET'])
def subscribe():
    # Define the bulk subscribe configuration
    subscriptions = [{
        "pubsubname": "pubsub",
        "topic": "TOPIC_A",
        "route": "/checkout",
        "bulkSubscribe": {
            "enabled": True,
            "maxMessagesCount": 3,
            "maxAwaitDurationMs": 40
        }
    }]
    print('Dapr pub/sub is subscribed to: ' + json.dumps(subscriptions))
    return jsonify(subscriptions)


# Define the endpoint to handle incoming messages
@app.route('/checkout', methods=['POST'])
def checkout():
    messages = request.json
    print(messages)
    for message in messages:
        print(f"Received message: {message}")
    return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}

if __name__ == '__main__':
    app.run(port=5000)

```

{{% /codetab %}}

{{< /tabs >}}

## How components handle publishing and subscribing to bulk messages

For event publish/subscribe, two kinds of network transfers are involved.
1. From/To *App* To/From *Dapr*.
1. From/To *Dapr* To/From *Pubsub Broker*.

These are the opportunities where optimization is possible. When optimized, Bulk requests are made, which reduce the overall number of calls and thus increases throughput and provides better latency.

On enabling Bulk Publish and/or Bulk Subscribe, the communication between the App and Dapr sidecar (Point 1 above) is optimized for **all components**.

Optimization from Dapr sidecar to the pub/sub broker depends on a number of factors, for example:
- Broker must inherently support Bulk pub/sub
- The Dapr component must be updated to support the use of bulk APIs provided by the broker

Currently, the following components are updated to support this level of optimization:

| Component              | Bulk Publish | Bulk Subscribe |
|:--------------------:|:--------:|--------|
| Kafka                 | Yes       | Yes |
| Azure Servicebus      | Yes       | Yes |
| Azure Eventhubs       | Yes       | Yes |

## Demos

Watch the following demos and presentations about bulk pub/sub.

### [KubeCon Europe 2023 presentation](https://youtu.be/WMBAo-UNg6o)

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/WMBAo-UNg6o" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

### [Dapr Community Call #77 presentation](https://youtu.be/BxiKpEmchgQ?t=1170)

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/BxiKpEmchgQ?start=1170" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Related links

- List of [supported pub/sub components]({{< ref supported-pubsub >}})
- Read the [API reference]({{< ref pubsub_api.md >}})
