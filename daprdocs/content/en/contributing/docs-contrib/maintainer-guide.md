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
- Create a new preview branch.

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

1. Update the `dapr-latest-version.html` shortcode partial to the new minor/patch version (in this example, `1.1.0` and `1.1`).
1. Commit the staged changes and push to your branch (`release_v1.1`).
1. Open a PR from `release/v1.1` to `v1.1`.
1. Have a docs maintainer or approver review. Wait to merge the PR until release.

#### Future preview branch

##### Create preview branch

1. In GitHub UI, select the branch drop-down menu and select **View all branches**. 
1. Click **New branch**.
1. In **New branch name**, enter the preview branch version number. In this example, it would be `v1.2`.
1. Select **v1.1** as the source.
1. Click **Create new branch**.

##### Configure preview branch

1. In a terminal window, navigate to the `docs` repo.
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

1. Commit the staged changes and push to a new PR against the v1.2 branch.
1. Hold on merging the PR until after release and the other `v1.0` and `v1.1` PRs have been merged.

### Create new website for future release

Next, create a new website for the future Dapr release. To do this, you'll need to:

- Deploy an Azure Static Web App.
- Configure DNS via request from CNCF.

#### Prerequisites
- Docs maintainer status in the `dapr/docs` repo.
- Access to the active Dapr Azure Subscription with Contributor or Owner access to create resources.
- [Azure Developer CLI](https://learn.microsoft.com/azure/developer/azure-developer-cli/install-azd?tabs=winget-windows%2Cbrew-mac%2Cscript-linux&pivots=os-windows) installed on your machine.
- Your own fork of the [`dapr/docs` repo](https://github.com/dapr/docs) cloned to your machine.

#### Deploy Azure Static Web App

Deploy a new Azure Static Web App for the future Dapr release. For this example, we use v1.1 as the future release.

1. In a terminal window, navigate to the `iac/swa` folder in the `dapr/docs` directory.

   ```bash
   cd .github/iac/swa
   ```
   
1. Log into Azure Developer CLI (`azd`) using the Dapr Azure subscription.

   ```bash
   azd login
   ```

1. In the browser prompt, verify you're logging in as Dapr and complete the login.

1. In a new terminal, replace the following values with the website values you prefer.

   ```bash
   export AZURE_RESOURCE_GROUP=rg-dapr-docs-test
   export IDENTITY_RESOURCE_GROUP=rg-my-identities
   export AZURE_STATICWEBSITE_NAME=daprdocs-latest
   ```
   
1. Create a new [`azd` environment](https://learn.microsoft.com/azure/developer/azure-developer-cli/faq#what-is-an-environment-name).
 
   ```bash
   azd env new
   ```

1. When prompted, enter a new environment name. For this example, you'd name the environment something like: `dapr-docs-v1-1`. 

1. Once the environment is created, deploy the Dapr docs SWA into the new environment using the following command:

   ```bash
   azd up
   ```
   
1. When prompted, select an Azure subscription and location. Match these to the Dapr Azure subscription.

#### Configure the SWA in the Azure portal

Head over to the Dapr subscription in the [Azure portal](https://portal.azure.com) and verify that your new Dapr docs site has been deployed. 

Optionally, grant the correct minimal permissions for inbound publishing and outbound access to dependencies using the **Static Web App** > **Access control (IAM)** blade in the portal.

#### Configure DNS

1. In the Azure portal, from the new SWA you just created, naviage to **Custom domains** from the left side menu. 
1. Copy the "CNAME" value of the web app.
1. Using your own account, [submit a CNCF ticket](https://jira.linuxfoundation.org/secure/Dashboard.jspa) to create a new domain name mapped to the CNAME value you copied. For this example, to create a new domain for Dapr v1.1, you'd request to map to `v1-1.docs.dapr.io`. 

   Request resolution may take some time.

1. Once the new domain has been confirmed, return to the static web app in the portal.
1. Navigate to the **Custom domains** blade and select **+ Add**.
1. Select **Custom domain on other DNS**. 
1. Enter `v1-1.docs.dapr.io` under **Domain name**. Click **Next**.
1. Keep **Hostname record type** as `CNAME`, and copy the value of **Value**.
1. Click **Add**.
1. Navigate to `https://v1-1.docs.dapr.io` and verify a blank website loads correctly.

You can repeat these steps for any preview versions.

### On the new Dapr release date

1. Wait for all code/containers/Helm charts to be published.
1. Merge the PR from `release_v1.0` to `v1.0`. Delete the release/v1.0 branch.
1. Merge the PR from `release_v1.1` to `v1.1`. Delete the release/v1.1 branch.
1. Merge the PR from `release_v1.2` to `v1.2`. Delete the release/v1.2 branch.

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