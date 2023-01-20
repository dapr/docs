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

When a pub/sub component supports the bulk publish/subscribe API natively, Dapr also publishes/subscribes messages to/from the underlying pub/sub component in bulk.

Otherwise, Dapr falls back to sending/receiving messages one by one to/from the underlying pub/sub component. This is still more efficient than using the regular publish/subscribe API, because applications can still send/receive multiple messages in a single request to/from Dapr.

## Supported components

Refer to the [component reference]({{< ref supported-pubsub >}}) to see which components support the bulk publish API natively.

## Publishing messages in bulk

The bulk publish API allows you to publish multiple messages to a topic in a single request. If any of the messages fail to publish, the bulk publish operation returns a list of failed messages. Note, the bulk publish operation does not guarantee the order of messages.

### Example

{{< tabs Java Javascript "HTTP API (Bash)" "HTTP API (PowerShell)" >}}

{{% codetab %}}

```java
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.DaprPreviewClient;
import io.dapr.client.domain.BulkPublishResponse;
import io.dapr.client.domain.BulkPublishResponseFailedEntry;
import java.util.ArrayList;
import java.util.List;

class BulkPublisher {
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

## Subscribing messages in bulk

The bulk subscribe API allows you to subscribe multiple messages from a topic in a single request. 
As we know from [How to: Publish & Subscribe to topics]({{< ref howto-publish-subscribe.md >}}), there are two ways to subscribe to topic(s):

- **Declaratively**, where subscriptions are defined in an external file.
- **Programmatically**, where subscriptions are defined in user code.

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

In the example above, `bulkSubscribe` altogether is Optional. But, if you decide to use `bulkSubscribe`, then:
- `enabled` is mandatory to be given.
- You can optionally configure max number of messages (`maxMessagesCount`) that should be delivered to it via Dapr in a bulk message
- You can also optionally provide max duration to await (`maxAwaitDurationMs`) before a bulk message is sent via Dapr to App

In case, Application decides not to configure maxMessagesCount and/or maxAwaitDurationMs, defaults as per respective component in Dapr will be used.

Application receives an EntryId associated with each entry (individual message) in this bulk message and this EntryId has to be used by App to communicate back the status of that particular entry. In case, App misses to notify status of an EntryId, it will be considered as RETRY.

Status | Description
--------- | -----------
`SUCCESS` | Message is processed successfully
`RETRY` | Message to be retried by Dapr
`DROP` | Warning is logged and message is dropped

### Example

{{< tabs Java Javascript "HTTP API (Bash)" "HTTP API (PowerShell)" >}}

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

const DAPR_HOST = process.env.DAPR_HOST || "127.0.0.1";
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || "3502";
const SERVER_HOST = process.env.SERVER_HOST || "127.0.0.1";
const SERVER_PORT = process.env.APP_PORT || 5001;

async function start() {
    const server = new DaprServer(SERVER_HOST, SERVER_PORT, DAPR_HOST, DAPR_HTTP_PORT);

    // Publish multiple messages to a topic with default config.
    await client.pubsub.bulkSubscribeWithDefaultConfig(pubSubName, topic, (data) => console.log("Subscriber received: " + JSON.stringify(data)));

    // Publish multiple messages to a topic with specific maxMessagesCount and maxAwaitDurationMs.
    await client.pubsub.bulkSubscribeWithConfig(pubSubName, topic, (data) => console.log("Subscriber received: " + JSON.stringify(data)), 100, 40);
}

```

{{% /codetab %}}

{{% codetab %}}

{{< /tabs >}}

## Related links

- List of [supported pub/sub components]({{< ref supported-pubsub >}})
- Read the [API reference]({{< ref pubsub_api.md >}})
