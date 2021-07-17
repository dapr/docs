---
type: docs
title: "Kubernetes secrets"
linkTitle: "Kubernetes secrets"
description: Detailed information on the Kubernetes secret store component
aliases:
  - "/operations/components/setup-secret-store/supported-secret-stores/kubernetes-secret-store/"
---

## Summary

Kubernetes has a built-in secrets store which Dapr components can use to retrieve secrets from. No special configuration is needed to setup the Kubernetes secrets store, and you are able to retrieve secrets from the `http://localhost:3500/v1.0/secrets/kubernetes/[my-secret]` URL. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

## Related links
- [Secrets building block]({{< ref secrets >}})
- [How-To: Retrieve a secret]({{< ref "howto-secrets.md" >}})
- [How-To: Reference secrets in Dapr components]({{< ref component-secrets.md >}})
- [Secrets API reference]({{< ref secrets_api.md >}})
