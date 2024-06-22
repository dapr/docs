---
type: docs
title: "Contribution overview"
linkTitle: "Overview"
weight: 10
description: >
  General guidance for contributing to any of the Dapr project repositories
---

Thank you for your interest in Dapr!
This document provides the guidelines for how to contribute to the [Dapr project](https://github.com/dapr) through issues and pull requests. Contributions can also come in additional ways such as engaging with the community in community calls, commenting on issues or pull requests, and more.

See the [Dapr community repository](https://github.com/dapr/community) for more information on community engagement and community membership.

## Dapr Repository Index

 Below is a list of repositories under the Dapr organization where you can contribute:

1. **Docs**: This [repository](https://github.com/dapr/docs) contains the documentation for Dapr. You can contribute by updating existing documentation, fixing errors, or adding new content to improve user experience and clarity. Please see the specific guidelines for [docs contributions]({{< ref contributing-docs >}}).

2. **Quickstarts**: The Quickstarts [repository](https://github.com/dapr/quickstarts) provides simple, step-by-step guides to help users get started with Dapr quickly. Contributions in this repository involve creating new quickstarts, improving existing ones, or ensuring they stay up-to-date with the latest features.

3. **Runtime**: The Dapr runtime [repository](https://github.com/dapr/dapr) houses the core runtime components. Here, you can contribute by fixing bugs, optimizing performance, implementing new features, or enhancing existing ones.

4. **Components-contrib**: This [repository](https://github.com/dapr/components-contrib) hosts a collection of community-contributed components for Dapr. You can contribute by adding new components, improving existing ones, or reviewing and testing contributions from the community.

5. **SDKs**: Dapr SDKs provide libraries for various programming languages to interact with Dapr. You can contribute by improving SDK functionalities, fixing bugs, or adding support for new features. Please see the [contribution guidelines]({{< ref sdk-contrib >}}) for specific SDKs.

6. **CLI**: Dapr cli sets up Dapr on a local dev machine or a Kubernetes cluster for launching and managing Dapr instances. Contributions to the CLI repository include adding new features, fixing bugs, improving usability, and ensuring compatibility with the latest Dapr releases. Please see the [Development Guide](https://github.com/dapr/cli/blob/master/docs/development/development.md) for help in getting started with developing the Dapr cli. 

## Issues

### Issue types

In most Dapr repositories there are usually 4 types of issues:

- Issue/Bug: You've found a bug with the code, and want to report it, or create an issue to track the bug.
- Issue/Discussion: You have something on your mind, which requires input form others in a discussion, before it eventually manifests as a proposal.
- Issue/Proposal: Used for items that propose a new idea or functionality. This allows feedback from others before code is written.
- Issue/Question: Use this issue type, if you need help or have a question.

### Before submitting

Before you submit an issue, make sure you've checked the following:

1. Is it the right repository?
    - The Dapr project is distributed across multiple repositories. Check the list of [repositories](https://github.com/dapr) if you aren't sure which repo is the correct one.
1. Check for existing issues
    - Before you create a new issue, please do a search in [open issues](https://github.com/dapr/dapr/issues) to see if the issue or feature request has already been filed.
    - If you find your issue already exists, make relevant comments and add your [reaction](https://github.com/blog/2119-add-reaction-to-pull-requests-issues-and-comments). Use a reaction:
        - 👍 up-vote
        - 👎 down-vote
1. For bugs
    - Check it's not an environment issue. For example, if running on Kubernetes, make sure prerequisites are in place. (state stores, bindings, etc.)
    - You have as much data as possible. This usually comes in the form of logs and/or stacktrace. If running on Kubernetes or other environment, look at the logs of the Dapr services (runtime, operator, placement service). More details on how to get logs can be found [here]({{< ref "logs-troubleshooting.md" >}}).
1. For proposals
    - Many changes to the Dapr runtime may require changes to the API. In that case, the best place to discuss the potential feature is the main [Dapr repo](https://github.com/dapr/dapr).
    - Other examples could include bindings, state stores or entirely new components.


## Pull Requests

All contributions come through pull requests. To submit a proposed change, follow this workflow:

1. Make sure there's an issue (bug or proposal) raised, which sets the expectations for the contribution you are about to make.
1. Fork the relevant repo and create a new branch
    - Some Dapr repos support [Codespaces]({{< ref codespaces.md >}}) to provide an instant environment for you to build and test your changes.
	- See the [Developing Dapr docs](https://github.com/dapr/dapr/blob/master/docs/development/developing-dapr.md) for more information about setting up a Dapr development environment.
1. Create your change
    - Code changes require tests
1. Update relevant documentation for the change
1. Commit with [DCO sign-off]({{< ref "contributing-overview.md#developer-certificate-of-origin-signing-your-work" >}}) and open a PR
1. Wait for the CI process to finish and make sure all checks are green
1. A maintainer of the project will be assigned, and you can expect a review within a few days


#### Use work-in-progress PRs for early feedback

A good way to communicate before investing too much time is to create a "Work-in-progress" PR and share it with your reviewers. The standard way of doing this is to add a "[WIP]" prefix in your PR's title and assign the **do-not-merge** label. This will let people looking at your PR know that it is not well baked yet.

## Use of Third-party code

- Third-party code must include licenses.

## Developer Certificate of Origin: Signing your work
#### Every commit needs to be signed

The Developer Certificate of Origin (DCO) is a lightweight way for contributors to certify that they wrote or otherwise have the right to submit the code they are contributing to the project. Here is the full text of the [DCO](https://developercertificate.org/), reformatted for readability:
```
By making a contribution to this project, I certify that:
    (a) The contribution was created in whole or in part by me and I have the right to submit it under the open source license indicated in the file; or
    (b) The contribution is based upon previous work that, to the best of my knowledge, is covered under an appropriate open source license and I have the right under that license to submit that work with modifications, whether created in whole or in part by me, under the same open source license (unless I am permitted to submit under a different license), as indicated in the file; or
    (c) The contribution was provided directly to me by some other person who certified (a), (b) or (c) and I have not modified it.
    (d) I understand and agree that this project and the contribution are public and that a record of the contribution (including all personal information I submit with it, including my sign-off) is maintained indefinitely and may be redistributed consistent with this project or the open source license(s) involved.
```
Contributors sign-off that they adhere to these requirements by adding a `Signed-off-by` line to commit messages.

```
This is my commit message
Signed-off-by: Random J Developer <random@developer.example.org>
```
Git even has a `-s` command line option to append this automatically to your commit message:
```
$ git commit -s -m 'This is my commit message'
```

Each Pull Request is checked  whether or not commits in a Pull Request do contain a valid Signed-off-by line.

#### I didn't sign my commit, now what?!

No worries - You can easily replay your changes, sign them and force push them!

```
git checkout <branch-name>
git commit --amend --no-edit --signoff
git push --force-with-lease <remote-name> <branch-name>
```

## Code of Conduct

Please see the [Dapr community code of conduct](https://github.com/dapr/community/blob/master/CODE-OF-CONDUCT.md).
