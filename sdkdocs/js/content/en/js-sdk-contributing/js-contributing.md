---
type: docs
title: "Contributing to the JavaScript SDK"
linkTitle: "JavaScript SDK"
weight: 3000
description: Guidelines for contributing to the Dapr JavaScript SDK
---

When contributing to the [JavaScript SDK](https://github.com/dapr/js-sdk) the following rules and best-practices should be followed.

💡 You can run `npm pretty-fix` to run prettier on all your files

## Commit Guidelines

The Dapr Javascript SDK uses the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
specification. The automatic changelog tool uses these to automatically generate
a changelog based on the commit messages. Here's a guide to writing a commit message
to allow this:

### Format

```
type(scope)!: subject
```

- `type`: the type of the commit is one of the following:

  - `feat`: new features.
  - `fix`: bug fixes.
  - `docs`: documentation changes.
  - `refactor`: refactor of a particular code section without introducing
    new features or bug fixes.
  - `style`: code style improvements.
  - `perf`: performance improvements.
  - `test`: changes to the test suite.
  - `ci`: changes to the CI system.
  - `build`: changes to the build system (we don't yet have one so this shouldn't apply).
  - `chore`: for other changes that don't match previous types. This doesn't appear
    in the changelog.

- `scope`: section of the codebase that the commit makes changes to. If it makes changes to
  many sections, or if no section in particular is modified, leave blank without the parentheses.
  Examples:

  - Commit that adds a `test`:

  ```
  test(actors): add an actor test
  ```

  - Commit that changes many things at once:

  ```
  style: adopt eslint
  ```

  For changes to examples, the scope should be the example name with the `examples/` prefix:

  - ❌ `fix(agnoster): commit subject`
  - ✅ `fix(examples/http/actor): commit subject`

- `!`: this goes after the `scope` (or the `type` if scope is empty), to indicate that the commit
  introduces breaking changes.

  Optionally, you can specify a message that the changelog tool will display to the user to indicate
  what's changed and what they can do to deal with it. You can use multiple lines to type this message;
  the changelog parser will keep reading until the end of the commit message or until it finds an empty
  line.

  Example (made up):

  ```
  style(agnoster)!: change dirty git repo glyph

  BREAKING CHANGE: the glyph to indicate when a git repository is dirty has
  changed from a Powerline character to a standard UTF-8 emoji.

  Fixes #420

  Co-authored-by: Username <email>
  ```

- `subject`: a brief description of the changes. This will be displayed in the changelog. If you need
  to specify other details you can use the commit body but it won't be visible.

  Formatting tricks: the commit subject may contain:

  - Links to related issues or PRs by writing `#issue`. This will be highlighted by the changelog tool:

    ```
    feat(archlinux): add support for aura AUR helper (#9467)
    ```

  - Formatted inline code by using backticks: the text inbetween backticks will also be highlighted by
    the changelog tool:
    ```
    feat(shell-proxy): enable unexported `DEFAULT_PROXY` setting (#9774)
    ```

### Style

Try to keep the first commit line short. This is harder to do using this commit style but try to be
concise and if you need more space, you can use the commit body. Try to make sure that the commit
subject is clear and precise enough that users will know what change by just looking at the changelog.

## Github Dapr Bot Commands

Checkout the [daprbot documentation](https://docs.dapr.io/contributing/daprbot/) for Github commands you can run in this repo for common tasks. For example, you can run the `/assign` (as a comment on an issue) to assign issues to a user or group of users.

## Coding Rules

To ensure consistency throughout the source code, keep these rules in mind as you are working:

- All features or bug fixes **must be tested** by one or more specs (unit-tests).
- All public API methods **must be documented**.
- We follow [ESLint RecommendedRules](https://eslint.org/docs/rules/).

## Examples

The `examples` directory contains code samples for users to run to try out specific functionality of the various JavaScript SDK packages and extensions. When writing new and updated samples keep in mind:

- All examples should be runnable on Windows, Linux, and MacOS. While JavaScript code is consistent among operating systems, any pre/post example commands should provide options through [tabpane]({{% ref "contributing-docs.md#tabbed-content" %}}).
- Contain steps to download/install any required pre-requisites. Someone coming in with a fresh OS install should be able to start on the example and complete it without an error. Links to external download pages are fine.

## Docs

The `daprdocs` directory contains the markdown files that are rendered into the [Dapr Docs](https://docs.dapr.io) website. When the documentation website is built, this repo is cloned and configured so that its contents are rendered with the docs content. When writing docs, keep in mind:

- All rules in the [docs guide]({{% ref contributing-docs.md %}}) should be followed in addition to these.
- All files and directories should be prefixed with `js-` to ensure all file/directory names are globally unique across all Dapr documentation.
