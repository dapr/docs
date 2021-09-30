---
type: docs
title: "Secret store component specs"
linkTitle: "Secret stores"
weight: 4000
description: The supported secret stores that interface with Dapr
aliases:
  - "/operations/components/setup-secret-store/supported-secret-stores/"
no_list: true
---

Table captions:

> `Status`: [Component certification]({{<ref "certification-lifecycle.md">}}) status
  - [Alpha]({{<ref "certification-lifecycle.md#alpha">}})
  - [Beta]({{<ref "certification-lifecycle.md#beta">}})
  - [GA]({{<ref "certification-lifecycle.md#general-availability-ga">}})
> `Since`: defines from which Dapr Runtime version, the component is in the current status

> `Component version`: defines the version of the component

### Generic

| Name                                                              | Status                       | Component version | Since |
|-------------------------------------------------------------------|------------------------------| ---------------- |-- |
| [Local environment variables]({{< ref envvar-secret-store.md >}}) | Beta   | v1 | 1.0 |
| [Local file]({{< ref file-secret-store.md >}})                    | Beta   | v1 | 1.0 |
| [HashiCorp Vault]({{< ref hashicorp-vault.md >}})                 | Alpha                        | v1 | 1.0 |
| [Kubernetes secrets]({{< ref kubernetes-secret-store.md >}})      | GA                        | v1 | 1.0 |

### Amazon Web Services (AWS)

| Name                                                     | Status | Component version | Since |
|----------------------------------------------------------|--------| -------------------| ---- |
| [AWS Secrets Manager]({{< ref aws-secret-manager.md >}}) | Alpha  | v1 | 1.0 |
| [AWS SSM Parameter Store]({{< ref aws-parameter-store.md >}}) | Alpha  | v1 | 1.1 |

### Google Cloud Platform (GCP)

| Name                                                     | Status | Component version | Since |
|----------------------------------------------------------|--------| ---- | ------------|
| [GCP Secret Manager]({{< ref gcp-secret-manager.md >}})  | Alpha  | v1 | 1.0 |

### Microsoft Azure

| Name                                                                                  | Status | Component version | Since |
|---------------------------------------------------------------------------------------|--------| ---- |--------------|
| [Azure Key Vault]({{< ref azure-keyvault.md >}})                                      | GA  | v1 | 1.0 |
