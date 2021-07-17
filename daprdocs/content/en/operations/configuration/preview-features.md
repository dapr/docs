---
type: docs
title: "How-To: Enable preview features"
linkTitle: "Preview features"
weight: 7000
description: "How to specify and enable preview features"
---

## Overview
Some features in Dapr are considered experimental when they are first released. These features require explicit opt-in in order to be used. The opt-in is specified in Dapr's configuration.

Currently, preview features are enabled on a per application basis when running on Kubernetes. A global scope may be introduced in the future should there be a use case for it.

### Current preview features
Below is a list of existing preview features:
- [Actor Reentrancy]({{<ref actor-reentrancy.md>}})

## Configuration properties
The `features` section under the `Configuration` spec contains the following properties:

| Property       | Type   | Description |
|----------------|--------|-------------|
|name|string|The name of the preview feature that will be enabled/disabled
|enabled|bool|Boolean specifying if the feature is enabled or disabled

## Enabling a preview feature
Preview features are specified in the configuration. Here is an example of a full configuration that contains multiple features:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: featureconfig
spec:
  tracing:
    samplingRate: "1"
    zipkin:
      endpointAddress: "http://zipkin.default.svc.cluster.local:9411/api/v2/spans"
  features:
    - name: Feature1
      enabled: true
    - name: Feature2
      enabled: true
```

### Standalone
To enable preview features when running Dapr locally, either update the default configuration or specify a separate config file using `dapr run`.

The default Dapr config is created when you run `dapr init`, and is located at:
- Windows: `%USERPROFILE%\.dapr\config.yaml`
- Linux/macOS: `~/.dapr/config.yaml`

Alternately, you can update preview features on all apps run locally by specifying the `--config` flag in `dapr run` and pointing to a separate Dapr config file:

```bash
dapr run --app-id myApp --config ./previewConfig.yaml ./app
```


### Kubernetes
In Kubernetes mode, the configuration must be provided via a configuration component. Using the same configuration as above, apply it via `kubectl`:

```bash
kubectl apply -f previewConfig.yaml
```

This configuration component can then be referenced in any application by modifying the application's configuration to reference that specific configuration component via the `dapr.io/config` element. For example:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodeapp
  labels:
    app: node
spec:
  replicas: 1
  selector:
    matchLabels:
      app: node
  template:
    metadata:
      labels:
        app: node
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "nodeapp"
        dapr.io/app-port: "3000"
        dapr.io/config: "featureconfig"
    spec:
      containers:
      - name: node
        image: dapriosamples/hello-k8s-node:latest
        ports:
        - containerPort: 3000
        imagePullPolicy: Always
```
