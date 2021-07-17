---
type: docs
title: "Local environment variables (for Development)"
linkTitle: "Local environment variables"
description: Detailed information on the local environment secret store component
aliases:
  - "/operations/components/setup-secret-store/supported-secret-stores/envvar-secret-store/"
---

This Dapr secret store component uses locally defined environment variable and does not use authentication.

{{% alert title="Warning" color="warning" %}}
This approach to secret management is not recommended for production environments.
{{% /alert %}}

## Component format

To setup local environment variables secret store create a component of type `secretstores.local.env`. Create a file with the following content in your `./components` directory:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: envvar-secret-store
  namespace: default
spec:
  type: secretstores.local.env
  version: v1
  metadata:
```
## Related Links
- [Secrets building block]({{< ref secrets >}})
- [How-To: Retrieve a secret]({{< ref "howto-secrets.md" >}})
- [How-To: Reference secrets in Dapr components]({{< ref component-secrets.md >}})
- [Secrets API reference]({{< ref secrets_api.md >}})