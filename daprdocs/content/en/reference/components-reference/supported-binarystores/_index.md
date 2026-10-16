---
type: docs
title: "Binary Store component specs"
linkTitle: "Binary stores"
description: "The supported binary stores that interface with Dapr"
weight: 10000
aliases:
  - "/reference/components-reference/supported-binarystore/"
no_list: true
---

The following table lists the components supported by the [Binary Store building block]({{% ref "developing-applications/building-blocks/binarystore/binarystore-overview.md" %}}). For instructions on using the building block, see the [Binary Store how-to guide]({{% ref "developing-applications/building-blocks/binarystore/howto-use-binary-store.md" %}}).

| Component | Component type | Status | Description |
|-----------|----------------|--------|-------------|
| [In-memory]({{% ref "reference/components-reference/supported-binarystores/binarystore-in-memory.md" %}}) | `binarystore.in-memory` | Stable | Volatile store for local development and testing. |
| [AWS S3]({{% ref "reference/components-reference/supported-binarystores/binarystore-s3.md" %}}) | `binarystore.aws.s3` | Alpha | Amazon S3 and S3-compatible object storage. |
| [Azure Blob Storage]({{% ref "reference/components-reference/supported-binarystores/binarystore-azure-blobstorage.md" %}}) | `binarystore.azure.blobstorage` | Alpha | Azure Blob Storage containers. |
| [Azure Data Lake Storage Gen2]({{% ref "reference/components-reference/supported-binarystores/binarystore-azure-datalake.md" %}}) | `binarystore.azure.datalake` | Alpha | Azure Data Lake Storage Gen2 filesystems. |
| [Google Cloud Storage]({{% ref "reference/components-reference/supported-binarystores/binarystore-gcp-bucket.md" %}}) | `binarystore.gcp.bucket` | Alpha | Google Cloud Storage buckets. |
| [OCI Object Storage]({{% ref "reference/components-reference/supported-binarystores/binarystore-oci-objectstorage.md" %}}) | `binarystore.oci.objectstorage` | Alpha | Oracle Cloud Infrastructure Object Storage buckets. |

The Binary Store API is currently alpha. See the [component certification lifecycle]({{% ref "operations/components/certification-lifecycle.md" %}}) for details about component status.
