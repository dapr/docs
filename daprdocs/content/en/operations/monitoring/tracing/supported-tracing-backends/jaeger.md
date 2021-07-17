---
type: docs
title: "How-To: Set up Jaeger for distributed tracing"
linkTitle: "Jaeger"
weight: 3000
description: "Set up Jaeger for distributed tracing"
type: docs
---

Dapr currently supports the Zipkin protocol. Since Jaeger is
compatible with Zipkin, the Zipkin protocol can be used to talk to
Jaeger.

## Configure self hosted mode

### Setup

The simplest way to start Jaeger is to use the pre-built all-in-one
Jaeger image published to DockerHub:

```bash
docker run -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9412 \
  -p 16686:16686 \
  -p 9412:9412 \
  jaegertracing/all-in-one:1.22
```


Next, create the following YAML files locally:

* **config.yaml**: Note that because we are using the Zipkin protocol
to talk to Jaeger, we specify the `zipkin` section of tracing
configuration set the `endpointAddress` to address of the Jaeger
instance.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: tracing
  namespace: default
spec:
  tracing:
    samplingRate: "1"
    zipkin:
      endpointAddress: "http://localhost:9412/api/v2/spans"
```

To launch the application referring to the new YAML file, you can use
`--config` option:

```bash
dapr run --app-id mynode --app-port 3000 node app.js --config config.yaml
```

### Viewing Traces
To view traces, in your browser go to http://localhost:16686 and you will see the Jaeger UI.

## Configure Kubernetes
The following steps shows you how to configure Dapr to send distributed tracing data to Jaeger running as a container in your Kubernetes cluster, how to view them.

### Setup

First create the following YAML file to install Jaeger
* jaeger-operator.yaml
```yaml
apiVersion: jaegertracing.io/v1
kind: "Jaeger"
metadata:
  name: jaeger
spec:
  strategy: allInOne
  ingress:
    enabled: false
  allInOne:
    image: jaegertracing/all-in-one:1.22
    options:
      query:
        base-path: /jaeger
```

Now, use the above YAML file to install Jaeger
```bash
# Install Jaeger
helm repo add jaegertracing https://jaegertracing.github.io/helm-charts
helm install jaeger-operator jaegertracing/jaeger-operator
kubectl apply -f jaeger-operator.yaml

# Wait for Jaeger to be up and running
kubectl wait deploy --selector app.kubernetes.io/name=jaeger --for=condition=available
```

Next, create the following YAML file locally:

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
    zipkin:
      endpointAddress: "http://jaeger-collector.default.svc.cluster.local:9411/api/v2/spans"
```

Finally, deploy the the Dapr component and configuration files:

```bash
kubectl apply -f tracing.yaml
```

In order to enable this configuration for your Dapr sidecar, add the following annotation to your pod spec template:

```yml
annotations:
  dapr.io/config: "tracing"
```

That's it! Your Dapr sidecar is now configured for use with Jaeger.

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
