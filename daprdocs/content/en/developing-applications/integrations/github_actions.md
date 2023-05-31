---
type: docs
weight: 5000
title: "How to: Use the Dapr CLI in a GitHub Actions workflow"
linkTitle: "How to: GitHub Actions"
description: "Add the Dapr CLI to your GitHub Actions to deploy and manage Dapr in your environments."
---

Dapr can be integrated with GitHub Actions via the [Dapr tool installer](https://github.com/marketplace/actions/dapr-tool-installer) available in the GitHub Marketplace. This installer adds the Dapr CLI to your workflow, allowing you to deploy, manage, and upgrade Dapr across your environments. 

## Install the Dapr CLI via the Dapr tool installer

Copy and paste the following installer snippet into your application's YAML file:

```yaml
- name: Dapr tool installer
  uses: dapr/setup-dapr@v1
```

The [`dapr/setup-dapr` action](https://github.com/dapr/setup-dapr) will install the specified version of the Dapr CLI on macOS, Linux, and Windows runners. Once installed, you can run any [Dapr CLI command]({{< ref cli >}}) to manage your Dapr environments.

Refer to the [`action.yml` metadata file](https://github.com/dapr/setup-dapr/blob/main/action.yml) for details about all the inputs.

## Example

For example, for an application using the [Dapr extention for Azure Kubernetes Service (AKS)]({{< ref azure-kubernetes-service-extension.md >}}), your application YAML will look like the following:

```yaml
- name: Install Dapr
  uses: dapr/setup-dapr@v1
  with:
    version: '{{% dapr-latest-version long="true" %}}'

- name: Initialize Dapr
  shell: bash
  run: |
    # Get the credentials to K8s to use with dapr init
    az aks get-credentials --resource-group ${{ env.RG_NAME }} --name "${{ steps.azure-deployment.outputs.aksName }}"

    # Initialize Dapr    
    # Group the Dapr init logs so these lines can be collapsed.
    echo "::group::Initialize Dapr"
    dapr init --kubernetes --wait --runtime-version ${{ env.DAPR_VERSION }}
    echo "::endgroup::"

    dapr status --kubernetes
  working-directory: ./demos/demo3
```

## Next steps

- Learn more about [GitHub Actions](https://docs.github.com/en/actions).
- Follow the tutorial to learn how [GitHub Actions works with your Dapr container app (Azure Container Apps)](https://learn.microsoft.com/azure/container-apps/dapr-github-actions?tabs=azure-cli)