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
| spec.initTimeout   | N        | The timeout duration for the initialization of the component. Default is 30s  | `5m`, `1h`, `20s`
| spec.ignoreErrors  | N        | Tells the Dapr sidecar to continue initialization if the component fails to load. Default is false  | `false`       
| **spec.metadata**  | -        | **A key/value pair of component specific configuration. See your component definition for fields**|

## Further reading
- [Components concept]({{< ref components-concept.md >}})
- [Reference secrets in component definitions]({{< ref component-secrets.md >}})
- [Supported state stores]({{< ref supported-state-stores >}})
- [Supported pub/sub brokers]({{< ref supported-pubsub >}})
- [Supported secret stores]({{< ref supported-secret-stores >}})
- [Supported bindings]({{< ref supported-bindings >}})
- [Set component scopes]({{< ref component-scopes.md >}})