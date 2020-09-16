# Dapr Documentation Repo

This repo contains the markdown files which generate the Dapr documentation site over at https://docs.dapr.io. Head over there to read the docs and get started with Dapr! Read on to get up and running with a local environment to contribute to the docs.

## Overview

The Dapr docs are built using [Hugo](https://gohugo.io/) with the [Docsy](https://docsy.dev) theme, hosted on an [Azure static web app](https://docs.microsoft.com/en-us/azure/static-web-apps/overview).

The [daprdocs](./daprdocs) directory contains the hugo project, markdown files, and theme configurations.

## Pre-requisites

- [Hugo extended version](https://gohugo.io/getting-started/installing)
- [Node.js](https://nodejs.org/en/)

## Environment setup

1. Ensure pre-requisites are installed
1. Clone repository
1. Change to daprdocs directory: `cd daprdocs`
1. Add Docsy submodule: `git submodule add https://github.com/google/docsy.git themes/docsy`
1. Update submodules: `git submodule update --init --recursive`
1. Install npm packages: `npm install`

## Run local server
1. Make sure you're still in the daprdocs repo
1. Run `hugo server --disableFastRender`
1. Navigate to `http://localhost:1313/docs`

## Update docs
1. Create new branch
1. Commit and push changes to content
1. Submit pull request to `master`
1. Staging site will automatically get created and linked to PR to review and test