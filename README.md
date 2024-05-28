# Dapr documentation

[![GitHub License](https://img.shields.io/github/license/dapr/docs?style=flat&label=License&logo=github)](https://github.com/dapr/docs/blob/v1.13/LICENSE) [![GitHub issue custom search in repo](https://img.shields.io/github/issues-search/dapr/docs?query=type%3Aissue%20is%3Aopen%20label%3A%22good%20first%20issue%22&label=Good%20first%20issues&style=flat&logo=github)](https://github.com/dapr/docs/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) [![Discord](https://img.shields.io/discord/778680217417809931?label=Discord&style=flat&logo=discord)](http://bit.ly/dapr-discord) [![YouTube Channel Views](https://img.shields.io/youtube/channel/views/UCtpSQ9BLB_3EXdWAUQYwnRA?style=flat&label=YouTube%20views&logo=youtube)](https://youtube.com/@daprdev) [![X (formerly Twitter) Follow](https://img.shields.io/twitter/follow/daprdev?logo=x&style=flat)](https://twitter.com/daprdev)

If you are looking to explore the Dapr documentation, please go to the documentation website:

[**https://docs.dapr.io**](https://docs.dapr.io)

This repo contains the markdown files which generate the above website. See below for guidance on running with a local environment to contribute to the docs.

## Branch guidance

The Dapr docs handles branching differently than most code repositories. Instead of having a `master` or `main` branch, every branch is labeled to match the major and minor version of a runtime release.

The following branches are currently maintained:

| Branch                                                       | Website                    | Description                                                                                      |
| ------------------------------------------------------------ | -------------------------- | ------------------------------------------------------------------------------------------------ |
| [v1.13](https://github.com/dapr/docs) (primary)               | https://docs.dapr.io       | Latest Dapr release documentation. Typo fixes, clarifications, and most documentation goes here. |
| [v1.14](https://github.com/dapr/docs/tree/v1.14) (pre-release) | https://v1-14.docs.dapr.io/ | Pre-release documentation. Doc updates that are only applicable to v1.14+ go here.                |

For more information visit the [Dapr branch structure](https://docs.dapr.io/contributing/docs-contrib/contributing-docs/#branch-guidance) document.

## Contribution guidelines

Before making your first contribution, make sure to review the [contributing section](http://docs.dapr.io/contributing/) in the docs.

## Overview

The Dapr docs are built using [Hugo](https://gohugo.io/) with the [Docsy](https://docsy.dev) theme, hosted on an [Azure Static Web App](https://docs.microsoft.com/azure/static-web-apps/overview).

The [daprdocs](./daprdocs) directory contains the hugo project, markdown files, and theme configurations.

## Setup with a devcontainer

This repository comes with a [devcontainer](/.devcontainer/devcontainer.json) configuration that automatically installs all the required dependencies and VSCode extensions to build and run the docs.

This devcontainer can be used to develop locally with VSCode or via GitHub Codespaces completely in the browser. Other IDEs that support [devcontainers](https://containers.dev/) can be used but won't have the extensions preconfigured and will likely have different performance characteristics.

### Pre-requisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [VSCode](https://code.visualstudio.com/download)

### Environment setup

1. [Fork](https://github.com/dapr/docs/fork) and clone this repository.

1. Open the forked repository in VS Code

```sh
code .
```

1. When prompted, click "Reopen in Container" to open the repository in the devcontainer.

Continue with the [Run local server](#run-local-server) steps.

## Setup without a devcontainer

### Pre-requisites

- [Hugo extended version](https://gohugo.io/getting-started/installing)
- [Node.js](https://nodejs.org/en/)

### Environment setup

1. Ensure pre-requisites are installed.
1. [Fork](https://github.com/dapr/docs/fork) and clone this repository.

1. Change to daprdocs directory:

```sh
cd ./daprdocs
```

4. Update submodules:

```sh
git submodule update --init --recursive
```

5. Install npm packages:

```sh
npm install
```

## Run local server

1. Make sure you're in the `daprdocs` directory
2. Run

```sh
hugo server
```

3. Navigate to `http://localhost:1313/`

## Update docs

1. Ensure you are in your forked repo
2. Create new branch
3. Commit and push changes to forked branch
4. Submit pull request from downstream branch to the upstream branch for the correct version you are targeting
5. Staging site will automatically get created and linked to PR to review and test

## Code of Conduct

Please refer to our [Dapr community code of conduct](https://github.com/dapr/community/blob/master/CODE-OF-CONDUCT.md).
