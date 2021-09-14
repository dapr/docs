---
type: docs
title: "Contributing with GitHub Codespaces"
linkTitle: "GitHub Codespaces"
weight: 2500
description: "How to work with Dapr repos in GitHub Codespaces"
aliases:
  - "/developing-applications/ides/codespaces/"
---

[GitHub Codespaces](https://github.com/features/codespaces) are the easiest way to get up and running for contributing to a Dapr repo. In as little as a single click, you can have an environment with all of the prerequisites ready to go in your browser.

## Features

- **Click and Run**: Get a dedicated and sandboxed environment with all of the required frameworks and packages ready to go.
- **Usage-based Billing**: Only pay for the time you spend developing in the Codespace. Environments are spun down automatically when not in use.
- **Portable**: Run in your browser or in Visual Studio Code

## Open a Dapr repo in a Codespace

To open a Dapr repository in a Codespace simply select "Code" from the repo homepage and "Open with Codespaces":

<img src="/images/codespaces-create.png" alt="Screenshot of creating a Dapr Codespace" width="300">

If you haven't already forked the repo, creating the Codespace will also create a fork for you and use it inside the Codespace.

### Supported repos

- [Dapr](https://github.com/dapr/dapr)
- [Components-contrib](https://github.com/dapr/components-contrib)
- [Python SDK](https://github.com/dapr/python-sdk)

### Developing Dapr Components in a Codespace

Developing a new Dapr component requires working with both the [components-contrib](https://github.com/dapr/components-contrib) and [dapr](https://github.com/dapr/dapr) repos together under the `$GOPATH` tree for testing purposes. To facilitate this, the `/go/src/github.com/dapr` folder in the components-contrib Codespace will already be set up with your fork of components-contrib, and a clone of the dapr repo as described in the [component development documentation](https://github.com/dapr/components-contrib/blob/master/docs/developing-component.md). A few things to note in this configuration:

- The components-contrib and dapr repos only define Codespaces for the Linux amd64 environment at the moment.
- The `/go/src/github.com/dapr/components-contrib` folder is a soft link to Codespace's default `/workspace/components-contrib` folder, so changes in one will be automatically reflected in the other.
- Since the `/go/src/github.com/dapr/dapr` folder uses a clone of the official dapr repo rather than a fork, you will not be able to make a pull request from changes made in that folder directly. You can use the dapr Codespace separately for that PR, or if you would like to use the same Codespace for the dapr changes as well, you should remap the dapr repo origin to your fork in the components-contrib Codespace. For example, to use a dapr fork under `my-git-alias`:

```bash
cd /go/src/github.com/dapr/dapr
git remote set-url origin https://github.com/my-git-alias/dapr
git fetch
git reset --hard
```

## Related links
- [GitHub documentation](https://docs.github.com/en/github/developing-online-with-codespaces/about-codespaces)
