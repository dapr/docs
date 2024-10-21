---
type: docs
title: "Component spec"
linkTitle: "Component"
weight: 1000
description: "The basic spec for a Dapr component"
---

Dapr defines and registers components using a [resource specifications](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/). All components are defined as a resource and can be applied to any hosting environment where Dapr is running, not just Kubernetes.

Typically, components are restricted to a particular [namepsace]({{< ref isolation-concept.md >}}) and restricted access through scopes to any particular set of applications. The namespace is either explicit on the component manifest itself, or set by the API server, which derives the namespace through context with applying to Kubernetes. 

{{% alert title="Note" color="primary" %}}
The exception to this rule is in self-hosted mode, where daprd ingests component resources when the namespace field is omitted. However, the security profile is mute, as daprd has access to the manifest anyway, unlike in Kubernetes.
{{% /alert %}}

## Format

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
auth: 
 secretstore: <REPLACE-WITH-SECRET-STORE-NAME>
metadata:
  name: <REPLACE-WITH-COMPONENT-NAME>
  namespace: <REPLACE-WITH-COMPONENT-NAMESPACE>
spec:
  type: <REPLACE-WITH-COMPONENT-TYPE>
  version: v1
  initTimeout: <REPLACE-WITH-TIMEOUT-DURATION>
  ignoreErrors: <REPLACE-WITH-BOOLEAN>
  metadata:
  - name: <REPLACE-WITH-METADATA-NAME>
    value: <REPLACE-WITH-METADATA-VALUE>
scopes:
  - <REPLACE-WITH-APPID>
  - <REPLACE-WITH-APPID>
```

## Spec fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| apiVersion         | Y        | The version of the Dapr (and Kubernetes if applicable) API you are calling | `dapr.io/v1alpha1`
| kind               | Y        | The type of resource. For components is must always be `Component` | `Component`
| auth               | N        | The name of a secret store where `secretKeyRef` in the metadata lookup the name of secrets used in the component | See [How-to: Reference secrets in components]({{< ref component-secrets >}})
| scopes             | N        | The applications the component is limited to, specified by their app IDs | `order-processor`, `checkout`  
| **metadata**       | -        | **Information about the component registration** |
| metadata.name      | Y        | The name of the component | `prod-statestore`
| metadata.namespace | N        | The namespace for the component for hosting environments with namespaces | `myapp-namespace`
| **spec**           | -        | **Detailed information on the component resource**
| spec.type          | Y        | The type of the component | `state.redis`
| spec.version       | Y        | The version of the component | `v1`
| spec.initTimeout   | N        | The timeout duration for the initialization of the component. Default is 5s  | `5m`, `1h`, `20s`
| spec.ignoreErrors  | N        | Tells the Dapr sidecar to continue initialization if the component fails to load. Default is false  | `false`
| **spec.metadata**  | -        | **A key/value pair of component specific configuration. See your component definition for fields**|
| spec.metadata.name | Y        | The name of the component-specific property and its value | `- name: secretsFile` <br>   `value: secrets.json`

### Templated metadata values

Metadata values can contain template tags that are resolved on Dapr sidecar startup. The table below shows the current templating tags that can be used in components.

| Tag         | Details                                                            | Example use case                                                                                                                                                       |
|-------------|--------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| {uuid}      | Randomly generated UUIDv4                                          | When you need a unique identifier in self-hosted mode; for example, multiple application instances consuming a [shared MQTT subscription]({{< ref "setup-mqtt3.md" >}}) |
| {podName}   | Name of the pod containing the Dapr sidecar                        | Use to have a persisted behavior, where the ConsumerID does not change on restart when using StatefulSets in Kubernetes                                                |
| {namespace} | Namespace where the Dapr sidecar resides combined with its appId   | Using a shared `clientId` when multiple application instances consume a Kafka topic in Kubernetes                                                                      |
| {appID}     | The configured `appID` of the resource containing the Dapr sidecar | Having a shared `clientId` when multiple application instances consumer a Kafka topic in self-hosted mode                                                              |

Below is an example of using the `{uuid}` tag in an MQTT pubsub component. Note that multiple template tags can be used in a single metadata value.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: messagebus
spec:
  type: pubsub.mqtt3
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

## Related links
- [Components concept]({{< ref components-concept.md >}})
- [Reference secrets in component definitions]({{< ref component-secrets.md >}})
- [Supported state stores]({{< ref supported-state-stores >}})
- [Supported pub/sub brokers]({{< ref supported-pubsub >}})
- [Supported secret stores]({{< ref supported-secret-stores >}})
- [Supported bindings]({{< ref supported-bindings >}})
- [Set component scopes]({{< ref component-scopes.md >}})
