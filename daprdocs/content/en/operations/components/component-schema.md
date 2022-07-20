---
type: docs
title: "Component schema"
linkTitle: "Component schema"
weight: 100
description: "The basic schema for a Dapr component"
---

Dapr defines and registers components using a [CustomResourceDefinition](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/). All components are defined as a CRD and can be applied to any hosting environment where Dapr is running, not just Kubernetes.

## Format

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: [COMPONENT-NAME]
  namespace: [COMPONENT-NAMESPACE]
spec:
  type: [COMPONENT-TYPE]
  version: v1
  initTimeout: [TIMEOUT-DURATION]
  ignoreErrors: [BOOLEAN]
  metadata:
  - name: [METADATA-NAME]
    value: [METADATA-VALUE]
```

## Fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| apiVersion         | Y        | The version of the Dapr (and Kubernetes if applicable) API you are calling | `dapr.io/v1alpha1`
| kind               | Y        | The type of CRD. For components is must always be `Component` | `Component`
| **metadata**       | -        | **Information about the component registration** |
| metadata.name      | Y        | The name of the component | `prod-statestore`
| metadata.namespace | N        | The namespace for the component for hosting environments with namespaces | `myapp-namespace`
| **spec**           | -        | **Detailed information on the component resource**
| spec.type          | Y        | The type of the component | `state.redis`
| spec.version       | Y        | The version of the component | `v1`
| spec.initTimeout   | N        | The timeout duration for the initialization of the component. Default is 5s  | `5m`, `1h`, `20s`
| spec.ignoreErrors  | N        | Tells the Dapr sidecar to continue initialization if the component fails to load. Default is false  | `false`
| **spec.metadata**  | -        | **A key/value pair of component specific configuration. See your component definition for fields**|

### Special metadata values

Metadata values can contain a `{uuid}` tag that is replaced with a randomly generate UUID when the Dapr sidecar starts up. A new UUID is generated on every start up. It can be used, for example, to have a pod on Kubernetes with multiple application instances consuming a [shared MQTT subscription]({{< ref "setup-mqtt.md" >}}). Below is an example of using the `{uuid}` tag.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: messagebus
spec:
  type: pubsub.mqtt
  version: v1
  metadata:
    - name: consumerID
      value: "{uuid}"
    - name: url
      value: "tcp://admin:public@localhost:1883"
    - name: qos
      value: 1
    - name: retain
      value: "false"
    - name: cleanSession
      value: "false"
```

The consumerID metadata values can also contain a `{podName}` tag that is replaced with the Kubernetes POD's name when the Dapr sidecar starts up. This can be used to have a persisted behavior where the ConsumerID does not change on restart when using StatefulSets in Kubernetes.


## Further reading
- [Components concept]({{< ref components-concept.md >}})
- [Reference secrets in component definitions]({{< ref component-secrets.md >}})
- [Supported state stores]({{< ref supported-state-stores >}})
- [Supported pub/sub brokers]({{< ref supported-pubsub >}})
- [Supported secret stores]({{< ref supported-secret-stores >}})
- [Supported bindings]({{< ref supported-bindings >}})
- [Set component scopes]({{< ref component-scopes.md >}})
