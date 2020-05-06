# Set up Zipkin for distributed tracing

- [Configure self hosted mode](#Configure-self-hosted-mode)
- [Configure Kubernetes](#Configure-Kubernetes)
- [Tracing configuration](#Tracing-Configuration)


## Configure self hosted mode

For self hosted mode, create a Dapr configuration file locally and reference it with the Dapr CLI.

1. Create the following YAML files:

* zipkin.yaml

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: zipkin
  namespace: default
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
  namespace: default
spec:
  tracing:
    samplingRate: "1"
```

2. Copy `zipkin.yaml` to a `/components` subfolder under the same folder where you run your application.

3. Launch Zipkin using Docker:

```bash
docker run -d -p 9411:9411 openzipkin/zipkin
```

3. Launch your application with Dapr CLI using the `--config` param:

```bash
dapr run --app-id mynode --app-port 3000 --config ./tracing.yaml node app.js
```
### Viewing Traces
To view traces, in your browser go to http://localhost:9411 and you will see the Zipkin UI.

## Configure Kubernetes

The following steps shows you how to configure Dapr to send distributed tracing data to Zipkin running as a container in your Kubernetes cluster, how to view them.

### Setup

First, deploy Zipkin:

```bash
kubectl run zipkin --image openzipkin/zipkin --port 9411
```

Create a Kubernetes service for the Zipkin pod:

```bash
kubectl expose deploy zipkin --type ClusterIP --port 9411
```

Next, create the following YAML files locally:

* zipkin.yaml component

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: zipkin
  namespace: default
spec:
  type: exporters.zipkin
  metadata:
  - name: enabled
    value: "true"
  - name: exporterAddress
    value: "http://zipkin.default.svc.cluster.local:9411/api/v2/spans"
```

* tracing.yaml configuration

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: tracing
  namespace: default
spec:
  tracing:
    samplingRate: "1"
```

Finally, deploy the the Dapr component and configuration files:

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

In your browser, go to ```http://localhost:9411``` and you will see the Zipkin UI.

![zipkin](../../images/zipkin_ui.png)

## Tracing configuration

The `tracing` section under the `Configuration` spec contains the following properties:

```yml
tracing:
    samplingRate: "1"
```

The following table lists the different properties.

Property | Type | Description
---- | ------- | -----------
samplingRate  | string | Set sampling rate for tracing to be enabled or disabled. 


`samplingRate` is used to enable or disable the tracing. To disable the sampling rate ,
set `samplingRate : "0"` in the configuration. The valid range of samplingRate is between 0 and 1 inclusive. The sampling rate determines whether a trace span should be sampled or not based on value. `samplingRate : "1"` will always sample the traces.By default, the sampling rate is 1 in 10,000
                         
