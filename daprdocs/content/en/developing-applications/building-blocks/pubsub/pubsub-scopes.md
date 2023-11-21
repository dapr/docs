---
type: docs
title: "Scope Pub/sub topic access"
linkTitle: "Scope topic access"
weight: 6000
description: "Use scopes to limit pub/sub topics to specific applications"
---

## Introduction

[Namespaces or component scopes]({{< ref component-scopes.md >}}) can be used to limit component access to particular applications. These application scopes added to a component limit only the applications with specific IDs to be able to use the component.

In addition to this general component scope, the following can be limited for pub/sub components:
- Which topics can be used (published or subscribed)
- Which applications are allowed to publish to specific topics
- Which applications are allowed to subscribe to specific topics

This is called **pub/sub topic scoping**.

Pub/sub scopes are defined for each pub/sub component.  You may have a pub/sub component named `pubsub` that has one set of scopes, and another `pubsub2` with a different set.

To use this topic scoping three metadata properties can be set for a pub/sub component:
- `spec.metadata.publishingScopes`
  - A semicolon-separated list of applications & comma-separated topic lists, allowing that app to publish to that list of topics
  - If nothing is specified in `publishingScopes` (default behavior), all apps can publish to all topics
  - To deny an app the ability to publish to any topic, leave the topics list blank (`app1=;app2=topic2`)
  - For example, `app1=topic1;app2=topic2,topic3;app3=` will allow app1 to publish to topic1 and nothing else, app2 to publish to topic2 and topic3 only, and app3 to publish to nothing.
- `spec.metadata.subscriptionScopes`
  - A semicolon-separated list of applications & comma-separated topic lists, allowing that app to subscribe to that list of topics
  - If nothing is specified in `subscriptionScopes` (default behavior), all apps can subscribe to all topics
  - For example, `app1=topic1;app2=topic2,topic3` will allow app1 to subscribe to topic1 only and app2 to subscribe to topic2 and topic3
- `spec.metadata.allowedTopics`
  - A comma-separated list of allowed topics for all applications.
  - If `allowedTopics` is not set (default behavior), all topics are valid. `subscriptionScopes` and `publishingScopes` still take place if present.
  - `publishingScopes` or `subscriptionScopes` can be used in conjunction with `allowedTopics` to add granular limitations
- `spec.metadata.protectedTopics`
  - A comma-separated list of protected topics for all applications.
  - If a topic is marked as protected then an application must be explicitly granted publish or subscribe permissions through `publishingScopes` or `subscriptionScopes` to publish/subscribe to it.

These metadata properties can be used for all pub/sub components. The following examples use Redis as pub/sub component.

## Example 1: Scope topic access

Limiting which applications can publish/subscribe to topics can be useful if you have topics which contain sensitive information and only a subset of your applications are allowed to publish or subscribe to these.

It can also be used for all topics to have always a "ground truth" for which applications are using which topics as publishers/subscribers.

Here is an example of three applications and three topics:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: "localhost:6379"
  - name: redisPassword
    value: ""
  - name: publishingScopes
    value: "app1=topic1;app2=topic2,topic3;app3="
  - name: subscriptionScopes
    value: "app2=;app3=topic1"
```

The table below shows which applications are allowed to publish into the topics:

|      | topic1 | topic2 | topic3 |
|------|--------|--------|--------|
| app1 | X      |        |        |
| app2 |        | X      | X      |
| app3 |        |        |        |

The table below shows which applications are allowed to subscribe to the topics:

|      | topic1 | topic2 | topic3 |
|------|--------|--------|--------|
| app1 | X      | X      | X      |
| app2 |        |        |        |
| app3 | X      |        |        |

> Note: If an application is not listed (e.g. app1 in subscriptionScopes) it is allowed to subscribe to all topics. Because `allowedTopics` is not used and app1 does not have any subscription scopes, it can also use additional topics not listed above.

## Example 2: Limit allowed topics

A topic is created if a Dapr application sends a message to it. In some scenarios this topic creation should be governed. For example:
- A bug in a Dapr application on generating the topic name can lead to an unlimited amount of topics created
- Streamline the topics names and total count and prevent an unlimited growth of topics

In these situations `allowedTopics` can be used.

Here is an example of three allowed topics:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: "localhost:6379"
  - name: redisPassword
    value: ""
  - name: allowedTopics
    value: "topic1,topic2,topic3"
```

All applications can use these topics, but only those topics, no others are allowed.

## Example 3: Combine `allowedTopics` and scopes

Sometimes you want to combine both scopes, thus only having a fixed set of allowed topics and specify scoping to certain applications.

Here is an example of three applications and two topics:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: "localhost:6379"
  - name: redisPassword
    value: ""
  - name: allowedTopics
    value: "A,B"
  - name: publishingScopes
    value: "app1=A"
  - name: subscriptionScopes
    value: "app1=;app2=A"
```

> Note: The third application is not listed, because if an app is not specified inside the scopes, it is allowed to use all topics.

The table below shows which application is allowed to publish into the topics:

|      | A | B | C |
|------|---|---|---|
| app1 | X |   |   |
| app2 | X | X |   |
| app3 | X | X |   |

The table below shows which application is allowed to subscribe to the topics:

|      | A | B | C |
|------|---|---|---|
| app1 |   |   |   |
| app2 | X |   |   |
| app3 | X | X |   |

## Example 4: Mark topics as protected

If your topic involves sensitive data, each new application must be explicitly listed in the `publishingScopes` and `subscriptionScopes` to ensure it cannot read from or write to that topic. Alternatively, you can designate the topic as 'protected' (using `protectedTopics`) and grant access only to specific applications that genuinely require it.

Here is an example of three applications and three topics, two of which are protected:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: "localhost:6379"
  - name: redisPassword
    value: ""
  - name: protectedTopics
    value: "A,B"
  - name: publishingScopes
    value: "app1=A,B;app2=B"
  - name: subscriptionScopes
    value: "app1=A,B;app2=B"
```

In the example above, topics A and B are marked as protected. As a result, even though `app3` is not listed under `publishingScopes` or `subscriptionScopes`, it cannot interact with these topics.

The table below shows which application is allowed to publish into the topics:

|      | A | B | C |
|------|---|---|---|
| app1 | X | X |   |
| app2 |   | X |   |
| app3 |   |   | X |

The table below shows which application is allowed to subscribe to the topics:

|      | A | B | C |
|------|---|---|---|
| app1 | X | X |   |
| app2 |   | X |   |
| app3 |   |   | X |


## Demo

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/7VdWBBGcbHQ?start=513" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## Next steps

- Learn [how to configure pub/sub components with multiple namespaces]({{< ref pubsub-namespaces.md >}})
- Learn about [message time-to-live]({{< ref pubsub-message-ttl.md >}})
- List of [pub/sub components]({{< ref supported-pubsub >}})
- Read the [API reference]({{< ref pubsub_api.md >}})