---
type: docs
title: "How-To: Install certificates in the Dapr sidecar"
linkTitle: "Install sidecar certificates"
weight: 6500
description: "Configure the Dapr sidecar container to trust certificates"
---

The Dapr sidecar can be configured to trust certificates for communicating with external services. This is useful in scenarios where a self-signed certificate needs to be trusted. For example, using an HTTP binding or configuring an outbound proxy for the sidecar. Both certificate authority (CA) certificates and leaf certificates are supported.

{{< tabs Self-hosted Kubernetes >}}

{{% codetab %}}

When the sidecar is not running inside a container, certificates must be directly installed on the host operating system. 

When the sidecar is running as a container:
1. Certificates must be available to the sidecar container. This can be configured using volume mounts.
1. The environment variable `SSL_CERT_DIR` must be set in the sidecar container, pointing to the directory containing the certificates.
1. For Windows containers, the container needs to run with administrator privileges to be able to install the certificates.

Below is an example that uses Docker Compose to install certificates (present locally in the `./certificates` directory) in the sidecar container:
```yaml
version: '3'
services:
  dapr-sidecar:
    image: "daprio/daprd:edge" # dapr version must be at least v1.8
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
    # Uncomment the line below for Windows containers
    # user: ContainerAdministrator
```

{{% /codetab %}}


{{% codetab %}}

On Kubernetes:
1. Certificates must be available to the sidecar container using a volume mount.
1. The environment variable `SSL_CERT_DIR` must be set in the sidecar container, pointing to the directory containing the certificates.

The YAML below is an example of a deployment that attaches a pod volume to the sidecar, and sets `SSL_CERT_DIR` to install the certificates.
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
        dapr.io/volume-mounts: "certificates-vol:/tmp/certificates" # (STEP 1) Mount the certificates folder to the sidecar container
        dapr.io/env: "SSL_CERT_DIR=/tmp/certificates" # (STEP 2) Set the environment variable to the path of the certificates folder
    spec:
      volumes:
        - name: certificates-vol
          hostPath:
            path: /certificates
...
```

**Note**: When using Windows containers, the sidecar container is started with admin privileges, which is required to install the certificates. This does not apply to Linux containers.

{{% /codetab %}}

{{< /tabs >}}

<hr/>

All the certificates in the directory pointed by `SSL_CERT_DIR` are installed.

1. On Linux containers, all the certificate extensions supported by OpenSSL are supported. For more information, see https://www.openssl.org/docs/man1.1.1/man1/openssl-rehash.html
1. On Windows container, all the certificate extensions supported by certoc.exe are supported. For more information, see certoc.exe present in [Windows Server Core](https://hub.docker.com/_/microsoft-windows-servercore)

## Example

Watch the demo on using installing SSL certificates and securely using the HTTP binding in community call 64:

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/M0VM7GlphAU?start=800" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>


## Related links
- [HTTP binding spec]({{< ref http.md >}})
- [(Kubernetes) How-to: Mount Pod volumes to the Dapr sidecar]({{< ref kubernetes-volume-mounts.md >}})
- [Dapr Kubernetes pod annotations spec]({{< ref arguments-annotations-overview.md >}})
