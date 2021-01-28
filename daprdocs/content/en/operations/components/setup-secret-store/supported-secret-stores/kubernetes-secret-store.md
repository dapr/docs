---
type: docs
title: "Kubernetes secrets"
linkTitle: "Kubernetes secrets"
weight: 30
description: Detailed information on the Kubernetes secret store component
---

## Summary

Kubernetes has a built-in state store which Dapr components can use to fetch secrets from. No special configuration is needed to setup the Kubernetes state store, and you are able to retreive secrets from the `http://localhost:3500/v1.0/secrets/kubernetes/[my-secret]` URL.

## Related links
- [Secrets building block]({{< ref secrets >}})
- [How-To: Retreive a secret]({{< ref "howto-secrets.md" >}})
- [How-To: Reference secrets in Dapr components]({{< ref component-secrets.md >}})
- [Secrets API reference]({{< ref secrets_api.md >}})