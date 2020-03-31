# Limit the Pub/Sub topics used or scope them to one or more applications

[Namespaces or component scopes](../components-scopes/README.md) can be used to limit component access to particular Dapr instances.

In addition to this, the following can be limited at pub/sub components:
- the topics which can be used
- which applications are allowed to publish to specific topics
- which applications are allowed to subscribe to specific topics

To use this topic scoping, three metadata properties can be set at the pub/sub component:
- ```spec.metadata.publishingScopes```: list of application to topic scopes to allow publishing, separated by semicolons. If an app is not specified in ```publishingScopes```, its allowed to publish to all topics.
- ```spec.metadata.subscriptionScopes```: list of application to topic scopes to allow subscription, separated by semicolons. If an app is not specified in ```subscriptionScopes```, its allowed to subscribe to all topics.
- ```spec.metadata.allowedTopics```: a comma-separated list for allowed topics for all applications.  ```publishingScopes``` or ```subscriptionScopes``` can be used in addition to add granular limitations. If ```allowedTopics``` is not set, all topics are valid and then ```subscriptionScopes``` and ```publishingScopes``` take place if existent.

The  following scenarios are using Redis as pub/sub component, but this is only an example. These metadata properties can be used at all pub/sub components.

## Scenario 1: Limit which application can publish or subscribe to topics

This can be useful, if you have topics which contain sensitive information and only a subset of your applications are allowed to publish or subscribe to these.

It can also be used for all topics to have always a ground truth which applications are using which topics as publishers/subscribers.

An example of three applications and three topics:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: messagebus
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

See below which application is allowed to publish into the topics:
| Publishing | app1 | app2 | app3 |
|------------|------|------|------|
| topic1     |   X  |      |      |
| topic2     |      |   X  |      |
| topic3     |      |   X  |      |

Below you can see which application is allowed to subscribe to the topics:
| Subscription | app1 | app2 | app3 |
|--------------|------|------|------|
| topic1       |   X  |      |   X  |
| topic2       |   X  |      |      |
| topic3       |   X  |      |      |

> Hint: Be aware that if an application is not listed (e.g. app1 in subscriptionScopes), it is allowed to subscribe to all topics. Because ```allowedTopics``` (see below of examples) is not used and app1 does not have any subscription scopes, it can also use additional topics not listed above.

## Scenario 2: Limit which topics can be used by all applications without granular limitations 

A new topic is automatically created if a Dapr applications sends a message to it.
In some scenarios this topic creation should be governed:
- a bug in a Dapr application on generating the topic name can lead to an unlimited amount of topics created
- streamline the topics names and total count and don't allow a wild growth of unmanageable topics

In these situations ```allowedTopics``` can be used.

An example of three topics:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: messagebus
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

All applications can use these topics, but only those, others are not allowed.

## Scenario 3: Combine both

Sometimes you want to combine both limitations, thus only having a fixed set of allowed topic and specify some application scoping on top of it.

An example of three applications and two topics:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: messagebus
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

> Hint: The third application is not listed, because if an app is not specified inside the scopes, its allowed to use all topics.

See below which application is allowed to publish into the topics:
| Publishing | app1 | app2 | app3 |
|------------|------|------|------|
| A          |   X  |   X  |   X  |
| B          |      |   X  |   X  |

Below you can see which application is allowed to subscribe to the topics:
| Subscription | app1 | app2 | app3 |
|--------------|------|------|------|
| A            |      |   X  |   X  |
| B            |      |      |   X  |

No other topics can be used, only A and B.