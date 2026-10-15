---
type: docs
title: "Dapr Sentry control plane service overview"
linkTitle: "Sentry"
description: "Overview of the Dapr sentry service"
---

The Dapr Sentry service manages mTLS between services and acts as a certificate authority. It generates mTLS certificates and distributes them to any running sidecars. This allows sidecars to communicate with encrypted, mTLS traffic. For more information read the [sidecar-to-sidecar communication overview]({{% ref "security-concept#sidecar-to-sidecar-communication" %}}).

On Kubernetes, Sentry also stamps the requesting pod's [container image references into each issued workload certificate]({{% ref "security-concept#container-image-references-in-workload-certificates" %}}) as a custom X.509 extension, giving downstream systems verifiable supply-chain provenance of the software behind each workload identity.

## Self-hosted mode

The Sentry service Docker container is not started automatically as part of [`dapr init`]({{% ref self-hosted-with-docker %}}). However it can be executed manually by following the instructions for setting up [mutual TLS]({{% ref "mtls#self-hosted" %}}).


It can also be run manually as a process if you are running in [slim-init mode]({{% ref self-hosted-no-docker %}}).

<img src="/images/security-mTLS-sentry-selfhosted.png" width=1000>

## Kubernetes mode

The sentry service is deployed as part of `dapr init -k`, or via the Dapr Helm charts. For more information on running Dapr on Kubernetes, visit the [Kubernetes hosting page]({{% ref kubernetes %}}).

<img src="/images/security-mTLS-sentry-kubernetes.png" width=1000>

## Additional sentry container arguments

Use the `dapr_sentry.extraArgs` Helm value to pass extra command-line arguments to the sentry container. Use this value for sentry flags that have no dedicated Helm value. The value is a list of strings. It defaults to `[]`. Dapr appends each argument after the built-in sentry container arguments.

```yaml
dapr_sentry:
  extraArgs:
    - "--jwt-ttl=48h"
    - "--healthz-listen-address=127.0.0.1"
```

`--healthz-listen-address` (available from Dapr 1.19) sets the address the sentry healthz server listens on. It defaults to all interfaces.

## Further reading

- [Security overview]({{% ref security-concept %}})
- [Self-hosted mode]({{% ref self-hosted-with-docker %}})
- [Kubernetes mode]({{% ref kubernetes %}})
