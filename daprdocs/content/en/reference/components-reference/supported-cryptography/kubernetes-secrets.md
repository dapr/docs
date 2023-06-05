---
type: docs
title: "Kubernetes Secrets"
linkTitle: "Kubernetes Secrets"
description: Detailed information on the Kubernetes secret cryptography component
---

## Component format

The purpose of this component is to load the Kubernetes secret named after the key name.

{{% alert title="Note" color="primary" %}}
This component uses the cryptographic engine in Dapr to perform operations. Although keys are never exposed to your application, Dapr has access to the raw key material.

{{% /alert %}}

A Dapr `crypto.yaml` component file has the following structure:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: crypto.dapr.kubernetes.secrets
  version: v1
  metadata:[]
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets, as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

For the Kubernetes secret store component, there are no metadata attributes.

## Related links
[Cryptography building block]({{< ref cryptography >}})