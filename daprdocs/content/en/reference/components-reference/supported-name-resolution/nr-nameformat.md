---
type: docs
title: "Nameformat"
linkTitle: "NameFormat"
description: Detailed information on the NameFormat name resolution component
---


The Name Format name resolver provides a flexible way to resolve service names using a configurable format string with placeholders. This is useful in scenarios where you want to map service names to predictable DNS names following a specific pattern. 

Consider using this name resolver if there is no specific name resolver available for your service registry, but your service registry can expose services via internal DNS names using predictable naming conventions. 

## Configuration Format

Name resolution is configured via the [Dapr Configuration]({{< ref configuration-overview.md >}}).

Within the configuration YAML, set the `spec.nameResolution.component` property to `"nameformat"`, then pass configuration options in the `spec.nameResolution.configuration` dictionary.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  nameResolution:
    component: "nameformat"
    configuration:
      format: "service-{appid}.default.svc.cluster.local"  # Replace with your desired format pattern
```

## Spec configuration fields

| Field   | Required | Details | Example |
|---------|----------|---------|---------|
| format  | Y | The format string to use for name resolution. Must contain the `{appid}` placeholder which is replaced with the actual service name. | `"service-{appid}.default.svc.cluster.local"` |

## Examples

When configured with `format: "service-{appid}.default.svc.cluster.local"`, the resolver transforms service names as follows:

- Service ID "myapp" → "service-myapp.default.svc.cluster.local"
- Service ID "frontend" → "service-frontend.default.svc.cluster.local"


## Notes

- Empty service IDs are not allowed and results in an error.
- The format string must be provided in the configuration
- The format string must contain at least one `{appid}` placeholder 