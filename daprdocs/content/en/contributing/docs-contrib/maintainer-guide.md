---
type: docs
title: "Maintainer guide"
linkTitle: "Maintainer guide"
weight: 20
description: "Get started as a Dapr docs maintainer and approver."
---

In this guide, you’ll learn how to perform routine Dapr docs maintainer and approver responsibilities. In order to successfully accomplish these tasks, you need either approver or maintainer status in the [`dapr/docs`](https://github.com/dapr/docs) repo. 

To learn how to contribute to Dapr docs, review the [Contributor guide]({{< ref contributing-docs.md >}}).

## Branch guidance

The Dapr docs handles branching differently than most code repositories. Instead of a `main` branch, every branch is labeled to match the major and minor version of a runtime release. 

For the full list, visit the [Docs repo](https://github.com/dapr/docs#branch-guidance).

Read the [contributor's guide]({{< ref "contributing-docs.md#branch-guidance" >}}) for more information about release branches.

## Upmerge from current release branch to the pre-release branch

As a docs approver or maintainer, you need to perform routine upmerges to keep the pre-release branch aligned with updates to the current release branch. It is recommended to upmerge the current branch into the pre-release branch on a weekly basis.

For the following steps, treat `v1.0` as the current release and `v1.1` as the upcoming release.

1. Open Visual Studio Code to the Dapr docs repo.
1. From your local repo, switch to the latest branch (`v1.0`) and synchronize changes:

   ```bash
   git pull upstream v1.0
   git push origin v1.0
   ```

1. Switch to the upcoming branch (`v1.1`) and synchronize changes:

   ```bash
   git pull upstream v1.1
   git push origin v1.1
   ```

1. Create a new branch based off of the upcoming release:

   ```bash
   git checkout -b upmerge_MM-DD
   ```

1. Open a terminal and stage a merge from the latest release into the upmerge branch:

   ```bash
   git merge --no-ff --no-commit v1.0
   ```

1. In the terminal, make sure included files look accurate. Inspect any merge conflicts in VS Code. Remove configuration changes or version information that does not need to be merged.
1. Commit the staged changes and push to the upmerge branch (`upmerge_MM-DD`).
1. Open a PR from the upmerge branch to the upcoming release branch (`v1.1`).
1. Review the PR and double check that no unintended changes were pushed to the upmerge branch.

## Release process

Dapr docs must align with features and updates included in the Dapr project release. Leading up to the Dapr release date, make sure:

- All new features or updates have been sufficiently documented and reviewed.
- Docs PRs for the upcoming release point to the release branch.

For the following steps, treat `v1.0` as the latest release and `v1.1` as the upcoming release.

The release process for docs requires the following:

- An upmerge of the latest release into the upcoming release branch
- An update to the latest and upcoming release Hugo configuration files
- A new Azure Static Web App for the next version
- A new DNS entry for the next version's website
- A new git branch for the next version

### Upmerge

First, perform a [docs upmerge](#upmerge-from-current-release-branch-to-the-pre-release-branch) from the latest release to the upcoming release branch. 

### Update Hugo Configuration

After upmerge, prepare the docs branches for the release. In two separate PRs, you need to:

- Archive the latest release.
- Bring the preview/release branch as the current, live version of the docs.

#### Latest release

These steps will prepare the latest release branch for archival.

1. Open VS Code to the Dapr docs repo.
1. Switch to the latest branch (`v1.0`) and synchronize changes:

   ```bash
   git pull upstream v1.0
   git push origin v1.0
   ```

1. Create a new branch based off of the latest release:

   ```bash
   git checkout -b release_v1.0
   ```

1. In VS Code, navigate to `/daprdocs/config.toml`.
1. Add the following TOML to the `# Versioning` section (around line 154):

   ```toml
   version_menu = "v1.0"
   version = "v1.0"
   archived_version = true
   url_latest_version = "https://docs.dapr.io"

   [[params.versions]]
     version = "v1.2 (preview)"
     url = "v1-2.docs.dapr.io"
   [[params.versions]]
     version = "v1.1 (latest)"
     url = "#"
   [[params.versions]]
     version = "v1.0"
     url = "https://v1-0.docs.dapr.io"
   ```

1. Delete `.github/workflows/website-root.yml`.
1. Commit the staged changes and push to your branch (`release_v1.0`).
1. Open a PR from `release_v1.0` to `v1.0`.
1. Have a docs maintainer or approver review. Wait to merge the PR until release.

#### Upcoming release

These steps will prepare the upcoming release branch for promotion to latest release.

1. Open VS Code to the Dapr docs repo.
1. Switch to the upcoming release branch (`v1.1`) and synchronize changes:

   ```bash
   git pull upstream v1.1
   git push origin v1.1
   ```

1. Create a new branch based off of the upcoming release:

   ```bash
   git checkout -b release_v1.1
   ```

1. In VS Code, navigate to `/daprdocs/config.toml`.
1. Update line 1 to `baseURL - https://docs.dapr.io/`.
1. Update the `# Versioning` section (around line 154) to display the correct versions and tags:

   ```toml
   # Versioning
   version_menu = "v1.1 (latest)"
   version = "v1.1"
   archived_version = false
   url_latest_version = "https://docs.dapr.io"

   [[params.versions]]
     version = "v1.2 (preview)"
     url = "v1-2.docs.dapr.io"
   [[params.versions]]
     version = "v1.1 (latest)"
     url = "#"
   [[params.versions]]
     version = "v1.0"
     url = "https://v1-0.docs.dapr.io"
   ```

1. Navigate to `.github/workflows/website-root.yml`. 
1. Update the branches which trigger the workflow:

   ```yml
   name: Azure Static Web App Root

   on:
     push:
       branches:
         - v1.1
     pull_request:
       types: [opened, synchronize, reopened, closed]
       branches:
         - v1.1
   ```

1. Navigate to `/README.md`.
1. Update the versions table:

```markdown
| Branch                                                       | Website                    | Description                                                                                      |
| ------------------------------------------------------------ | -------------------------- | ------------------------------------------------------------------------------------------------ |
| [v1.1](https://github.com/dapr/docs) (primary)               | https://docs.dapr.io       | Latest Dapr release documentation. Typo fixes, clarifications, and most documentation goes here. |
| [v1.2](https://github.com/dapr/docs/tree/v1.2) (pre-release) | https://v1-2.docs.dapr.io/ | Pre-release documentation. Doc updates that are only applicable to v1.2+ go here.                |
```

1. In VS Code, search for any `v1.0` references and replace them with `v1.1` as applicable.
1. Commit the staged changes and push to your branch (`release_v1.1`).
1. Open a PR from `release/v1.1` to `v1.1`.
1. Have a docs maintainer or approver review. Wait to merge the PR until release.

### Create new website for future release

Next, create a new website for the future Dapr release, which you point to from the latest website. To do this, you'll need to:

- Deploy an Azure Static Web App.
- Configure DNS via request from CNCF.

These steps require authentication.

#### Deploy Azure Static Web App

Deploy a new Azure Static Web App for the future Dapr release. For this example, we use v1.2 as the future release.

{{% alert title="Important" color="primary" %}}
You need Microsoft employee access to create a new Azure Static Web App.
{{% /alert %}}

1. Use Azure PIM to [elevate into the Owner role](https://eng.ms/docs/cloud-ai-platform/devdiv/devdiv-azure-service-dmitryr/azure-devex-philon/dapr/dapr/assets/azure) for the Dapr Prod subscription.
1. Navigate to the [docs-website](https://ms.portal.azure.com/#@microsoft.onmicrosoft.com/resource/subscriptions/38875a89-0178-4f27-a141-dc6fc01f183d/resourceGroups/docs-website/overview) resource group.
1. Select **+ Create** and search for **Static Web App**. Select **Create**.
1. Enter in the following information:
   - Subscription: `Dapr Prod`
   - Resource Group: `docs-website`
   - Name: `daprdocs-v1-2`
   - Hosting Plan: `Free`
   - Region: `West US 2`
   - Source: `Other`
1. Select **Review + create**, and then deploy the static web app.
1. Wait for deployment, and navigate to the new static web app resource.
1. Select **Manage deployment token** and copy the value.
1. Navigate to the docs repo **Secrets management** page under **Settings** and create a new secret named `AZURE_STATIC_WEB_APPS_V1_2`, and provide the value of the deployment token.

#### Configure DNS

{{% alert title="Important" color="primary" %}}
 This section can only be completed on a Secure Admin Workstation (SAW). If you do not have a SAW device, ask a team member with one to assist.

{{% /alert %}}

1. Ensure you are a member of the `DMAdaprweb` security group in IDWeb.
1. Navigate to [https://prod.msftdomains.com/dns/form?environment=0](https://prod.msftdomains.com/dns/form?environment=0) on a SAW
1. Enter the following details in the left-hand pane:
   - Team Owning Alias: `DMAdaprweb`
   - Business Justification/Notes: `Configuring DNS for new Dapr docs website`
   - Environment: `Internet/Public-facing`
   - Zone: `dapr.io`
   - Action: `Add`
   - Incident ID: Leave blank

1. Back in the new static web app you just deployed, navigate to the **Custom domains** blade and select **+ Add**
1. Enter `v1-2.docs.dapr.io` under **Domain name**. Click **Next**.
1. Keep **Hostname record type** as `CNAME`, and copy the value of **Value**.
1. Back in the domain portal, enter the following information in the main pane:
   - Name: `v1-2.docs`
   - Type: `CNAME`
   - Data: Value you just copied from the static web app

1. Click **Submit** in the top right corner.
1. Wait for two emails:
   - One saying your request was received.
   - One saying the request was completed.
1. Back in the Azure Portal, click **Add**. You may need to click a couple times to account for DNS delay.
1. A TLS certificate is now generated for you and the DNS record is saved. This may take 2-3 minutes.
1. Navigate to `https://v1-2.docs.dapr.io` and verify a blank website loads correctly.

### Configure future website branch

1. Open VS Code to the Dapr docs repo.
1. Switch to the upcoming release branch (`v1.1`) and synchronize changes:

   ```bash
   git pull upstream v1.1
   git push origin v1.1
   ```

1. Create a new branch based on `v1.1` and name it `v1.2`:

  ```bash
  git checkout -b release_v1.1
  ```

1. Rename `.github/workflows/website-v1-1.yml` to `.github/workflows/website-v1-2.yml`.
1. Open `.github/workflows/website-v1-2.yml` in VS Code and update the name, trigger, and deployment target to 1.2:

   ```yml
   name: Azure Static Web App v1.2
   
   on:
     push:
       branches:
         - v1.2
     pull_request:
       types: [opened, synchronize, reopened, closed]
       branches:
         - v1.2
   
    ...
   
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_V1_2 }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
   
    ...
   
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_V1_2 }}
          skip_deploy_on_missing_secrets: true
   ```

1. Navigate to `daprdocs/config.toml` and update the `baseURL` to point to the new preview website:

   ```toml
   baseURL = "https://v1-2.docs.dapr.io"
   ```

1. Update the `# GitHub Information` and `# Versioning` sections (around line 148) to display the correct versions and tags:

   ```toml
   # GitHub Information
   github_repo = "https://github.com/dapr/docs"
   github_project_repo = "https://github.com/dapr/dapr"
   github_subdir = "daprdocs"
   github_branch = "v1.2"
   
   # Versioning
   version_menu = "v1.2 (preview)"
   version = "v1.2"
   archived_version = false
   url_latest_version = "https://docs.dapr.io"
   
   [[params.versions]]
     version = "v1.2 (preview)"
     url = "#"
   [[params.versions]]
     version = "v1.1 (latest)"
     url = "https://docs.dapr.io"
   [[params.versions]]
     version = "v1.0"
     url = "https://v1-0.docs.dapr.io"
   ```

1. Commit the staged changes and push to the v1.2 branch.
1. Navigate to the [docs Actions page](https://github.com/dapr/docs/actions) and make sure the build & release successfully completed.
1. Navigate to the new `https://v1-2.docs.dapr.io` website and verify that the new version is displayed.

### On the new Dapr release date

1. Wait for all code/containers/Helm charts to be published.
1. Merge the the PR from `release_v1.0` to `v1.0`. Delete the release/v1.0 branch.
1. Merge the the PR from `release_v1.1` to `v1.1`. Delete the release/v1.1 branch.

Congrats on the new docs release! 🚀 🎉 🎈

## Pull in SDK doc updates

SDK docs live in each of the SDK repos. Changes made to the SDK docs are pushed to the relevant SDK repo. For example, to update the Go SDK docs, you push changes to the `dapr/go-sdk` repo. Until you pull the latest `dapr/go-sdk` commit into the `dapr/docs` current version branch, your Go SDK docs updates won't be reflected on the Dapr docs site. 

To bring updates to the SDK docs live to the Dapr docs site, you need to perform a straightforward `git pull`. This example refers to the Go SDK, but applies to all SDKs.

1. Pull the latest upstream into your local `dapr/docs` version branch.

1. Change into the root of the `dapr/docs` directory.

1. Change into the Go SDK repo. This command takes you out of the `dapr/docs` context and into the `dapr/go-sdk` context.

   ```bash
   cd sdkdocs/go
   ```

1. Switch to the `main` branch in `dapr/go-sdk`.

   ```bash
   git checkout main
   ```

1. Pull the latest Go SDK commit.

   ```bash
   git pull upstream main
   ```

1. Change into the `dapr/docs` context to commit, push, and create a PR.

## Next steps

For guidance on contributing to Dapr docs, read the [Contributor Guide]({{< ref contributing-docs.md >}}).