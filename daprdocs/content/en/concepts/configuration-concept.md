---
type: docs
title: "Configuration"
linkTitle: "Configuration"
weight: 400
description: "Change the behavior of Dapr sidecars or globally on Dapr system services"
---

Dapr configurations are settings that enable you to change both the behavior of individual Dapr application sidecars, the the global behavior of the system services in the Dapr control plane.

Configurations are defined and deployed as a YAML file. An example would look like:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: default
  namespace: default
spec:
  mtls:
    enabled: true
    allowedClockSkew: 15m
    workloadCertTTL: 24h
  tracing:
    samplingRate: "1"
    zipkin:
      endpointAddress: "https://..."
```

This configuration configures mtls for secure communication and tracing for telemetry recording. It can be loaded in self-hosted mode by editing the default configuration file in your `.dapr` directory, or by applying it to your Kubernetes cluster with kubectl/helm.

Read [this page]({{<ref "configuration-overview.md">}}) for a list of all configuration options.
