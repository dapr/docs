# Dapr documentation

If you are looking to explore the Dapr documentation, please go to the documentation website:

## [docs.dapr.io](https://docs.dapr.io)

This repo contains the markdown files which generate the above website. See below for guidance on running with a local environment to contribute to the docs.

## Contribution guidelines

Before making your first contribution, make sure to review the ["Contributing"](http://docs.dapr.io/contributing/) section in the docs.

## Overview

The Dapr docs are built using [Hugo](https://gohugo.io/) with the [Docsy](https://docsy.dev) theme, hosted on an [Azure static web app](https://docs.microsoft.com/en-us/azure/static-web-apps/overview).

The [daprdocs](./daprdocs) directory contains the hugo project, markdown files, and theme configurations.

## Pre-requisites

- [Hugo extended version](https://gohugo.io/getting-started/installing)
- [Node.js](https://nodejs.org/en/)

## Environment setup

1. Ensure pre-requisites are installed
1. Clone this repository
```sh
git clone https://github.com/dapr/docs.git
```
1. Change to daprdocs directory: 
```sh
cd daprdocs`
```
1. Add Docsy submodule: 
```sh
git submodule add https://github.com/google/docsy.git themes/docsy
```
1. Update submodules: 
```sh
git submodule update --init --recursive
```
1. Install npm packages: 
```sh
npm install
```

## Run local server
1. Make sure you're still in the `daprdocs` directory
1. Run 
```sh
hugo server --disableFastRender
```
1. Navigate to `http://localhost:1313/docs`

## Update docs
1. Create new branch
1. Commit and push changes to content
1. Submit pull request to `master`
1. Staging site will automatically get created and linked to PR to review and test

## Code of Conduct
Please refer to our [Dapr community code of conduct](https://github.com/dapr/community/blob/master/CODE-OF-CONDUCT.md)
