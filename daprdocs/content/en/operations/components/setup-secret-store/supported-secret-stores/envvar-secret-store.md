---
type: docs
title: "Local environment variables (for Development)"
linkTitle: "Local environment variables"
weight: 10
description: Detailed information on the local environment secret store component
---

This Dapr secret store component uses locally defined environment variable and does not use authentication.

{{% alert title="Warning" color="warning" %}}
This approach to secret management is not recommended for production environments.
{{% /alert %}}

## Setup environment variable secret store

To enable environment variable secret store, create a file with the following content in your `./components` directory:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: envvar-secret-store
  namespace: default
spec:
  type: secretstores.local.env
  metadata:
```

## Related Links
- [Secrets building block]({{< ref secrets >}})
- [How-To: Retreive a secret]({{< ref "howto-secrets.md" >}})
- [How-To: Reference secrets in Dapr components]({{< ref component-secrets.md >}})
- [Secrets API reference]({{< ref secrets_api.md >}})