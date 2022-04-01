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
| `--image-registry`   |                      |               | Pulls container images required by Dapr from the given image registry                    |
|        N/A              |DAPR_DEFAULT_IMAGE_REGISTRY|          | In self hosted mode, it is used to specify the default container registry to pull images from. When its value is set to `GHCR` or `ghcr` it pulls the required images from Github container registry. To default to Docker hub as default, just unset this env variable.|
### Examples

#### Self hosted environment

Install Dapr by pulling container images for Placement, Redis and Zipkin. By default these images are pulled from Docker Hub. To switch to Dapr Github container registry as the default registry, set the `DAPR_DEFAULT_IMAGE_REGISTRY` environment variable value to be `GHCR`. To switch back to Docker Hub as default registry, unset this environment variable. 

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

You can also specify a private registry to pull container images from. These images need to be published to private registries as shown below to enable Dapr CLI to pull them successfully via the `dapr init` command - 

1. Dapr runtime container image(dapr) (Used to run Placement) - dapr/dapr:<version>
2. Redis container image(rejson)   - dapr/3rdparty/rejson
3. Zipkin container image(zipkin)  - dapr/3rdparty/zipkin

> All the required images used by Dapr needs to be under the`dapr` path.

> The 3rd party images have to be published under `dapr/3rdparty` path.

> image-registy uri follows this format - `docker.io/<username>`

```bash
dapr init --image-registry docker.io/username
```
This command resolves the complete image URI as shown below -
1. Placement container image(dapr) - docker.io/username/dapr/dapr:<version>
2. Redis container image(rejson)   - docker.io/username/dapr/3rdparty/rejson
3. zipkin container image(zipkin)  - docker.io/username/dapr/3rdparty/zipkin


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
