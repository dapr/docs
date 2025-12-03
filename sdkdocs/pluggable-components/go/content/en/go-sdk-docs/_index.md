---
type: docs
title: "Getting started with the Dapr pluggable components Go SDK"
linkTitle: "Go"
weight: 1000
description: How to get up and running with the Dapr pluggable components Go SDK
no_list: true
is_preview: true
cascade:
  github_repo: https://github.com/dapr-sandbox/components-go-sdk
  github_subdir: daprdocs/content/en/go-sdk-docs
  path_base_for_github_subdir: content/en/developing-applications/develop-components/pluggable-components/pluggable-components-sdks/pluggable-components-go/
  github_branch: main
---

Dapr offers packages to help with the development of Go pluggable components.

## Prerequisites

- [Go 1.20](https://go.dev/dl/) or later
- [Dapr 1.9 CLI]({{% ref install-dapr-cli.md %}}) or later
- Initialized [Dapr environment]({{% ref install-dapr-selfhost.md %}})
- Linux, Mac, or Windows (with WSL)

{{% alert title="Note" color="primary" %}}
Development of Dapr pluggable components on Windows requires WSL. Not all languages and SDKs expose Unix Domain Sockets on "native" Windows.
{{% /alert %}}

## Application creation

Creating a pluggable component starts with an empty Go application.

```bash
mkdir example
cd example
go mod init example
```

## Import Dapr packages

Import the Dapr pluggable components SDK package.

```bash
go get github.com/dapr-sandbox/components-go-sdk@v0.1.0
```

## Create main package

In `main.go`, import the Dapr plugggable components package and run the application.

```go
package main

import (
	dapr "github.com/dapr-sandbox/components-go-sdk"
)

func main() {
	dapr.MustRun()
}
```

This creates an application with no components. You will need to implement and register one or more components.

## Implement and register components

 - [Implementing an input/output binding component]({{% ref go-bindings %}})
 - [Implementing a pub/sub component]({{% ref go-pub-sub %}})
 - [Implementing a state store component]({{% ref go-state-store %}})

{{% alert title="Note" color="primary" %}}
Only a single component of each type can be registered with an individual service. However, [multiple components of the same type can be spread across multiple services]({{% ref go-advanced %}}).
{{% /alert %}}

## Test components locally

### Create the Dapr components socket directory

Dapr communicates with pluggable components via Unix Domain Sockets files in a common directory. By default, both Dapr and pluggable components use the `/tmp/dapr-components-sockets` directory. You should create this directory if it does not already exist.

```bash
mkdir /tmp/dapr-components-sockets
```

### Start the pluggable component

Pluggable components can be tested by starting the application on the command line.

To start the component, in the application directory:

```bash
go run main.go
```

### Configure Dapr to use the pluggable component

To configure Dapr to use the component, create a component YAML file in the resources directory. For example, for a state store component:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <component name>
spec:
  type: state.<socket name>
  version: v1
  metadata:
  - name: key1
    value: value1
  - name: key2
    value: value2
```

Any `metadata` properties will be passed to the component via its `Store.Init(metadata state.Metadata)` method when the component is instantiated.

### Start Dapr

To start Dapr (and, optionally, the service making use of the service):

```bash
dapr run --app-id <app id> --resources-path <resources path> ...
```

At this point, the Dapr sidecar will have started and connected via Unix Domain Socket to the component. You can then interact with the component either:
- Through the service using the component (if started), or 
- By using the Dapr HTTP or gRPC API directly

## Create container

Pluggable components are deployed as containers that run as sidecars to the application (like Dapr itself). A typical `Dockerfile` for creating a Docker image for a Go application might look like:

```dockerfile
FROM golang:1.20-alpine AS builder

WORKDIR /usr/src/app

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download && go mod verify

# Build the application
COPY . .
RUN go build -v -o /usr/src/bin/app .

FROM alpine:latest

# Setup non-root user and permissions
RUN addgroup -S app && adduser -S app -G app
RUN mkdir /tmp/dapr-components-sockets && chown app /tmp/dapr-components-sockets

# Copy application to runtime image
COPY --from=builder --chown=app /usr/src/bin/app /app

USER app

CMD ["/app"]
```

Build the image:

```bash
docker build -f Dockerfile -t <image name>:<tag> .
```

{{% alert title="Note" color="primary" %}}
Paths for `COPY` operations in the `Dockerfile` are relative to the Docker context passed when building the image, while the Docker context itself will vary depending on the needs of the application being built. In the example above, the assumption is that the Docker context is the component application directory.
{{% /alert %}}

## Next steps
- [Advanced techniques with the pluggable components Go SDK]({{% ref go-advanced %}})
- Learn more about implementing:
  - [Bindings]({{% ref go-bindings %}})
  - [State]({{% ref go-state-store %}})
  - [Pub/sub]({{% ref go-pub-sub %}})
