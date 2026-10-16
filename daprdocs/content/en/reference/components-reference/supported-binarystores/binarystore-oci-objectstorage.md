---
type: docs
title: "OCI Object Storage"
linkTitle: "OCI Object Storage"
description: "Configuration for the OCI Object Storage Binary Store component"
aliases:
  - "/reference/components-reference/supported-binarystore/oci-objectstorage/"
---

The OCI Object Storage Binary Store stores each file as an object in the configured bucket. The component is alpha.

## Component format

The following example authenticates using an OCI configuration file:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: oci-files
spec:
  type: binarystore.oci.objectstorage
  version: v1
  metadata:
  - name: configFileAuthentication
    value: "true"
  - name: configFilePath
    value: "/home/app/.oci/config"
  - name: configFileProfile
    value: "DEFAULT"
  - name: bucketName
    value: "binary-files"
  - name: compartmentOCID
    value: "<COMPARTMENT_OCID>"
  - name: namespace
    value: "<OBJECT_STORAGE_NAMESPACE>"
```

The configuration file must be available at the specified path inside the sidecar's environment. Protect credentials in the file using your deployment's secret-management practices.

## Authentication

The component supports three authentication methods:

- **API key**: provide `region`, `userOCID`, `fingerPrint`, `privateKey`, and `tenancyOCID`.
- **Instance principal**: set `instancePrincipalAuthentication` to `"true"` and grant the compute instance's dynamic group the required Object Storage permissions.
- **Configuration file**: set `configFileAuthentication` to `"true"` and provide `configFilePath`. Optionally select a profile with `configFileProfile`; it defaults to `DEFAULT`.

Only configure one authentication method for a component. For details, see the OCI documentation for [instance principals](https://docs.oracle.com/en-us/iaas/Content/Identity/Tasks/callingservicesfrominstances.htm) and [SDK configuration files](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/sdkconfig.htm).

## Spec metadata fields

| Field | Required | Details | Example |
|-------|:--------:|---------|---------|
| `bucketName` | Y | Name of the OCI Object Storage bucket. | `"binary-files"` |
| `compartmentOCID` | Y | OCID of the compartment containing the bucket. | `"ocid1.compartment.oc1..example"` |
| `namespace` | N | OCI Object Storage namespace. If omitted, the component resolves it from the tenancy. | `"my-namespace"` |
| `prefix` | N | Prefix prepended to each file name. If configured, it must not start with `/`. | `"uploads"` |
| `region` | Y for API key authentication | OCI region where the bucket is located. | `"us-ashburn-1"` |
| `userOCID` | Y for API key authentication | OCID of the OCI user. | `"ocid1.user.oc1..example"` |
| `fingerPrint` | Y for API key authentication | Fingerprint of the API key. | `"xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx"` |
| `privateKey` | Y for API key authentication | Private key for API authentication. Treat this value as a secret. | `"<PRIVATE_KEY>"` |
| `tenancyOCID` | Y for API key authentication | OCID of the tenancy. | `"ocid1.tenancy.oc1..example"` |
| `instancePrincipalAuthentication` | Y when using instance principal | Set to `"true"` to use instance principal authentication. | `"true"` |
| `configFileAuthentication` | Y when using a configuration file | Set to `"true"` to use configuration file authentication. | `"true"` |
| `configFilePath` | Y when using a configuration file | Absolute path to the OCI configuration file. | `"/home/app/.oci/config"` |
| `configFileProfile` | N | Profile name in the configuration file. Defaults to `DEFAULT`. | `"DEFAULT"` |

## Related links

- [OCI Object Storage documentation](https://docs.oracle.com/en-us/iaas/Content/Object/Concepts/objectstorageoverview.htm)
- [Basic schema for a Dapr component]({{% ref "reference/resource-specs/component-schema.md" %}})
- [How to use a Binary Store]({{% ref "developing-applications/building-blocks/binarystore/howto-use-binary-store.md" %}})
