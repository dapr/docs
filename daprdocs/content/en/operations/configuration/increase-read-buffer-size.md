---
type: docs
title: "How-To: Handle large http header size"
linkTitle: "HTTP header size"
weight: 6000
description: "Configure a larger http read buffer size"
---

Dapr has a limit for the read buffer size which is defaults to 4 KB, this param limits the maximum http header size. Using bigger than default 4KB size headers should set this to a proper value. Otherwise, you may encounter a `Too big request header` service invocation error. You can change this config by defining `dapr.io/http-read-buffer-size` annotation or `--dapr-http-read-buffer-size` flag.



{{< tabs Self-hosted Kubernetes >}}

{{% codetab %}}

When running in self hosted mode, use the `--dapr-http-read-buffer-size` flag to configure Dapr to use non-default request body size:

```bash
dapr run --dapr-http-read-buffer-size 16 node app.js
```
This tells Dapr to set maximum read buffer size to `16` KB.

{{% /codetab %}}


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
...
```

{{% /codetab %}}

{{< /tabs >}}

## Related links
- [Dapr Kubernetes pod annotations spec]({{< ref arguments-annotations-overview.md >}})
