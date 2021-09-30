---
type: docs
weight: 10000
title: "Use the Dapr CLI in a GitHub Actions workflow"
linkTitle: "GitHub Actions"
description: "Learn how to add the Dapr CLI to your GitHub Actions to deploy and manage Dapr in your environments."
---

Dapr can be integrated with GitHub Actions via the [Dapr tool installer](https://github.com/marketplace/actions/dapr-tool-installer) available in the GitHub Marketplace. This installer adds the Dapr CLI to your workflow, allowing you to deploy, manage, and upgrade Dapr across your environments.

## Overview

The `dapr/setup-dapr` action will install the specified version of the Dapr CLI on macOS, Linux and Windows runners. Once installed, you can run any [Dapr CLI command]({{< ref cli >}}) to manage your Dapr environments.

## Example

```yaml
- name: Install Dapr
  uses: dapr/setup-dapr@v1
  with:
    version: '{{% dapr-latest-version long="true" %}}'

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