# Set up distributed tracing with Zipkin

Dapr integrates seamlessly with OpenTelemetry for telemetry and tracing. It is recommended to run Dapr with tracing enabled for any production scenario. Since Dapr uses OpenTelemetry, you can configure various exporters for tracing and telemetry data based on your environment, whether it is running in the cloud or on-premises.

## How to configure distributed tracing with Zipkin on Kubernetes

The following steps will show you how to configure Dapr to send distributed tracing data to Zipkin running as a container in your Kubernetes cluster, and how to view them.

### Setup

First, deploy Zipkin:

```bash
kubectl run zipkin --image openzipkin/zipkin --port 9411
```

Create a Kubernetes Service for the Zipkin pod:

```bash
kubectl expose deploy zipkin --type ClusterIP --port 9411
```

Next, create the following YAML files locally:

* zipkin.yaml

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: zipkin
spec:
  type: exporters.zipkin
  metadata:
  - name: enabled
    value: "true"
  - name: exporterAddress
    value: "http://zipkin.default.svc.cluster.local:9411/api/v2/spans"
```

* tracing.yaml

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: tracing
spec:
  tracing:
    enabled: true
    expandParams: true
    includeBody: true
```

Finally, deploy the Dapr configurations:

```bash
kubectl apply -f tracing.yaml
kubectl apply -f zipkin.yaml
```

In order to enable this configuration for your Dapr sidecar, add the following annotation to your pod spec template:

```yml
annotations:
  dapr.io/config: "tracing"
```

That's it! your sidecar is now configured for use with Open Census and Zipkin.

### Viewing Tracing Data

To view traces, connect to the Zipkin Service and open the UI:

```bash
kubectl port-forward svc/zipkin 9411:9411
```

On your browser, go to ```http://localhost:9411``` and you should see the Zipkin UI.

![zipkin](../../images/zipkin_ui.png)

## How to configure distributed tracing with Zipkin when running in stand-alone mode

For standalone mode, create an Dapr Configuration CRD file locally and reference it with the Dapr CLI.

1. Create the following YAML files:

* zipkin.yaml

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: zipkin
spec:
  type: exporters.zipkin
  metadata:
  - name: enabled
    value: "true"
  - name: exporterAddress
    value: "http://localhost:9411/api/v2/spans"
```

* tracing.yaml

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: tracing
spec:
  tracing:
    enabled: true
    expandParams: true
    includeBody: true
```

2. Copy *zipkin.yaml* to a *components* folder under the same folder where you run you application.

3. Launch Zipkin using Docker:

```bash
docker run -d -p 9411:9411 openzipkin/zipkin
```

3. Launch Dapr with the `--config` param:

```bash
dapr run --app-id mynode --app-port 3000 --config ./tracing.yaml node app.js
```

## Tracing Configuration

The `tracing` section under the `Configuration` spec contains the following properties:

```yml
tracing:
    enabled: true
    expandParams: true
    includeBody: true
```

The following table lists the different properties.

Property | Type | Description
---- | ------- | -----------
enabled  | bool | Set tracing to be enabled or disabled
expandParams  | bool | When true, expands parameters passed to HTTP endpoints
includeBody  | bool | When true, includes the request body in the tracing event
