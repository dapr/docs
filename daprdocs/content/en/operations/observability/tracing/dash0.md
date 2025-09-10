---
type: docs
title: "How-To: Set up Dash0 for distributed tracing"
linkTitle: "Dash0"
weight: 5000
description: "Set up Dash0 for distributed tracing"
---

Dapr captures metrics, traces, and logs that can be sent directly to Dash0 through the OpenTelemetry Collector. Dash0 is an OpenTelemetry-native observability platform that provides comprehensive monitoring capabilities for distributed applications.

## Configure Dapr tracing with the OpenTelemetry Collector and Dash0

By using the OpenTelemetry Collector with the OTLP exporter to send data to Dash0, you can configure Dapr to create traces for each application in your Kubernetes cluster and collect them in Dash0 for analysis and monitoring.

## Prerequisites

* A running Kubernetes cluster with `kubectl` installed
* Helm v3+
* [Dapr installed in the cluster](https://docs.dapr.io/operations/hosting/kubernetes/kubernetes-deploy/)
* A Dash0 account ([Get started with a 14-day free trial](https://www.dash0.com/pricing))
* Your Dash0 **Auth Token** and **OTLP/gRPC endpoint** (find both under **Settings → Auth Tokens** and **Settings → Endpoints**)


## Configure the OpenTelemetry Collector 

1) Create a namespace for the Collector

```bash
kubectl create namespace opentelemetry
```

2) Create a Secret with your Dash0 **Auth Token** and **Endpoint**

```bash
kubectl create secret generic dash0-secrets \
  --from-literal=dash0-authorization-token="<your_auth_token>" \
  --from-literal=dash0-endpoint="<your_otlp_grpc_endpoint>" \
  --namespace opentelemetry
```

3) Add the OpenTelemetry Helm repo (once)

```bash
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm repo update
```

4) Create `values.yaml` for the Collector

This config:

* Reads token + endpoint from the Secret via env vars
* Enables OTLP receivers (gRPC + HTTP)
* Sends **traces, metrics, and logs** to Dash0 via OTLP/gRPC with Bearer auth

```yaml
mode: deployment
fullnameOverride: otel-collector
replicaCount: 1

image:
  repository: otel/opentelemetry-collector-k8s

extraEnvs:
  - name: DASH0_AUTHORIZATION_TOKEN
    valueFrom:
      secretKeyRef:
        name: dash0-secrets
        key: dash0-authorization-token
  - name: DASH0_ENDPOINT
    valueFrom:
      secretKeyRef:
        name: dash0-secrets
        key: dash0-endpoint

config:
  receivers:
    otlp:
      protocols:
        grpc: {}
        http: {}

  processors:
    batch: {}

  exporters:
    otlp/dash0:
      auth:
        authenticator: bearertokenauth/dash0
      endpoint: ${env:DASH0_ENDPOINT}

  extensions:
    bearertokenauth/dash0:
      scheme: Bearer
      token: ${env:DASH0_AUTHORIZATION_TOKEN}
    health_check: {}

  service:
    extensions:
      - bearertokenauth/dash0
      - health_check
    pipelines:
      traces:
        receivers: [otlp]
        processors: [batch]
        exporters: [otlp/dash0]
      metrics:
        receivers: [otlp]
        processors: [batch]
        exporters: [otlp/dash0]
      logs:
        receivers: [otlp]
        processors: [batch]
        exporters: [otlp/dash0]
```

5) Install/upgrade the Collector with Helm

```bash
helm upgrade --install otel-collector open-telemetry/opentelemetry-collector \
  --namespace opentelemetry \
  -f values.yaml
```

## Configure Dapr to send telemetry to the Collector

1) Create a configuration

Create `dapr-config.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: tracing
  namespace: default
spec:
  tracing:
    samplingRate: "1"  
    otel:
      endpointAddress: "otel-collector.opentelemetry.svc.cluster.local:4317"
      isSecure: false
      protocol: grpc
```

Apply it:

```bash
kubectl apply -f dapr-config.yaml
```

2) Annotate your application(s)

In each Deployment/Pod you want traced by Dapr, add:

```yaml
metadata:
  annotations:
    dapr.io/config: "tracing"
```

## Verify the setup

1. Check that the OpenTelemetry Collector is running:

```bash
kubectl get pods -n opentelemetry
```

2. Check the collector logs to ensure it's receiving and forwarding telemetry:

```bash
kubectl logs -n opentelemetry deployment/otel-collector
```

3. Deploy a sample application with Dapr tracing enabled and generate some traffic to verify traces are being sent to Dash0. You can use the [Dapr Kubernetes quickstart tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes) for testing.

## Viewing traces

Once your setup is complete and telemetry data is flowing, you can view traces in Dash0:

1. Navigate to your Dash0 account
2. Go to the **Traces** section  
3. You should see distributed traces from your Dapr applications
4. Use filters to narrow down traces by service name, operation, or time range

<img src="/images/dash0-dapr-trace-overview.png" width=1200 alt="Dash0 Trace Overview">

<img src="/images/dash0-dapr-trace.png" width=1200 alt="Dash0 Trace Details">

## Cleanup

```bash
helm -n opentelemetry uninstall otel-collector
kubectl -n opentelemetry delete secret dash0-secrets
kubectl delete ns opentelemetry
```

## Related Links

* [Dapr Kubernetes quickstart tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes)
* [Dapr observability quickstart](https://github.com/dapr/quickstarts/tree/master/tutorials/observability)
* [Dash0 documentation](https://www.dash0.com/docs)
* [OpenTelemetry Collector documentation](https://opentelemetry.io/docs/collector/)

