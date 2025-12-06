---
type: docs
title: "StructuredFormat"
linkTitle: "StructuredFormat"
description: Detailed information on the StructuredFormat name resolution component
---


The Structured Format name resolver provides a flexible way to resolve service names using predefined JSON or YAML format templates. It is particularly useful in scenarios where no dedicated service registry is available.

## Configuration

Name resolution is configured via the [Dapr Configuration]({{< ref configuration-overview.md >}}).

Within the configuration YAML, set the `spec.nameResolution.component` property to `"structuredformat"`, then pass configuration options in the `spec.nameResolution.configuration` dictionary.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  nameResolution:
    component: "structuredformat"
    configuration:
      structuredType: "jsonString"
      stringValue: '{"appInstances":{"myapp":[{"domain":"","ipv4":"127.0.0.1","ipv6":"","port":4433,"extendedInfo":{"hello":"world"}}]}}'
```

## Spec configuration fields

| Field   | Required | Details | Example |
|---------|----------|---------|---------|
| structuredType  | Y | Structured type: jsonString, yamlString, jsonFile, yamlFile. | jsonString |
| stringValue  | N | This field must be configured when structuredType is set to jsonString or yamlString. | {"appInstances":{"myapp":[{"domain":"","ipv4":"127.0.0.1","ipv6":"","port":4433,"extendedInfo":{"hello":"world"}}]}} |
| filePath  | N | This field must be configured when structuredType is set to jsonFile or yamlFile. | /path/to/yamlfile.yaml |

## Examples

Service ID "myapp" → "127.0.0.1:4433"

- By jsonString
```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  nameResolution:
    component: "structuredformat"
    configuration:
      structuredType: "jsonString"
      stringValue: '{"appInstances":{"myapp":[{"domain":"","ipv4":"127.0.0.1","ipv6":"","port":4433,"extendedInfo":{"hello":"world"}}]}}'
```

- By yamlString
  
```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  nameResolution:
    component: "structuredformat"
    configuration:
      structuredType: "yamlString"
      stringValue: |
        appInstances:
          myapp:
           - domain: ""
             ipv4: "127.0.0.1"
             ipv6: ""
             port: 4433
             extendedInfo:
               hello: world
```

## Notes

- Empty service IDs are not allowed and will result in an error
- Accessing a non-existent service will also result in an error
- The structured format string must be provided in the configuration
- The program selects the first available address according to the priority order: domain → IPv4 → IPv6, and appends the port to form the final target address
