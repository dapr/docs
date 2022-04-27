---
type: docs
title: "Dapr Sentry control plane service overview"
linkTitle: "Sentry"
description: "Overview of the Dapr sentry service"
---

The Dapr Sentry service manages mTLS between services and acts as a certificate authority. It generates mTLS certificates and distributes them to any running sidecars. This allows sidecars to communicate with encrypted, mTLS traffic. For more information read the [sidecar-to-sidecar communication overview]({{< ref "security-concept.md#sidecar-to-sidecar-communication" >}}). 

## Self-hosted mode

The Sentry service Docker container is not started automatically as part of [`dapr init`]({{< ref self-hosted-with-docker.md >}}). However it can be executed manually by following the instructions for setting up [mutual TLS]({{< ref "mtls.md#self-hosted" >}}).


It can also be run manually as a process if you are running in [slim-init mode]({{< ref self-hosted-no-docker.md >}}).

<img src="/images/security-mTLS-sentry-selfhosted.png" width=1000>

## Kubernetes mode

The sentry service is deployed as part of `dapr init -k`, or via the Dapr Helm charts. For more information on running Dapr on Kubernetes, visit the [Kubernetes hosting page]({{< ref kubernetes >}}).

<img src="/images/security-mTLS-sentry-kubernetes.png" width=1000>

## Further reading

- [Security overview]({{< ref security-concept.md >}})
- [Self-hosted mode]({{< ref self-hosted-with-docker.md >}})
- [Kubernetes mode]({{< ref kubernetes >}})
