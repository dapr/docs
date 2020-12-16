---
type: docs
title: "Component schema"
linkTitle: "Component schema"
weight: 100
description: "The basic schema for a Dapr component"
---

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <COMPONENT-NAME> # Required. Example: prod-statestore.
  namespace: <COMPONENT-NAMESPACE> # Optional. Example: app-ns
spec:
  type: <COMPONENT-TYPE> # Required. Example: state.redis
  version: v1 # Required
  initTimeout: <TIMEOUT-DURATION> # Optional. Default: 30s
  ignoreErrors: <BOOLEAN> # Optional. Default: false
  metadata: # Required.
  - name: <METADATA-NAME>
    value: <METADATA-VALUE>
```

| Field  | Details |
| ------------- | ------------- |
| metadata.name  | The name of the component  |
| metadata.namespace | The namespace for the component  |
| metadata | A key/value pair of component specific configuration |
| spec.type  | The type of the component  |
| spec.version | The version of the component  |
| spec.initTimeout  | The timeout duration for the initialization of the component. durations examples: 10s, 10m, 1h  |
| spec.ignoreErrors | Tells the Dapr sidecar to continue initialization of the component fails to load  |