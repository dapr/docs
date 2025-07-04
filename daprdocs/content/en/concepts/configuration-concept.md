---
type: docs
title: "Application and control plane configuration"
linkTitle: "Configuration"
weight: 400
description: "Change the behavior of Dapr application sidecars or globally on Dapr control plane system services"
---

With Dapr configurations, you use settings and policies to change:
- The behavior of individual Dapr applications
- The global behavior of the Dapr control plane system services

For example, set a sampling rate policy on the application sidecar configuration to indicate which methods can be called from another application. If you set a policy on the Dapr control plane configuration, you can change the certificate renewal period for all certificates that are deployed to application sidecar instances.

Configurations are defined and deployed as a YAML file. In the following application configuration example, a tracing endpoint is set for where to send the metrics information, capturing all the sample traces.

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

The above YAML configures tracing for metrics recording. You can load it in local self-hosted mode by either:
- Editing the default configuration file called `config.yaml` file in your `.dapr` directory, or 
- Applying it to your Kubernetes cluster with `kubectl/helm`.

The following example shows the Dapr control plane configuration called `daprsystem` in the `dapr-system` namespace.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprsystem
  namespace: dapr-system
spec:
  mtls:
    enabled: true
    workloadCertTTL: "24h"
    allowedClockSkew: "15m"
```

By default, there is a single configuration file called `daprsystem` installed with the Dapr control plane system services. This configuration file applies global control plane settings and is set up when Dapr is deployed to Kubernetes.

[Learn more about configuration options.]({{< ref "configuration-overview.md" >}})

{{% alert title="Important" color="warning" %}}
Dapr application and control plane configurations should not be confused with the [configuration building block API]({{< ref configuration-api-overview >}}), which enables applications to retrieve key/value data from configuration store components. 
{{% /alert %}}

## Next steps

{{< button text="Learn more about configuration" page="configuration-overview" >}}