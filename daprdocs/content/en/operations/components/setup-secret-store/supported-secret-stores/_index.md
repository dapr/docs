---
type: docs
title: "Supported secret stores"
linkTitle: "Supported secret stores"
weight: 30000
description: List of all the supported secret stores that can interface with Dapr
no_list: true
---

### Generic

| Name                                                              | Status                       |
|-------------------------------------------------------------------|------------------------------|
| [Local environment variables]({{< ref envvar-secret-store.md >}}) | GA (For local development)   |
| [Local file]({{< ref file-secret-store.md >}})                    | GA (For local development)   |
| [HashiCorp Vault]({{< ref hashicorp-vault.md >}})                 | Alpha                        |
| [Kubernetes secrets]({{< ref kubernetes-secret-store.md >}})      | Alpha                        |

### Amazon Web Services (AWS)

| Name                                                     | Status |
|----------------------------------------------------------|--------|
| [AWS Secrets Manager]({{< ref aws-secret-manager.md >}}) | Alpha  | 

### Google Cloud Platform (GCP)

| Name                                                     | Status |
|----------------------------------------------------------|--------|
| [GCP Secret Manager]({{< ref gcp-secret-manager.md >}})  | Alpha  | 

### Microsoft Azure

| Name                                                                                  | Status |
|---------------------------------------------------------------------------------------|--------|
| [Azure Key Vault w/ Managed Identity]({{< ref azure-keyvault-managed-identity.md >}}) | Alpha  | 
| [Azure Key Vault]({{< ref azure-keyvault.md >}})                                      | Alpha  | 
