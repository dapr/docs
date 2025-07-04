---
type: docs
title: "How-To: Enable preview features"
linkTitle: "Preview features"
weight: 7000
description: "How to specify and enable preview features"
---

[Preview features]({{< ref support-preview-features >}}) in Dapr are considered experimental when they are first released. These preview features require you to explicitly opt-in to use them. You specify this opt-in in Dapr's Configuration file.

Preview features are enabled on a per application basis by setting configuration when running an application instance.

## Configuration properties

The `features` section under the `Configuration` spec contains the following properties:

| Property       | Type   | Description |
|----------------|--------|-------------|
|`name`|string|The name of the preview feature that is enabled/disabled
|`enabled`|bool|Boolean specifying if the feature is enabled or disabled

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

{{< tabs Self-hosted Kubernetes >}}

<!--self-hosted-->
{{% codetab %}}

To enable preview features when running Dapr locally, either update the default configuration or specify a separate config file using `dapr run`.

The default Dapr config is created when you run `dapr init`, and is located at:
- Windows: `%USERPROFILE%\.dapr\config.yaml`
- Linux/macOS: `~/.dapr/config.yaml`

Alternately, you can update preview features on all apps run locally by specifying the `--config` flag in `dapr run` and pointing to a separate Dapr config file:

```bash
dapr run --app-id myApp --config ./previewConfig.yaml ./app
```

{{% /codetab %}}

<!--kubernetes-->
{{% codetab %}}

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

{{% /codetab %}}

{{< /tabs >}}

## Next steps

{{< button text="Configuration schema" page="configuration-schema" >}}