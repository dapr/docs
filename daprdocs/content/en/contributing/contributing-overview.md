---
type: docs
title: "Contribution overview"
linkTitle: "Overview"
weight: 1000
description: >
  General guidance for contributing to any of the Dapr project repositories
---

Thank you for your interest in Dapr!
This document provides the guidelines for how to contribute to the [Dapr project](https://github.com/dapr) through issues and pull-requests. Contributions can also come in additional ways such as engaging with the community in community calls, commenting on issues or pull requests and more.

See the [Dapr community repository](https://github.com/dapr/community) for more information on community engagement and community membership.

> If you are looking to contribute to the Dapr docs, please also see the specific guidelines for [docs contributions]({{< ref contributing-docs >}}).

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
1. Create your change
    - Code changes require tests
1. Update relevant documentation for the change
1. Commit and open a PR
1. Wait for the CI process to finish and make sure all checks are green
1. A maintainer of the project will be assigned, and you can expect a review within a few days

#### Use work-in-progress PRs for early feedback

A good way to communicate before investing too much time is to create a "Work-in-progress" PR and share it with your reviewers. The standard way of doing this is to add a "[WIP]" prefix in your PR's title and assign the **do-not-merge** label. This will let people looking at your PR know that it is not well baked yet.

### Use of Third-party code

- Third-party code must include licenses.

## Code of Conduct

Please see the [Dapr community code of conduct](https://github.com/dapr/community/blob/master/CODE-OF-CONDUCT.md).
