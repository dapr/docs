# Use Pub/Sub to publish a message to a topic

Pub/Sub is a common pattern in a distributed system with many services that want to utilize decoupled, asynchronous messaging.
Using Pub/Sub, you can enable scenarios where event consumers are decoupled from event producers.

Dapr provides an extensible Pub/Sub system with At-Least-Once guarantees, allowing developers to publish and subscribe to topics.
Dapr provides different implementation of the underlying system, and allows operators to bring in their preferred infrastructure, for example Redis Streams, Kafka, etc.

## Setup the Pub/Sub component

The first step is to setup the Pub/Sub component.
For this guide, we'll use Redis Streams, which is also installed by default on a local machine when running `dapr init`.

*Note: When running Dapr locally, a pub/sub component YAML is automatically created for you locally. To override, create a `components` directory containing the file and use the flag `--components-path` with the `dapr run` CLI command.*

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
    value: localhost:6379
  - name: redisPassword
    value: ""
```

To deploy this into a Kubernetes cluster, fill in the `metadata` connection details in the yaml, and run `kubectl apply -f pubsub.yaml`.

## Publish a topic

To publish a message to a topic, invoke the following endpoint on a Dapr instance:

```bash
curl -X POST http://localhost:3500/v1.0/publish/deathStarStatus \
 -H "Content-Type: application/json" \
 -d '{
      "status": "completed"
    }'
```

The above example publishes a JSON payload to a `deathStartStatus` topic.
Dapr will wrap the user payload in a Cloud Events v1.0 compliant envelope.
