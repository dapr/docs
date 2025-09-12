---
type: docs
title: "How-To: Handle larger body requests"
linkTitle: "Request body size"
weight: 6000
description: "Configure http requests that are bigger than 4 MB"
---

{{% alert title="Note" color="primary" %}}
The existing flag/annotation`dapr-http-max-request-size` has been deprecated and updated to `max-body-size`.
{{% /alert %}}

By default, Dapr has a limit for the request body size, set to 4MB. You can change this for both HTTP and gRPC requests by defining:
- The `dapr.io/max-body-size` annotation, or
- The `--max-body-size` flag.

{{< tabpane text=true >}}

<!--self hosted-->
{{% tab "Self-hosted" %}}

When running in self-hosted mode, use the `--max-body-size` flag to configure Dapr to use non-default request body size:

```bash
dapr run --max-body-size 16 node app.js
```
{{% /tab %}}

<!--kubernetes-->
{{% tab "Kubernetes" %}}

On Kubernetes, set the following annotations in your deployment YAML:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: default
  labels:
    app: myapp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "myapp"
        dapr.io/app-port: "8000"
        dapr.io/max-body-size: "16"
#...
```

{{% /tab %}}

{{< /tabpane >}}

This tells Dapr to set the maximum request body size to `16` MB for both HTTP and gRPC requests.

## Related links

[Dapr Kubernetes pod annotations spec]({{% ref arguments-annotations-overview.md %}})

## Next steps

{{< button text="Install sidecar certificates" page="install-certificates.md" >}}
