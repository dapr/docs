---
type: docs
title: "How-To: Handle large HTTP header size"
linkTitle: "HTTP header size"
weight: 6000
description: "Configure a larger HTTP read buffer size"
---

Dapr has a default limit of 4KB for the HTTP header read buffer size. If you're sending HTTP headers larger than the default 4KB, you may encounter a `Too big request header` service invocation error. 

You can increase the HTTP header size by using:
- The `dapr.io/http-read-buffer-size` annotation, or 
- The `--dapr-http-read-buffer-size` flag when using the CLI.

{{< tabs Self-hosted Kubernetes >}}

<!--Self-hosted-->
{{% codetab %}}

When running in self-hosted mode, use the `--dapr-http-read-buffer-size` flag to configure Dapr to use non-default http header size:

```bash
dapr run --dapr-http-read-buffer-size 16 node app.js
```
This tells Dapr to set maximum read buffer size to `16` KB.

{{% /codetab %}}

<!--Kubernetes-->
{{% codetab %}}

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
        dapr.io/http-read-buffer-size: "16"
#...
```

{{% /codetab %}}

{{< /tabs >}}

## Related links
[Dapr Kubernetes pod annotations spec]({{< ref arguments-annotations-overview.md >}})

## Next steps

{{< button text="Handle large HTTP body requests" page="increase-request-size" >}}
