---
type: docs
title: "How-To: Handle large http body requests"
linkTitle: "HTTP request body size"
weight: 6000
description: "Configure http requests that are bigger than 4 MB"
---

By default, Dapr has a limit for the request body size, set to 4MB. You can change this by defining:
- The `dapr.io/http-max-request-size` annotation, or
- The `--dapr-http-max-request-size` flag.

{{< tabpane text=true >}}

<!--self hosted-->
{{% tab "Self-hosted" %}}

When running in self-hosted mode, use the `--dapr-http-max-request-size` flag to configure Dapr to use non-default request body size:

```bash
dapr run --dapr-http-max-request-size 16 node app.js
```
This tells Dapr to set maximum request body size to `16` MB.

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
        dapr.io/http-max-request-size: "16"
#...
```

{{% /tab %}}

{{< /tabpane >}}

## Related links

[Dapr Kubernetes pod annotations spec]({{% ref arguments-annotations-overview.md %}})

## Next steps

{{< button text="Install sidecar certificates" page="install-certificates.md" >}}
