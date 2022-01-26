---
type: docs
title: "Application and control plane configuration"
linkTitle: "Configuration"
weight: 400
description: "Change the behavior of Dapr application sidecars or globally on Dapr control plane system services"
---

Dapr configurations are settings and policies that enable you to change both the behavior of individual Dapr applications, or the global behavior of the Dapr control plane system services. For example, you can set an ACL policy on the application sidecar configuration which indicates which methods can be called from another application, or on the Dapr control plane configuration you can change the certificate renewal period for all certificates that are deployed to application sidecar instances.

Configurations are defined and deployed as a YAML file. An application configuration example is shown below, which demonstrates an example of setting a tracing endpoint for where to send the metrics information, capturing all the sample traces.

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

This configuration configures tracing for metrics recording. It can be loaded in local self-hosted mode by editing the default configuration file called `config.yaml` file in your `.dapr` directory, or by applying it to your Kubernetes cluster with kubectl/helm.

Here is an example of the Dapr control plane configuration in the `daprsystem` namespace.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprsystem
  namespace: default
spec:
  mtls:
    enabled: true
    workloadCertTTL: "24h"
    allowedClockSkew: "15m"
```

Visit [overview of Dapr configuration options]({{<ref "configuration-overview.md">}}) for a list of the configuration options.

{{% alert title="Note" color="primary" %}}
Dapr application and control plane configurations should not be confused with the configuration building block API that enables applications to retrieve key/value data from configuration store components. Read the [Configuration building block]({{< ref configuration-api-overview >}}) for more information.
{{% /alert %}}
