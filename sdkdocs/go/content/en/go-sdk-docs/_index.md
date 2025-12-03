---
type: docs
title: "Dapr Go SDK"
linkTitle: "Go"
weight: 1000
description: Go SDK packages for developing Dapr applications
no_list: true
cascade:
  github_repo: https://github.com/dapr/go-sdk
  github_subdir: daprdocs/content/en/go-sdk-docs
  path_base_for_github_subdir: content/en/developing-applications/sdks/go/
  github_branch: main
---

A client library to help build Dapr applications in Go. This client supports all public Dapr APIs while focusing on idiomatic Go experiences and developer productivity.

{{% cardpane %}}
{{% card title="**Client**"%}}
  Use the Go Client SDK for invoking public Dapr APIs

  [Learn more about the Go Client SDK]({{% ref go-client %}})
{{% /card %}}
{{% card title="**Service**"%}}
  Use the Dapr Service (Callback) SDK for Go to create services that will be invoked by Dapr.

  [Learn more about the Go Service (Callback) SDK]({{% ref go-service %}})
{{% /card %}}
{{% /cardpane %}}