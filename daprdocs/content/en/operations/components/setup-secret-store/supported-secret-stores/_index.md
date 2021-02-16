---
type: docs
title: "Supported secret stores"
linkTitle: "Supported secret stores"
weight: 30000
description: The supported secret stores that interface with Dapr
no_list: true
---

### Generic

| Name                                                              | Version |Status                       |
|-------------------------------------------------------------------|---------|-----------------------------|
| [Local environment variables]({{< ref envvar-secret-store.md >}}) | v1      |GA (For local development)   |
| [Local file]({{< ref file-secret-store.md >}})                    | v1      |GA (For local development)   |
| [HashiCorp Vault]({{< ref hashicorp-vault.md >}})                 | v1      |Alpha                        |
| [Kubernetes secrets]({{< ref kubernetes-secret-store.md >}})      | v1      |Alpha                        |

### Amazon Web Services (AWS)

| Name                                                              | Version |Status                       |
|-------------------------------------------------------------------|---------|-----------------------------|
| [AWS Secrets Manager]({{< ref aws-secret-manager.md >}})          |v1       |Alpha  | 

### Google Cloud Platform (GCP)

| Name                                                              | Version |Status                       |
|-------------------------------------------------------------------|---------|-----------------------------|
| [GCP Secret Manager]({{< ref gcp-secret-manager.md >}})           |v1       |Alpha                        |

### Microsoft Azure

| Name                                                              | Version |Status                       |
|-------------------------------------------------------------------|---------|-----------------------------|
| [Azure Key Vault w/ Managed Identity]({{< ref azure-keyvault-managed-identity.md >}}) | v1       |Alpha   | 
| [Azure Key Vault]({{< ref azure-keyvault.md >}})                                      | v1       |Alpha   | 
