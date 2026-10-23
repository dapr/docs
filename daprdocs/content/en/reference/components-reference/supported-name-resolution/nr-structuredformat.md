---
type: docs
title: "StructuredFormat"
linkTitle: "StructuredFormat"
description: Detailed information on the StructuredFormat name resolution component
---


The **Structured Format** name resolver enables you to explicitly define service instances using structured configuration in **JSON or YAML**, either as inline strings or external files. It is designed for scenarios where service topology is **static and known in advance**, such as:

- Local development and testing
- Integration or end-to-end test environments
- Edge deployments

## Configuration format

Name resolution is configured via the [Dapr Configuration]({{< ref configuration-overview.md >}}).

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  nameResolution:
    component: "structuredformat"
    configuration:
      structuredType: "json"  # or "yaml", "jsonFile", "yamlFile"
      stringValue: '{"appInstances":{"myapp":[{"ipv4":"127.0.0.1","port":4433}]}}'
```

## Spec configuration fields

| Field            | Required? | Description                                                                 | Example |
|------------------|-----------|-----------------------------------------------------------------------------|---------|
| `structuredType` | Yes       | Format and source type. Must be one of: `json`, `yaml`, `jsonFile`, `yamlFile` | `json` |
| `stringValue`    | Conditional | Required when `structuredType` is `json` or `yaml`                         | `{"appInstances":{"myapp":[{"ipv4":"127.0.0.1","port":4433}]}}` |
| `filePath`       | Conditional | Required when `structuredType` is `jsonFile` or `yamlFile`                 | `/etc/dapr/services.yaml` |

> **Important**: Only one of `stringValue` or `filePath` should be provided, based on `structuredType`.

## `appInstances` Schema

The configuration must contain a top-level `appInstances` object that maps **service IDs** to **lists of address instances**.

### Supported Address Fields

| Field    | Type   | Required? | Description |
|----------|--------|-----------|-------------|
| `domain` | string | No        | Hostname or FQDN (e.g., `"api.example.com"`). Highest priority. |
| `ipv4`   | string | No        | IPv4 address in dotted-decimal format (e.g., `"192.168.1.10"`). |
| `ipv6`   | string | No        | Unbracketed IPv6 address (e.g., `"::1"`, `"2001:db8::1"`). |
| `port`   | int    | **Yes**   | TCP port number (**must be 1–65535**). |

> **Notes**:
> - Service IDs must be non-empty strings.
> - **At least one** of `domain`, `ipv4`, or `ipv6` must be non-empty per instance.
> - Invalid or missing ports will cause initialization to fail.

## Address Selection Logic

For each instance, the resolver selects the **first non-empty address** in this priority order:

1. `domain` → e.g., `github.com`  
2. `ipv4` → e.g., `192.168.1.10`  
3. `ipv6` → e.g., `::1`

The final target address is formatted as:

- `host:port` for domain/IPv4  
- `[ipv6]:port` for IPv6 (automatically bracketed)

If a service has **multiple instances**, one is selected **uniformly at random** on each call.

## Examples

### Inline JSON
```yaml
configuration:
  structuredType: "json"
  stringValue: '{"appInstances":{"myapp":[{"ipv4":"127.0.0.1","port":4433}]}}'
```
→ Resolves `"myapp"` to `127.0.0.1:4433`

### Inline YAML (multi-line)
```yaml
configuration:
  structuredType: "yaml"
  stringValue: |
    appInstances:
      myapp:
        - domain: "example.com"
          port: 80
        - ipv6: "::1"
          port: 8080
```
→ Possible results: `example.com:80` or `[::1]:8080` (chosen randomly)

### From External File
```yaml
configuration:
  structuredType: "yamlFile"
  filePath: "/etc/dapr/services.yaml"
```

With `/etc/dapr/services.yaml`:
```yaml
appInstances:
  backend:
    - ipv4: "10.0.0.5"
      port: 3000
```
→ Resolves `"backend"` to `10.0.0.5:3000`
