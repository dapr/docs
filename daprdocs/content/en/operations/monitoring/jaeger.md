---
type: docs
title: "How-To: Set up Jaeger for distributed tracing"
linkTitle: "Jaeger"
weight: 3000
description: "Set up Jaeger for distributed tracing"
type: docs
---

The following steps shows you how to configure Dapr to send distributed tracing data to Jaeger running as a container in your Kubernetes cluster, how to view them.

## Setup

First the following YAML file to install Jaeger
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

Now, let's use that Jaeger Operator resource to install Jaeger
```bash
# Install Jaeger
helm repo add jaegertracing https://jaegertracing.github.io/helm-charts
helm install jaeger-operator jaegertracing/jaeger-operator
kubectl apply -f jaeger-operator.yaml

# Wait for Jaeger to be up and running
kubectl wait deploy --selector app.kubernetes.io/name=jaeger --for=condition=available
```

Next, create the following YAML files locally:

* jaeger.yaml component

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: zipkin
spec:
  # Note that since we are using the Zipkin protocol to talk to Jaeger, the component
  # name is still Zipkin.
  type: exporters.zipkin
  metadata:
  - name: enabled
    value: "true"
  - name: exporterAddress
    # However, the endpoint name is the address of Jaeger collector
    value: "http://jaeger-collector.default.svc.cluster.local:9411/api/v2/spans"
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

That's it! your sidecar is now configured for use with Jaeger.

## Viewing Tracing Data

To view traces, connect to the Jaeger Service and open the UI:

```bash
kubectl port-forward svc/jaeger-query 16686
```

In your browser, go to `http://localhost:16686` and you will see the Jaeger UI.

![jaeger](/images/jaeger_ui.png)

## References
- [W3C distributed tracing]({{< ref w3c-tracing >}})
