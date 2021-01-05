---
type: docs
title: "Getting started with Dapr"
linkTitle: "Getting started"
weight: 20
description: "Get up and running with Dapr"
no_list: true
---

The recommended way to get started with Dapr is to setup a local development environment (also referred to as [_self-hosted_ mode]({{< ref self-hosted >}})). This guide will walk you through the required steps to install the Dapr CLI and initialize Dapr on your local machine with components for state store and pub/sub so you get started quickly.

{{% alert title="Dapr Concepts" color="primary" %}}
If you are looking for an introductory overview of Dapr and learn more about basic Dapr terminology, it is recommended to visit the [concepts section]({{<ref concepts>}}) in the docs.
{{% /alert %}}

## Step 1: Install the Dapr CLI

The Dapr CLI is main tool you'll be using for various Dapr related tasks. Most importantly it is used to run an application with a Dapr sidecar, but it also can review sidecar logs, list running services, and run the Dapr dashboard. The Dapr CLI works with both [self-hosted]({{< ref self-hosted >}}) and [Kubernetes]({{< ref Kubernetes >}}) environments. 

Follow the instructions in [How-To: Install the Dapr CLI]({{<ref install-dapr-cli>}})

## Step 2: Initialize Dapr

Now that you have the Dapr CLI installed, it's time to initialize Dapr on your local machine using the CLI. This step will install the Dapr sidecar binaries on your machine, spin up Zipkin and Redis Docker containers, adn create default component files to help you get started quickly with state management and Pub/Sub.

Follow the instructions in [How-To: Initialize Dapr in your local environment]({{<ref install-dapr-selfhost>}})

{{% alert title="Docker" color="primary" %}}
This guide recommends and assumes you have Docker Desktop installed and initialize Dapr with Docker containers. If you would like to initialize Dapr without a dependency on Docker see [this guidance]({{<ref self-hosted-no-docker.md>}}).
{{% /alert %}}

## Step 3: Get and set state using the Dapr API
At this point, the `dapr init` command has ensured your local environment has the Dapr sidecar binaries as well as default component definitions for both state management and a message broker (both using Redis). Now you can use the Dapr CLI to run a Dapr sidecar and try out the state API that will allow you to store and retrieve a state. 

The way it works is depicted in the illustration below:

<img src="/images/state-management-overview.png" width=600>

Instead of a writing an application to call the API you can use the Dapr CLI to just run the sidecar and then send requests directly using `curl`:

Follow the instructions in [How-To: Save and get state]({{<ref howto-get-save-state>}})

## Step 4: Explore the Dapr quickstarts

Now that you had your first experience calling the Dapr API directly, you can explore how Dapr is used in an application. To get started quickly with existing code that shows various Dapr capabilities, see the Dapr quickstarts and start with the "Hello world" quickstart.

Explore the [Dapr quickstarts]({{<ref quickstarts>}})

{{% alert title="Additional commands" color="primary" %}}
While running these quickstarts, consider trying out some other Dapr CLI commands such as `dapr list` and `dapr dashboard`.
{{% /alert %}}

## Optional next steps
- Explore additional steps to configure a Dapr dev environment - [How-To: Setup a Dapr dev environment]({{<ref dev-environment>}})
- Try running Dapr on Kubernetes - [How-To: Install Dapr into a Kubernetes cluster]({{<ref install-dapr-kubernetes>}})
- Setup a non-default state store or message broker - [How-To: Configure state store and pub/sub message broker]({{<ref configure-state-pubsub>}})