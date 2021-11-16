---
type: docs
title: "Configuration"
linkTitle: "Configuration"
weight: 400
description: "Change the behavior of Dapr sidecars or globally on Dapr system services"
---

Dapr configurations are settings and policies that enable you to change both the behavior of individual Dapr applications, or the global behavior of the system services in the Dapr control plane. For example you can set an ACL policy using configuration which indicates which methods can be called on the application, or you can change the certificate renewal period on the Dapr control plane configuration.

Configurations are defined and deployed as a YAML file. An application configuration example is shown below, which demonstrates an example of setting a tracing endpoint to send metrics information to capturing all the sample traces.

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

Visit [overview of Dapr configuration options]({{<ref "configuration-overview.md">}}) for a list of the configuration options.

{{% alert title="Note" color="primary" %}}
Dapr sidecar and control plane configurations should not be confused with the configuration building block API that enables applications to retrieve key/value data from configuration store components. Read the [Configuration building block]({{< ref configuration-api-overview >}}) for more information.
{{% /alert %}}
