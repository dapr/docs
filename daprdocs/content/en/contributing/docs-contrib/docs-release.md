---
type: docs
title: "How to: Release a new version of Dapr docs"
linkTitle: "Release new docs version"
weight: 20
description: "Release Dapr docs alongside new Dapr versions."
---

Dapr docs must align with features and updates included in the Dapr project release. Leading up to the Dapr release date, make sure:

- All new features or updates have been sufficiently documented and reviewed.
- Docs PRs for the upcoming release point to the release branch.

For these steps, we will treat `v1.0` as the latest release and `v1.1` as the upcoming release.

## Release process overview

The release process for docs requires the following:

- An upmerge of the latest release into the upcoming release branch
- An update to the latest and upcoming release Hugo configuration files
- A new Azure Static Web App for the next version
- A new DNS entry for the next version's website
- A new git branch for the next version

This guide focuses on the non-Microsoft parts of the process.

## Upmerge

First, perform a docs upmerge from the latest release to the upcoming release branch. 

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
1. Have a docs maintainer or approver review and merge the PR.

## Update Hugo Configuration

After upmerge, prepare the docs branches for the release. In two separate PRs, you need to:

- Archive the latest release.
- Bring the preview/release branch as the current, live version of the docs.

### Latest release

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

### Upcoming release

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

## Create new website for future release

This section can only be completed with an Azure PIM. Ask a docs maintainer to assist.

## Configure DNS

This section can only be completed on a Secure Admin Workstation (SAW). Ask a docs maintainer to assist.

## Configure future website branch

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

## Release

1. Wait for all code/containers/Helm charts to be published.
1. Merge the the PR from `release_v1.0` to `v1.0`. Delete the release/v1.0 branch.
1. Merge the the PR from `release_v1.1` to `v1.1`. Delete the release/v1.1 branch.

🚀 🎉 🎈