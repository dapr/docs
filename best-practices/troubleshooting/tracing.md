# Tracing

Dapr integrates with Open Census for telemetry and tracing.

It is recommended to run Dapr with tracing enabled for any production scenario.
Since Dapr uses Open Census, you can configure various exporters for tracing and telemetry data based on your environment, whether it is running in the cloud or on-premises.

## Distributed Tracing with Zipkin on Kubernetes

The following steps show you how to configure Dapr to send distributed tracing data to Zipkin running as a container in your Kubernetes cluster, and how to view them.

### Setup

First, deploy Zipkin:

```bash
kubectl create deployment zipkin --image openzipkin/zipkin
```

Create a Kubernetes Service for the Zipkin pod:

```bash
kubectl expose deployment zipkin --type ClusterIP --port 9411
```

Next, create the following YAML file locally:

```yml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: zipkin
  namespace: default
spec:
  tracing:
    enabled: true
    exporterType: zipkin
    exporterAddress: "http://zipkin.default.svc.cluster.local:9411/api/v2/spans"
    expandParams: true
    includeBody: true
```

Finally, deploy the Dapr configuration:

```bash
kubectl apply -f config.yaml
```

In order to enable this configuration for your Dapr sidecar, add the following annotation to your pod spec template:

```yml
annotations:
  dapr.io/config: "zipkin"
```

That's it! Your sidecar is now configured for use with Open Census and Zipkin.

### Viewing Tracing Data

To view traces, connect to the Zipkin service and open the UI:

```bash
kubectl port-forward svc/zipkin 9411:9411
```

On your browser, go to ```http://localhost:9411``` and you should see the Zipkin UI.

![zipkin](../../images/zipkin_ui.png)

## Distributed Tracing with Zipkin - Standalone Mode

The following steps show you how to configure Dapr to send distributed tracing data to Zipkin running as a container on your local machine and view them.

For Standalone mode, create a Dapr configuration file locally and reference it with the Dapr CLI.

1. Create the following YAML file:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: zipkin
  namespace: default
spec:
  tracing:
    enabled: true
    exporterType: zipkin
    exporterAddress: "http://localhost:9411/api/v2/spans"
    expandParams: true
    includeBody: true
```

2. Launch Zipkin using Docker:

```bash
docker run -d -p 9411:9411 openzipkin/zipkin
```

3. Launch Dapr with the `--config` param:

```bash
dapr run --app-id mynode --app-port 3000 --config ./config.yaml node app.js
```

## Tracing Configuration

The `tracing` section under the `Configuration` spec contains the following properties:

```yml
tracing:
    enabled: true
    exporterType: zipkin
    exporterAddress: ""
    expandParams: true
    includeBody: true
```

The following table lists the different properties.

Property | Type | Description
---- | ------- | -----------
enabled  | bool | Set tracing to be enabled or disabled
exporterType  | string | Name of the Open Census exporter to use. For example: Zipkin, Azure Monitor, etc
exporterAddress  | string | URL of the exporter
expandParams  | bool | When true, expands parameters passed to HTTP endpoints
includeBody  | bool | When true, includes the request body in the tracing event
