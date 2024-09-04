---
type: docs
title: "How-To: Configure Dapr to use gRPC"
linkTitle: "Use gRPC interface"
weight: 5000
description: "Configure Dapr to use gRPC for low-latency, high performance scenarios"
---

Dapr implements both an HTTP and a gRPC API for local calls. gRPC is useful for low-latency, high performance scenarios and has language integration using the proto clients. [You can see the full list of auto-generated clients (Dapr SDKs)]({{< ref sdks >}}).

The Dapr runtime implements a [proto service](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/dapr.proto) that apps can communicate with via gRPC.

Not only can you call Dapr via gRPC, Dapr can communicate with an application via gRPC. To do that, the app needs to host a gRPC server and implement the [Dapr `appcallback` service](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/appcallback.proto)

## Configuring Dapr to communicate with an app via gRPC

{{< tabs "Self-hosted" Kubernetes >}}

 <!-- Self hosted -->
{{% codetab %}}

When running in self hosted mode, use the `--app-protocol` flag to tell Dapr to use gRPC to talk to the app:

```bash
dapr run --app-protocol grpc --app-port 5005 node app.js
```
This tells Dapr to communicate with your app via gRPC over port `5005`.

{{% /codetab %}}

 <!-- Kubernetes -->
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
        dapr.io/app-protocol: "grpc"
        dapr.io/app-port: "5005"
#...
```

{{% /codetab %}}

{{< /tabs >}}

## Next steps

{{< button text="Handle large HTTP header sizes" page="increase-read-buffer-size" >}}