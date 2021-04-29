---
type: docs
title: "Configuration"
linkTitle: "Configuration"
weight: 400
description: "Change the behavior of Dapr sidecars or globally on Dapr system services"
---

Dapr configurations are settings that enable you to change both the behavior of individual Dapr applications, or the global behavior of the system services in the Dapr control plane.

Configurations are defined and deployed as a YAML file. An application configuration example is like this:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprConfig
  namespace: default
spec:
  tracing:
    samplingRate: "1"
    zipkin:
      endpointAddress: "http://localhost:9411/api/v2/spans"
```

This configuration configures tracing for telemetry recording. It can be loaded in self-hosted mode by editing the default configuration file called `config.yaml` file in your `.dapr` directory, or by applying it to your Kubernetes cluster with kubectl/helm.

Read [this page]({{<ref "configuration-overview.md">}}) for a list of all configuration options.
