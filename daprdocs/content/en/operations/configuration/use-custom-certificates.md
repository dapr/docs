---
type: docs
title: "How-To: Use custom certificates in the Dapr sidecar"
linkTitle: "Use custom certificates"
weight: 7000
description: "Configure the Dapr sidecar container to trust custom certificates"
---

The Dapr sidecar can be configured to trust custom certificates for communicating with external services. This can be useful in scenarios where a self-signed certificate needs to be trusted, e.g., using the HTTP binding, configuring an outbound proxy for the sidecar, etc.

{{< tabs Self-hosted Kubernetes >}}

{{% codetab %}}

When the sidecar is running as a process, the certificates must be installed on the host operating system. 

When the sidecar is running as a container,
1. The certificates must be available to the sidecar container. This can be done by mounting a volume to the sidecar container.
1. Set the environment variable `SSL_CERT_DIR` in the sidecar container to the path of the directory containing the certificates.
1. Additionally, if you are using Windows container, the container needs to be run with administrator privileges. This is required by the Windows entrypoint script to install the certificates.

This is an example using Docker compose:
```yaml
version: '3'
services:
  # app container
  # ...

  # sidecar container
  my-dapr:
    image: "daprio/daprd:edge"
    command: [
      "./daprd",
     "-app-id", "myapp",
     "-app-port", "3000",
     ]
    volumes:
        - "./components/:/components"
        - "./certificates:/certificates" # (STEP 1) Mount the certificates folder to the sidecar container
    environment:
      - "SSL_CERT_DIR=/certificates" # (STEP 2) Set the environment variable to the path of the certificates folder
    # user: ContainerAdministrator # (STEP 3) Optional, required for Windows containers
    depends_on:
      - myapp
    network_mode: "service:myapp"
```

{{% /codetab %}}


{{% codetab %}}

On Kubernetes, 
1. The certificates must be available to the sidecar container using a volume mount.
1. Set the environment variable `SSL_CERT_DIR` in the sidecar container to the path of the directory containing the certificates.

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
        dapr.io/volume-mounts-rw: "certificates-vol:/tmp/certificates" # (STEP 1) Mount the certificates folder to the sidecar container
        dapr.io/env: "SSL_CERT_DIR=/tmp/certificates" # (STEP 2) Set the environment variable to the path of the certificates folder
    spec:
      volumes:
        - name: certificates-vol
          hostPath:
            path: /certificates
...
```

Note, when using Windows container, the sidecar injector injects the sidecar with admin privileges. This is required by the Windows entrypoint script to install the certificates.

{{% /codetab %}}

{{< /tabs >}}

## Related links
- [(Kubernetes) How-to: Mount Pod volumes to the Dapr sidecar]({{< ref kubernetes-volume-mounts.md >}})
- [Dapr Kubernetes pod annotations spec]({{< ref arguments-annotations-overview.md >}})
