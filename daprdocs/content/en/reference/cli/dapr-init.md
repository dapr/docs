---
type: docs
title: "init CLI command reference"
linkTitle: "init"
description: "Detailed information on the init CLI command"
---

### Description

Install Dapr on supported hosting platforms.

### Supported platforms

- [Self-Hosted]({{< ref self-hosted >}})
- [Kubernetes]({{< ref kubernetes >}})

### Usage

```bash
dapr init [flags]
```

### Flags

| Name                 | Environment Variable | Default       | Description                                                                          |
| -------------------- | -------------------- | ------------- | ------------------------------------------------------------------------------------ |
| `--enable-ha`        |                      | `false`       | Enable high availability (HA) mode                                                   |
| `--enable-mtls`      |                      | `true`        | Enable mTLS in your cluster                                                          |
| `--help`, `-h`       |                      |               | Print this help message                                                              |
| `--kubernetes`, `-k` |                      | `false`       | Deploy Dapr to a Kubernetes cluster                                                  |
| `--wait`             |                      | `false`       | Wait for Kubernetes initialization to complete                                       |
| `--timeout`          |                      | `300`         | The wait timeout for the Kubernetes installation                                     |
| `--namespace`, `-n`  |                      | `dapr-system` | The Kubernetes namespace to install Dapr in                                          |
| `--runtime-version`  |                      | `latest`      | The version of the Dapr runtime to install, for example: `1.0.0`                     |
| `--slim`, `-s`       |                      | `false`       | Exclude placement service, Redis and Zipkin containers from self-hosted installation |
| `--image-registry`   |                      |               | Pulls container images required by dapr from given image registry                    |

### Examples

#### Self-hosted environment

Setup Dapr by pulling container images of Placement, Redis and Zipkin. By default these images will be pulled from Github container registry. To switch to docker as a default you can set `DAPR_DEFAULT_IMAGE_REGISTRY` as environment variable and value as `DOCKERHUB`

```bash
dapr init
```

You can also specify a specific runtime version. Be default, the latest version is used.

```bash
dapr init --runtime-version 1.4.0
```

Dapr can also run [Slim self-hosted mode]({{< ref self-hosted-no-docker.md >}}) without Docker.

```bash
dapr init -s
```

You can also specify a private registry to pull container images from. These images needs to be published to private registries in below fashion to let dapr init pull them successfully - 

1. Placement container image(dapr) - dapr/dapr:<version>
2. Redis container image(rejson)   - dapr/3rdparty/rejson
3. zipkin container image(zipkin)  - dapr/3rdparty/zipkin

> As you can see above, all required images by Dapr needs to be under `dapr` directory.

> The 3rd party images have to be published under `dapr/3rdparty` directory;

> image-registy uri follows this format - `example.io/<owner|username>`

```bash
dapr init --image-registry example.io/<owner|username>
```
Above command will resolve the complete image uri as mentioned below - 
1. Placement container image(dapr) - example.io/<owner|username>/dapr/dapr:<version>
2. Redis container image(rejson)   - example.io/<owner|username>/dapr/3rdparty/rejson
3. zipkin container image(zipkin)  - example.io/<owner|username>/dapr/3rdparty/zipkin


#### Kubernetes environment

```bash
dapr init -k
```

You can wait for the installation to complete its deployment with the `--wait` flag.
The default timeout is 300s (5 min), but can be customized with the `--timeout` flag.

```bash
dapr init -k --wait --timeout 600
```

You can also specify a specific runtime version.

```bash
dapr init -k --runtime-version 1.4.0
```
