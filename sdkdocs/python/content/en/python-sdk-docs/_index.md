---
type: docs
title: "Dapr Python SDK"
linkTitle: "Python"
weight: 1000
description: Python SDK packages for developing Dapr applications
no_list: true
cascade:
  github_repo: https://github.com/dapr/python-sdk
  github_subdir: daprdocs/content/en/python-sdk-docs
  path_base_for_github_subdir: content/en/developing-applications/sdks/python/
  github_branch: master
---

Dapr offers a variety of subpackages to help with the development of Python applications. Using them you can create Python clients, servers, and virtual actors with Dapr.

## Prerequisites

- [Dapr CLI]({{% ref install-dapr-cli.md %}}) installed
- Initialized [Dapr environment]({{% ref install-dapr-selfhost.md %}})
- [Python 3.10+](https://www.python.org/downloads/) installed

## Installation

To get started with the Python SDK, install the main Dapr Python SDK package. 

{{< tabpane text=true >}}

{{% tab header="Stable" %}}
<!--stable-->
```bash
pip install dapr
```
{{% /tab %}}

{{% tab header="Development" %}}
<!--dev-->
> **Note:** The development version will contain features and behavior that will be compatible with the pre-release version of the Dapr runtime. Only tagged releases are published to PyPI, so install the development version from the GitHub repository. Make sure to uninstall any stable versions of the Python SDK before installing it.

```bash
pip install "dapr @ git+https://github.com/dapr/python-sdk.git@main"
```

{{% /tab %}}

{{< /tabpane >}}

The SDK requires `protobuf` 6.33.5 or later and `grpcio` and `grpcio-status` 1.81.1 or later. `pip` installs matching versions automatically. If your project pins `protobuf`, `grpcio` or `grpcio-status` to an earlier version, update the pins before you upgrade the SDK.

### Install extensions

From Dapr 1.19, the SDK extensions are optional extras of the `dapr` package. Install the extras that you need in the same command as the SDK, for example:

```bash
pip install "dapr[workflow]"
pip install "dapr[fastapi,grpc]"
```

| Extra | Extension | Import path |
| ----- | --------- | ----------- |
| `dapr[fastapi]` | [FastAPI]({{% ref python-fastapi %}}) | `dapr.ext.fastapi` |
| `dapr[flask]` | [Flask]({{% ref python-flask %}}) | `dapr.ext.flask` |
| `dapr[grpc]` | [gRPC]({{% ref python-grpc %}}) | `dapr.ext.grpc` |
| `dapr[workflow]` | [Workflow]({{% ref python-workflow-ext %}}) | `dapr.ext.workflow` |
| `dapr[databricks]` | [Databricks]({{% ref python-databricks-ext %}}) | `dapr.ext.databricks` |
| `dapr[langgraph]` | LangGraph checkpoint persistence | `dapr.ext.langgraph` |
| `dapr[strands]` | Strands agent session management | `dapr.ext.strands` |

To install every extension, use `pip install "dapr[all]"`.

{{% alert title="Upgrading from Dapr 1.18 or earlier" color="warning" %}}
The `dapr-ext-fastapi`, `dapr-ext-grpc`, `dapr-ext-langgraph`, `dapr-ext-strands`, `dapr-ext-workflow` and `flask-dapr` packages are no longer published. The extension code now ships inside the `dapr` package, and the import paths under `dapr.ext.*` do not change.

If you have any of the old packages installed, run these commands in order. Uninstalling an old package removes the extension files that the new `dapr` package installs, so you must reinstall `dapr` afterwards:

```bash
pip uninstall -y dapr-ext-fastapi dapr-ext-grpc dapr-ext-langgraph dapr-ext-strands dapr-ext-workflow flask-dapr
pip install --force-reinstall --no-deps dapr
pip install "dapr[fastapi,workflow]"
```

Replace the extras in the last command with the extras your application uses. If you skip these steps, `import dapr` emits a `FutureWarning` with the recovery command. You can silence the warning by setting `DAPR_SKIP_LEGACY_CHECK=1`.
{{% /alert %}}


## Available subpackages

### SDK imports

Python SDK imports are subpackages included with the main SDK install, but need to be imported when used. The most common imports provided by the Dapr Python SDK are:

<div class="card-deck">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Client</b></h5>
      <p class="card-text">Write Python applications to interact with a Dapr sidecar and other Dapr applications, including stateful virtual actors in Python</p>
      <a href="{{% ref python-client %}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Actors</b></h5>
      <p class="card-text">Create and interact with Dapr's Actor framework.</p>
      <a href="{{% ref python-actor %}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Conversation</b></h5>
      <p class="card-text">Use the Dapr Conversation API (Alpha) for LLM interactions, tools, and multi-turn flows.</p>
      <a href="{{% ref conversation %}}" class="stretched-link"></a>
    </div>
  </div>
</div>

Learn more about _all_ of the [available Dapr Python SDK imports](https://github.com/dapr/python-sdk/tree/master/dapr). 

### SDK extensions

SDK extensions mainly work as utilities for receiving pub/sub events, programatically creating pub/sub subscriptions, and handling input binding events. While you can acheive all of these tasks without an extension, using a Python SDK extension proves convenient.

<div class="card-deck">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>gRPC</b></h5>
      <p class="card-text">Create Dapr services with the gRPC server extension.</p>
      <a href="{{% ref python-grpc %}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>FastAPI</b></h5>
      <p class="card-text">Integrate with Dapr Python virtual actors and pub/sub using the Dapr FastAPI extension.</p>
      <a href="{{% ref python-fastapi %}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Flask</b></h5>
      <p class="card-text">Integrate with Dapr Python virtual actors using the Dapr Flask extension.</p>
      <a href="{{% ref python-flask %}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Workflow</b></h5>
      <p class="card-text">Author workflows that work with other Dapr APIs in Python.</p>
      <a href="{{% ref python-workflow %}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Databricks</b></h5>
      <p class="card-text">Turn Databricks Lakeflow streaming records into durable Dapr Workflow executions.</p>
      <a href="{{% ref python-databricks-ext %}}" class="stretched-link"></a>
    </div>
  </div>
</div>

Learn more about [the Dapr Python SDK extensions](https://github.com/dapr/python-sdk/tree/master/ext).

## Try it out

Clone the Python SDK repo.

```bash
git clone https://github.com/dapr/python-sdk.git
```

Walk through the Python quickstarts, tutorials, and examples to see Dapr in action:

| SDK samples | Description |
| ----------- | ----------- |
| [Quickstarts]({{% ref quickstarts %}}) | Experience Dapr's API building blocks in just a few minutes using the Python SDK. |
| [SDK samples](https://github.com/dapr/python-sdk/tree/master/examples) | Clone the SDK repo to try out some examples and get started. |
| [Bindings tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/bindings) | See how Dapr Python SDK works alongside other Dapr SDKs to enable bindings. |
| [Distributed Calculator tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/distributed-calculator/python) | Use the Dapr Python SDK to handle method invocation and state persistent capabilities. |
| [Hello World tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-world) | Learn how to get Dapr up and running locally on your machine with the Python SDK. |
| [Hello Kubernetes tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes) | Get up and running with the Dapr Python SDK in a Kubernetes cluster. |
| [Observability tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/observability) | Explore Dapr's metric collection, tracing, logging and health check capabilities using the Python SDK. |
| [Pub/sub tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub) | See how Dapr Python SDK works alongside other Dapr SDKs to enable pub/sub applications. |


## More information

<div class="card-deck">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Serialization</b></h5>
      <p class="card-text">Learn more about serialization in Dapr SDKs.</p>
      <a href="{{% ref sdk-serialization %}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>PyPI</b></h5>
      <p class="card-text">Python Package Index</p>
      <a href="https://pypi.org/user/dapr.io/" class="stretched-link"></a>
    </div>
  </div>
</div>
