---
type: docs
title: "How-To: Run Dapr in self-hosted mode with Docker"
linkTitle: "Run with Docker"
weight: 20000
description: "How to deploy and run Dapr in self-hosted mode using Docker"
---

This article provides guidance on running Dapr with Docker on a Windows/Linux/macOS machine or VM.

## Prerequisites

- [Dapr CLI]({{< ref install-dapr-cli.md >}})
- [Docker](https://docs.docker.com/get-docker/)
- [Docker-Compose](https://docs.docker.com/compose/install/) (optional)

## Initialize Dapr environment

To initialize the Dapr control plane containers and create a default configuration file, run:

```bash
dapr init
```

## Run both app and sidecar as a process

The [`dapr run` CLI command]({{< ref dapr-run.md >}}) can be used to launch a Dapr sidecar along with your application:

```bash
dapr run --app-id myapp --app-port 5000 -- dotnet run
```

This command will launch both the daprd sidecar binary and run `dotnet run`, launching your application.

## Run app as a process and sidecar as a Docker container

Alternately, if you are running Dapr in a Docker container and your app as a process on the host machine, then you need to configure Docker to use the host network so that Dapr and the app can share a localhost network interface.

{{% alert title="Note" color="warning" %}}
The host networking driver for Docker is only supported on Linux hosts.
{{% /alert %}}

If you are running your Docker daemon on a Linux host, you can run the following to launch Dapr:

```shell
docker run --net="host" --mount type=bind,source="$(pwd)"/components,target=/components daprio/daprd:edge ./daprd -app-id <my-app-id> -app-port <my-app-port>
```

Then you can run your app on the host and they should connect over the localhost network interface.

## Run both app and Dapr in a single Docker container
> For development purposes ONLY

It is not recommended to run both the Dapr runtime and an application inside the same container. However, it is possible to do so for local development scenarios.

In order to do this, you'll need to write a Dockerfile that installs the Dapr runtime, Dapr CLI and your app code.
You can then invoke both the Dapr runtime and your app code using the Dapr CLI.

Below is an example of a Dockerfile which achieves this:

```docker
FROM python:3.7.1
# Install dapr CLI
RUN wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash

# Install daprd
ARG DAPR_BUILD_DIR
COPY $DAPR_BUILD_DIR /opt/dapr
ENV PATH="/opt/dapr/:${PATH}"
RUN dapr init --slim

# Install your app
WORKDIR /app
COPY python .
RUN pip install requests
ENTRYPOINT ["dapr"]
CMD ["run", "--app-id", "nodeapp", "--app-port", "3000", "node", "app.js"]
```

Remember that if Dapr needs to communicate with other components i.e. Redis, these also need to
be made accessible to it.

## Run on a Docker network

If you have multiple instances of Dapr running in Docker containers and want them to be able to
communicate with each other *i.e. for service invocation*, then you'll need to create a shared Docker network
and make sure those Dapr containers are attached to it.

You can create a simple Docker network using:
```bash
docker network create my-dapr-network
```
When running your Docker containers, you can attach them to the network using:
```bash
docker run --net=my-dapr-network ...
```
Each container will receive a unique IP on that network and be able to communicate with other containers on that network.

## Run using Docker-Compose

[Docker Compose](https://docs.docker.com/compose/) can be used to define multi-container application configurations. If you wish to run multiple apps with Dapr sidecars locally without Kubernetes then it is recommended to use a Docker Compose definition (`docker-compose.yml`).

The syntax and tooling of Docker Compose is outside the scope of this article, however, it is recommended you refer to the [official Docker documentation](https://docs.docker.com/compose/) for further details.

In order to run your applications using Dapr and Docker Compose you'll need to define the sidecar pattern in your `docker-compose.yml`. For example:

```yaml
version: '3'
services:
  nodeapp:
    build: ./node
    ports:
      - "50001:50001" # Dapr instances communicate over gRPC so we need to expose the gRPC port
    depends_on:
      - redis
      - placement
    networks:
      - hello-dapr
  nodeapp-dapr:
    image: "daprio/daprd:edge"
    command: [
      "./daprd",
     "--app-id", "nodeapp",
     "--app-port", "3000",
     "--placement-host-address", "placement:50006", # Dapr's placement service can be reach via the docker DNS entry
     "--resources-path", "./components"
     ]
    volumes:
        - "./components/:/components" # Mount our components folder for the runtime to use. The mounted location must match the --resources-path argument.
    depends_on:
      - nodeapp
    network_mode: "service:nodeapp" # Attach the nodeapp-dapr service to the nodeapp network namespace

  ... # Deploy other daprized services and components (i.e. Redis)

  placement:
    image: "daprio/dapr"
    command: ["./placement", "--port", "50006"]
    ports:
      - "50006:50006"
  
  networks:
    hello-dapr: null
```

> For those running the Docker daemon on a Linux host, you can also use `network_mode: host` to leverage host networking if needed.

To further learn how to run Dapr with Docker Compose, see the [Docker-Compose Sample](https://github.com/dapr/samples/tree/master/hello-docker-compose).

## Run on Kubernetes

If your deployment target is Kubernetes please use Dapr's first-class integration. Refer to the
[Dapr on Kubernetes docs]({{< ref "kubernetes-overview.md" >}}).

## Name resolution

Dapr by default uses mDNS as the name resolution component in self-hosted mode for service invocation. If you are running Dapr on virtual machines or where mDNS is not available, then you can use the [HashiCorp Consul]({{< ref setup-nr-consul.md >}}) component for name resolution.

## Docker images

Dapr provides a number of prebuilt Docker images for different components, you should select the relevant image for your desired binary, architecture, and tag/version.

### Images
There are published Docker images for each of the Dapr components available on [Docker Hub](https://hub.docker.com/u/daprio).
- [daprio/dapr](https://hub.docker.com/r/daprio/dapr) (contains all Dapr binaries)
- [daprio/daprd](https://hub.docker.com/r/daprio/daprd)
- [daprio/placement](https://hub.docker.com/r/daprio/placement)
- [daprio/sentry](https://hub.docker.com/r/daprio/sentry)
- [daprio/dapr-dev](https://hub.docker.com/r/daprio/dapr-dev)

### Tags

#### Linux/amd64
- `latest`: The latest release version, **ONLY** use for development purposes.
- `edge`: The latest edge build (master).
- `major.minor.patch`: A release version.
- `major.minor.patch-rc.iteration`: A release candidate.
#### Linux/arm/v7
- `latest-arm`: The latest release version for ARM, **ONLY** use for development purposes.
- `edge-arm`: The latest edge build for ARM (master).
- `major.minor.patch-arm`: A release version for ARM.
- `major.minor.patch-rc.iteration-arm`: A release candidate for ARM.
