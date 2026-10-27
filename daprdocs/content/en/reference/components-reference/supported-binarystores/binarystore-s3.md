---
type: docs
title: "AWS S3"
linkTitle: "AWS S3"
description: "Configuration for the AWS S3 and S3-compatible Binary Store component"
aliases:
  - "/reference/components-reference/supported-binarystore/s3/"
---

The AWS S3 Binary Store stores files as objects in an Amazon S3 bucket. It can also connect to S3-compatible services such as MinIO, Ceph, or Cloudflare R2. The component is alpha and uses Dapr's built-in AWS authentication profile.

## Component format

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: s3-files
spec:
  type: binarystore.aws.s3
  version: v1
  metadata:
  - name: bucket
    value: "binary-files"
  - name: prefix
    value: "uploads"
```

Configure AWS credentials for the sidecar through the AWS authentication profile and your AWS environment or workload identity. Avoid putting access keys directly in the component manifest.

## Spec metadata fields

| Field | Required | Details | Example |
|-------|:--------:|---------|---------|
| `bucket` | Y | Name of the S3 bucket. The component needs `s3:PutObject` and `s3:DeleteObject`; it also needs `s3:GetObject` for retrieval and delete existence checks. To report a missing object as not found during deletion, grant `s3:ListBucket` as well. Without the permissions needed for the existence check, deletion may report success without determining whether the object existed. | `"binary-files"` |
| `prefix` | N | Prefix prepended to each file name. If configured, it must not start with `/`. | `"uploads"` |
| `partSize` | N | Multipart upload part size, specified as a byte count or byte-size string. Defaults to `16Mi`; must be between 5 MiB and 5 GiB. S3 limits uploads to 10,000 parts; larger parts can increase the maximum upload size (up to 50 TB) but use more memory per in-flight upload. | `"64Mi"` |
| `endpoint` | N | Custom endpoint for an S3-compatible service or emulator. Do not set this for production Amazon S3. | `"http://localhost:9000"` |
| `forcePathStyle` | N | Defaults to `false` (virtual-hosted style). Set to `true` to use path-style requests; many S3-compatible services require it. | `"true"` |
| `disableSSL` | N | Defaults to `false`. Allows connecting to a non-HTTPS endpoint. | `"true"` |
| `insecureSSL` | N | Defaults to `false`. Accepts self-signed or invalid certificates for HTTPS endpoints. This weakens transport security. | `"true"` |

Size values can be provided as a string containing the number of bytes (for example, `"16777216"`) or as a size with a unit such as `"16Mi"`.

{{% alert title="Warning" color="warning" %}}
When creating a file without overwrite enabled, the component relies on the endpoint honoring conditional writes (`If-None-Match`). AWS S3 supports this behavior, but some S3-compatible providers may ignore the condition and overwrite an existing object. Verify that your provider supports conditional writes before relying on this behavior to protect existing data.
{{% /alert %}}

## Related links

- [AWS S3 documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)
- [Basic schema for a Dapr component]({{% ref "reference/resource-specs/component-schema.md" %}})
- [How to use a Binary Store]({{% ref "developing-applications/building-blocks/binarystore/howto-use-binary-store.md" %}})
