---
type: docs
weight: 10000
title: "GitHub Actions"
linkTitle: "GitHub Actions"
description: "Deploy your application with GitHub Actions"
---

Dapr can be integrated with GitHub Actions via the [Dapr tool installer](https://github.com/marketplace/actions/dapr-tool-installer) available in the GitHub Marketplace.

## Overview

Before Dapr can be used in your Action Workflow you must install the Dapr CLI on the runner. Using the Dapr tool installer action will install the specified version of the Dapr CLI on macOS, Linux and Windows runners.

## Example

```yaml
- name: Install Dapr
  uses: dapr/setup-dapr@v1

- name: Initialize Dapr
  shell: pwsh
  run: |
    # Get the credentials to K8s to use with dapr init
    az aks get-credentials --resource-group ${{ env.RG_NAME }} --name "${{ steps.azure-deployment.outputs.aksName }}"
    
    # Initialize Dapr    
    # Group the Dapr init logs so these lines can be collapsed.
    Write-Output "::group::Initialize Dapr"
    dapr init --kubernetes --wait --runtime-version ${{ env.DAPR_VERSION }}
    Write-Output "::endgroup::"

    dapr status --kubernetes
  working-directory: ./twitter-sentiment-processor/demos/demo3
```