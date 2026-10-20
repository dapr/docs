---
type: docs
title: "In-memory"
linkTitle: "In-memory"
description: "Configuration for the in-memory Binary Store component"
aliases:
  - "/reference/components-reference/supported-binarystore/in-memory/"
---

The in-memory Binary Store keeps files in the Dapr sidecar process. It is useful for local development, tests, and demos, but it is not durable: data is not written to disk, is lost when the process stops, and is not shared between sidecar instances.

## Component format

Create a component of type `binarystore.in-memory`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: local-files
spec:
  type: binarystore.in-memory
  version: v1
  metadata:
  - name: prefix
    value: "uploads"
  - name: maxSize
    value: "8Mi"
  - name: maxTotalSize
    value: "1Gi"
```

For example, an application request for `report.pdf` is stored under the component's `uploads` prefix. The prefix is optional.

## Spec metadata fields

| Field | Required | Details | Example |
|-------|:--------:|---------|---------|
| `prefix` | N | Optional prefix prepended to each file name in the store. If configured, it must not start with `/`. | `"uploads"` |
| `maxSize` | N | Maximum size of a single file, specified as a byte count or byte-size string. Defaults to `4Mi`; uploads larger than the limit are rejected. Must be greater than zero. | `"8Mi"` |
| `maxTotalSize` | N | Maximum combined size of stored files and in-flight uploads, specified as a byte count or byte-size string. Defaults to `512Mi`; uploads that exceed the limit are rejected. Replacing a file temporarily requires capacity for both the old and new content. Must be greater than zero. | `"1Gi"` |

Size values can be provided as a string containing the number of bytes (for example, `"16777216"`) or as a size with a unit such as `"16Mi"`.

## Related links

- [Basic schema for a Dapr component]({{% ref "reference/resource-specs/component-schema.md" %}})
- [Binary Store building block]({{% ref "developing-applications/building-blocks/binarystore/binarystore-overview.md" %}})
- [How to use a Binary Store]({{% ref "developing-applications/building-blocks/binarystore/howto-use-binary-store.md" %}})
