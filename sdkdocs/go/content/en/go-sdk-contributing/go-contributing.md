---
type: docs
title: "Contributing to the Go SDK"
linkTitle: "Go SDK"
weight: 3000
description: Guidelines for contributing to the Dapr Go SDK
---

When contributing to the [Go SDK](https://github.com/dapr/go-sdk) the following rules and best-practices should be followed.

## Examples

The `examples` directory contains code samples for users to run to try out specific functionality of the various Go SDK packages and extensions. When writing new and updated samples keep in mind:

- All examples should be runnable on Windows, Linux, and MacOS. While Go code is consistent among operating systems, any pre/post example commands should provide options through [tabpane]({{% ref "contributing-docs.md#tabbed-content" %}})
- Contain steps to download/install any required pre-requisites. Someone coming in with a fresh OS install should be able to start on the example and complete it without an error. Links to external download pages are fine.

## Docs

The `daprdocs` directory contains the markdown files that are rendered into the [Dapr Docs](https://docs.dapr.io) website. When the documentation website is built this repo is cloned and configured so that its contents are rendered with the docs content. When writing docs keep in mind:

   - All rules in the [docs guide]({{% ref contributing-docs.md %}}) should be followed in addition to these.
   - All files and directories should be prefixed with `go-` to ensure all file/directory names are globally unique across all Dapr documentation.
