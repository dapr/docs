# Dapr documentation

If you are looking to explore the Dapr documentation, please go to the documentation website:

[**https://docs.dapr.io**](https://docs.dapr.io)

This repo contains the markdown files which generate the above website. See below for guidance on running with a local environment to contribute to the docs.

## Branch guidance

The Dapr docs handles branching differently than most code repositories. Instead of having a `master` or `main` branch, every branch is labeled to match the major and minor version of a runtime release.

The following branches are currently maintained:

| Branch | Website | Description |
|--------|---------|-------------|
| [v0.11](https://github.com/dapr/docs) (primary) | https://docs.dapr.io | Latest Dapr release documentation. Typo fixes, clarifications, and most documentation goes here.
| [v1.0-rc2](https://github.com/dapr/docs/tree/v1.0-rc2) | https://v1-rc2.docs.dapr.io/ | Latest Dapr release candidate release documentation. Doc updates that are only applicable to v1.0-rc2+ go here.
| [v1.0-rc3](https://github.com/dapr/docs/tree/v1.0-rc3) (pre-release) | https://v1-rc3.docs.dapr.io/ | Pre-release release candidate documentation. Doc updates that are only applicable to v1.0-rc3+ go here.

For more information visit the [Dapr branch structure](https://docs.dapr.io/contributing/contributing-docs/#branch-guidance) document.

## Contribution guidelines

Before making your first contribution, make sure to review the [contributing section](http://docs.dapr.io/contributing/) in the docs.

## Overview

The Dapr docs are built using [Hugo](https://gohugo.io/) with the [Docsy](https://docsy.dev) theme, hosted on an [Azure Static Web App](https://docs.microsoft.com/en-us/azure/static-web-apps/overview).

The [daprdocs](./daprdocs) directory contains the hugo project, markdown files, and theme configurations.

## Pre-requisites

- [Hugo extended version](https://gohugo.io/getting-started/installing)
- [Node.js](https://nodejs.org/en/)

## Environment setup

1. Ensure pre-requisites are installed
2. Clone this repository
```sh
git clone https://github.com/dapr/docs.git
```
3. Change to daprdocs directory: 
```sh
cd ./docs/daprdocs
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
1. Make sure you're still in the `daprdocs` directory
2. Run 
```sh
hugo server --disableFastRender
```
3. Navigate to `http://localhost:1313/`

## Update docs
1. Fork repo into your account
1. Create new branch
1. Commit and push changes to forked branch
1. Submit pull request from downstream branch to the upstream branch for the correct version you are targeting
1. Staging site will automatically get created and linked to PR to review and test

## Code of Conduct
Please refer to our [Dapr community code of conduct](https://github.com/dapr/community/blob/master/CODE-OF-CONDUCT.md).
