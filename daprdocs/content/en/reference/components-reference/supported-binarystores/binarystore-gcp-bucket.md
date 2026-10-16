---
type: docs
title: "Google Cloud Storage Bucket"
linkTitle: "Google Cloud Storage"
description: "Configuration for the Google Cloud Storage Binary Store component"
aliases:
  - "/reference/components-reference/supported-binarystore/gcp-bucket/"
---

The Google Cloud Storage Binary Store stores each file as an object in the configured bucket. The component is alpha and uses Dapr's built-in GCP authentication profile.

## Component format

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: gcp-files
spec:
  type: binarystore.gcp.bucket
  version: v1
  metadata:
  - name: bucket
    value: "binary-files"
  - name: prefix
    value: "uploads"
```

Configure credentials for the sidecar using Google Cloud's [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials) or an appropriate workload identity. Do not store service account keys directly in the component manifest.

## Spec metadata fields

| Field | Required | Details | Example |
|-------|:--------:|---------|---------|
| `bucket` | Y | Name of the Google Cloud Storage bucket to use. | `"binary-files"` |
| `prefix` | N | Prefix prepended to each file name. If configured, it must not start with `/`. | `"uploads"` |
| `partSize` | N | Resumable upload chunk size, specified as a byte count or byte-size string. Defaults to `16Mi` and must be a positive multiple of 256 KiB. Larger chunks reduce request overhead but use more memory per in-flight upload. The maximum object size remains 5 TiB. | `"64Mi"` |

Size values can be provided as a string containing the number of bytes (for example, `"16777216"`) or as a size with a unit such as `"16Mi"`.

## Related links

- [Google Cloud Storage documentation](https://cloud.google.com/storage/docs)
- [Basic schema for a Dapr component]({{% ref "reference/resource-specs/component-schema.md" %}})
- [How to use a Binary Store]({{% ref "developing-applications/building-blocks/binarystore/howto-use-binary-store.md" %}})
