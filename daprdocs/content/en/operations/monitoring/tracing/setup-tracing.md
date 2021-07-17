---
type: docs
title: "Configure Dapr to send distributed tracing data"
linkTitle: "Enable Dapr tracing for your application"
weight: 100
description: "Configure Dapr to send distributed tracing data"
---

It is recommended to run Dapr with tracing enabled for any production
scenario.  You can configure Dapr to send tracing and telemetry data
to many backends based on your environment, whether it is running in
the cloud or on-premises.

## Tracing configuration

The `tracing` section under the `Configuration` spec contains the following properties:

```yml
spec:
  tracing:
    samplingRate: "1"
    zipkin:
      endpointAddress: "https://..."
```

The following table lists the properties for tracing:

| Property     | Type   | Description |
|--------------|--------|-------------|
| `samplingRate` | string | Set sampling rate for tracing to be enabled or disabled.
| `zipkin.endpointAddress` | string | Set the Zipkin server address.


## Zipkin in self hosted mode

The following steps show you how to configure Dapr to send distributed tracing data to Zipkin running as a container on your local machine and view them.

For self hosted mode, create a Dapr configuration file locally and reference it with the Dapr CLI.

1. Create the following `config.yaml` YAML file:

   ```yaml
   apiVersion: dapr.io/v1alpha1
   kind: Configuration
   metadata:
     name: zipkin
     namespace: default
   spec:
     tracing:
       samplingRate: "1"
       zipkin:
         endpointAddress: "http://localhost:9411/api/v2/spans"
   ```

2. Launch Zipkin using Docker:

   ```bash
   docker run -d -p 9411:9411 openzipkin/zipkin
   ```

3. Launch Dapr with the `--config` param with the path for where the `config.yaml` is saved :

   ```bash
   dapr run --app-id mynode --app-port 3000 --config ./config.yaml node app.js
   ```


## Zipkin in Kubernetes mode

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
    samplingRate: "1"
    zipkin:
      endpointAddress: "http://zipkin.default.svc.cluster.local:9411/api/v2/spans"
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

That's it! Your sidecar is now configured for use with Zipkin.

### Viewing Tracing Data

To view traces, connect to the Zipkin service and open the UI:

```bash
kubectl port-forward svc/zipkin 9411:9411
```

On your browser, go to ```http://localhost:9411``` and you should see the Zipkin UI.

![zipkin](/images/zipkin_ui.png)

## References
- [Zipkin for distributed tracing](https://zipkin.io/)
