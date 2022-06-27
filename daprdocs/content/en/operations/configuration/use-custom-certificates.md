---
type: docs
title: "How-To: Use custom certificates in the Dapr sidecar"
linkTitle: "Use custom certificates"
weight: 6500
description: "Configure the Dapr sidecar container to trust custom certificates"
---

The Dapr sidecar can be configured to trust custom certificates for communicating with external services. This is useful in scenarios where a self-signed certificate needs to be trusted, e.g., using the HTTP binding, configuring an outbound proxy for the sidecar, etc. Note, both custom CA certificates and leaf certificates are supported.

{{< tabs Self-hosted Kubernetes >}}

{{% codetab %}}

When the sidecar is not running inside a container, certificates must be directly installed on the host operating system. 

When the sidecar is running as a container:
1. Certificates must be available to the sidecar container. This can be configured using volume mounts.
1. The environment variable `SSL_CERT_DIR` must be set in the sidecar container, pointing to the directory containing the certificates.
1. For Windows containers only, the container needs to run with administrator privileges to be able to install the certificates.

This is an example using Docker Compose:
```yaml
version: '3'
services:
  dapr-sidecar:
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
    # Uncomment this for Windows containers
    # user: ContainerAdministrator
```

{{% /codetab %}}


{{% codetab %}}

On Kubernetes:
1. Certificates must be available to the sidecar container using a volume mount.
1. The environment variable `SSL_CERT_DIR` must be set in the sidecar container, pointing to the directory containing the certificates.

This is an example deployment YAML:
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

**Note for Windows containers:** When using Windows containers, the sidecar container is started with admin privileges, which is required to install the certificates. This does not apply to Linux containers.

{{% /codetab %}}

{{< /tabs >}}

## Related links
- [(Kubernetes) How-to: Mount Pod volumes to the Dapr sidecar]({{< ref kubernetes-volume-mounts.md >}})
- [Dapr Kubernetes pod annotations spec]({{< ref arguments-annotations-overview.md >}})
