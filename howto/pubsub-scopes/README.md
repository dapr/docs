# Limit the Pub/Sub topics used or scope them to one or more applications

[Namespaces or component scopes](../components-scopes/README.md) can be used to limit component access to particular applications. These application scopes added to a component limit only the applications with specific IDs to be able to use the component.

In addition to this general component scope, the following can be limited for pub/sub components:
- the topics which can be used (published or subscribed)
- which applications are allowed to publish to specific topics
- which applications are allowed to subscribe to specific topics

This is called pub/sub topic scoping.

To use this topic scoping, three metadata properties can be set for a pub/sub component:
- ```spec.metadata.publishingScopes```: the list of applications to topic scopes to allow publishing, separated by semicolons. If an app is not specified in ```publishingScopes```, its allowed to publish to all topics.
- ```spec.metadata.subscriptionScopes```: the list of applications to topic scopes to allow subscription, separated by semicolons. If an app is not specified in ```subscriptionScopes```, its allowed to subscribe to all topics.
- ```spec.metadata.allowedTopics```: a comma-separated list for allowed topics for all applications.  ```publishingScopes``` or ```subscriptionScopes``` can be used in addition to add granular limitations. If ```allowedTopics``` is not set, all topics are valid and then ```subscriptionScopes``` and ```publishingScopes``` take place if present.

These metadata properties can be used for all pub/sub components. The following examples use Redis as pub/sub component. 

## Scenario 1: Limit which application can publish or subscribe to topics

This can be useful, if you have topics which contain sensitive information and only a subset of your applications are allowed to publish or subscribe to these.

It can also be used for all topics to have always a "ground truth" for which applications are using which topics as publishers/subscribers.

Here is an example of three applications and three topics:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: messagebus
  namespace: default
spec:
  type: pubsub.redis
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

The table below shows which application is allowed to publish into the topics:
| Publishing | app1 | app2 | app3 |
|------------|------|------|------|
| topic1     |   X  |      |      |
| topic2     |      |   X  |      |
| topic3     |      |   X  |      |

The table below shows which application is allowed to subscribe to the topics:
| Subscription | app1 | app2 | app3 |
|--------------|------|------|------|
| topic1       |   X  |      |   X  |
| topic2       |   X  |      |      |
| topic3       |   X  |      |      |

> Note: If an application is not listed (e.g. app1 in subscriptionScopes), it is allowed to subscribe to all topics. Because ```allowedTopics``` (see below of examples) is not used and app1 does not have any subscription scopes, it can also use additional topics not listed above.

## Scenario 2: Limit which topics can be used by all applications without granular limitations 

A topic is created if a Dapr application sends a message to it. In some scenarios this topic creation should be governed. For example;
- a bug in a Dapr application on generating the topic name can lead to an unlimited amount of topics created
- streamline the topics names and total count and prevent an unlimited growth of topics

In these situations, ```allowedTopics``` can be used.

Here is an example of three allowed topics:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: messagebus
  namespace: default
spec:
  type: pubsub.redis
  metadata:
  - name: redisHost
    value: "localhost:6379"
  - name: redisPassword
    value: ""
  - name: allowedTopics
    value: "topic1,topic2,topic3"
```

All applications can use these topics, but only those topics, no others are allowed.

## Scenario 3: Combine both allowed topics allowed applications that can publish and subscribe

Sometimes you want to combine both scopes, thus only having a fixed set of allowed topics and specify scoping to certain applications.

Here is an example of three applications and two topics:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: messagebus
  namespace: default
spec:
  type: pubsub.redis
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
| Publishing | app1 | app2 | app3 |
|------------|------|------|------|
| A          |   X  |   X  |   X  |
| B          |      |   X  |   X  |

The table below shows which application is allowed to subscribe to the topics:
| Subscription | app1 | app2 | app3 |
|--------------|------|------|------|
| A            |      |   X  |   X  |
| B            |      |      |   X  |

No other topics can be used, only A and B.
