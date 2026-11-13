---
type: docs
title: "Local Storage"
linkTitle: "Local Storage"
description: "Configuration for the Local Storage Binary Store component"
aliases:
  - "/reference/components-reference/supported-binarystore/localstorage/"
---

The Local Storage Binary Store stores files on the local filesystem beneath a configured root directory. It is useful for local development and testing when files need to persist across sidecar restarts, unlike the in-memory component. The component is alpha and supports Windows, Linux, and macOS.

## Component format

Create a component of type `binarystore.localstorage`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: local-files
spec:
  type: binarystore.localstorage
  version: v1
  metadata:
  - name: rootPath
    value: "./binary-files"
  - name: prefix
    value: "uploads"
  - name: maxSize
    value: "8Mi"
```

With this configuration, a file named `images/profile.png` is stored at `binary-files/uploads/images/profile.png`, relative to the sidecar process's working directory. Nested directories are created automatically. The prefix is optional.

## Spec metadata fields

| Field | Required | Details | Example |
|-------|:--------:|---------|---------|
| `rootPath` | Y | Root directory beneath which files are stored. Created if it does not exist. Relative paths are resolved against the sidecar process's working directory. Initialization preserves existing files. Paths that overlap `/proc`, `/sys`, `/boot`, or `/var/run/secrets`, including their symlink-resolved locations, are rejected. This includes ancestors and descendants of those locations. | `"./binary-files"` |
| `prefix` | N | Optional prefix prepended to each file name. Slashes map to nested directories beneath `rootPath`. Must be a relative path without leading or trailing slashes, empty segments, `.` or `..` segments, or backslashes. | `"uploads"` |
| `maxSize` | N | Maximum size of a single file, specified as a byte count or byte-size string. Defaults to `0` (unlimited). Must not be negative. Uploads larger than the limit are rejected without publishing the new content; an existing file is preserved when an overwrite fails. | `"8Mi"` |

Size values can be provided as a string containing the number of bytes (for example, `"8388608"`) or as a size with a unit such as `"8Mi"`.

The sidecar process needs permission to create, read, write, and delete files and directories beneath `rootPath`. In a container, the path refers to the sidecar's filesystem. Mount a persistent volume at that path if files must survive container replacement.

## Storage behavior and limitations

Uploads are streamed to a temporary file in the destination directory and published only after the upload completes. Create-only uploads use a hard link to avoid replacing an existing file; overwrites use an atomic rename. The underlying filesystem must support these operations. Allow enough free disk space for both the existing file and the staged replacement during an overwrite.

There is no total store capacity limit setting. Monitor available disk space separately from the per-file `maxSize` limit. Deleting a file leaves its parent directories intact.

{{% alert title="Warning" color="warning" %}}
Each root directory must be exclusively owned by one process. Writes and deletes to the same path are serialized across component instances within that process, but concurrent access by other sidecars or external writers is unsupported. Do not share a root directory between sidecars, even when they use different prefixes.
{{% /alert %}}

Initialization does not remove temporary staging files left by a process that stopped mid-upload. These files have names beginning with `.dapr-upload-` and require operator cleanup. Do not delete files based only on their names or modification times: those attributes cannot reliably distinguish abandoned staging files from stored objects or active uploads. Stop writers and verify that a file is abandoned before removing it.

## Related links

- [Basic schema for a Dapr component]({{% ref "reference/resource-specs/component-schema.md" %}})
- [Binary Store building block]({{% ref "developing-applications/building-blocks/binarystore/binarystore-overview.md" %}})
- [How to use a Binary Store]({{% ref "developing-applications/building-blocks/binarystore/howto-use-binary-store.md" %}})
