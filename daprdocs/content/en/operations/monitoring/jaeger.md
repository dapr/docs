---
type: docs
title: "How-To: Set up Jaeger for distributed tracing"
linkTitle: "Jaeger"
weight: 3000
description: "Set up Jaeger for distributed tracing"
type: docs
---
Dapr currently supports two kind of tracing protocol: OpenCensus and
Zipkin. Since Jaeger is compatible with Zipkin, we can use the Zipkin
protocol to talk to Jaeger.

## Configure self hosted mode

### Setup

For self hosted mode, on running `dapr init` the following YAML files are created by default and they are referenced by default on `dapr run` calls unless otherwise overridden.

1. The following file in `$HOME/.dapr/components/zipkin.yaml` or `%USERPROFILE%\dapr\components\zipkin.yaml`:

* **zipkin.yaml**: Update the port 9411 to 9412 in this file, since
often Zipkin is already installed and listen on 9411 in the self
hosted mode. Recall that we are using the Zipkin protocol to talk to
Dapr, so the exporter type in the file below is `exporters.zipkin`

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: zipkin
  namespace: default
spec:
  type: exporters.zipkin
  version: v1
  metadata:
  - name: enabled
    value: "true"
  - name: exporterAddress
    value: "http://localhost:9412/api/v2/spans"
```
2. The following file in `$HOME/dapr/config.yaml` or `%USERPROFILE%\dapr\config.yaml`:

* **config.yaml**

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprConfig
  namespace: default
spec:
  tracing:
    samplingRate: "1"
```

3. The simplest way to start Jaeger is to use the pre-built all-in-one Jaeger image published to DockerHub:

```bash
docker run -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HTTP_PORT=9412 \
  -p 16686:16686 \
  -p 9412:9412 \
  jaegertracing/all-in-one:1.21
```

4. The applications launched with `dapr run` will by default reference the config file in `$HOME/dapr/config.yaml` or `%USERPROFILE%\dapr\config.yaml` and can be overridden with the Dapr CLI using the `--config` param:

```bash
dapr run --app-id mynode --app-port 3000 node app.js
```

### Viewing Traces
To view traces, in your browser go to http://localhost:16686 and you will see the Zipkin UI.

## Configure Kubernetes
The following steps shows you how to configure Dapr to send distributed tracing data to Jaeger running as a container in your Kubernetes cluster, how to view them.

### Setup

First create the following YAML file to install Jaeger
* jaeger-operator.yaml
```yaml
apiVersion: jaegertracing.io/v1
kind: "Jaeger"
metadata:
  name: "jaeger"
spec:
  strategy: allInOne
  ingress:
    enabled: false
  allInOne:
    image: jaegertracing/all-in-one:1.13
    options:
      query:
        base-path: /jaeger
```

Now, use the above YAML file to install install Jaeger
```bash
# Install Jaeger
helm repo add jaegertracing https://jaegertracing.github.io/helm-charts
helm install jaeger-operator jaegertracing/jaeger-operator
kubectl apply -f jaeger-operator.yaml

# Wait for Jaeger to be up and running
kubectl wait deploy --selector app.kubernetes.io/name=jaeger --for=condition=available
```

Next, create the following YAML files locally:

* **jaeger.yaml**: Note that because we are using the Zipkin protocol to talk to Jaeger,
the type of the exporter in the YAML file below is `exporter.zipkin`,
while the `exporterAddress` is the address of the Jaeger instance.


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
    value: "http://jaeger-collector.default.svc.cluster.local:9411/api/v2/spans"
```

* **tracing.yaml**

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
kubectl apply -f jaeger.yaml
```

In order to enable this configuration for your Dapr sidecar, add the following annotation to your pod spec template:

```yml
annotations:
  dapr.io/config: "tracing"
```

That's it! your sidecar is now configured for use with Jaeger.

### Viewing Tracing Data

To view traces, connect to the Jaeger Service and open the UI:

```bash
kubectl port-forward svc/jaeger-query 16686
```

In your browser, go to `http://localhost:16686` and you will see the Jaeger UI.

![jaeger](/images/jaeger_ui.png)

## References
- [Jaeger Getting Started](https://www.jaegertracing.io/docs/1.21/getting-started/#all-in-one)
- [W3C distributed tracing]({{< ref w3c-tracing >}})
