---
type: docs
title: "run CLI command reference"
linkTitle: "run"
description: "Detailed information on the run CLI command"
---

## Description

Run Dapr and (optionally) your application side by side. A full list comparing daprd arguments, CLI arguments, and Kubernetes annotations can be found [here]({{< ref arguments-annotations-overview.md >}}).

## Supported platforms

- [Self-Hosted]({{< ref self-hosted >}})

## Usage

```bash
dapr run [flags] [command]
```

## Flags

| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--app-id`, `-a` | | | The id for your application, used for service discovery |
| `--app-max-concurrency` | | `unlimited` | The concurrency level of the application, otherwise is unlimited |
| `--app-port`, `-p` | | | The port your application is listening on
| `--app-protocol`, `-P` | | `http` | The protocol (gRPC or HTTP) Dapr uses to talk to the application. Valid values are: `http` or `grpc` |
| `--app-ssl` | | `false` | Enable https when Dapr invokes the application
| `--components-path`, `-d` | | `Linux & Mac: $HOME/.dapr/components`, `Windows: %USERPROFILE%\.dapr\components` | The path for components directory
| `--config`, `-c` | | `Linux & Mac: $HOME/.dapr/config.yaml`, `Windows: %USERPROFILE%\.dapr\config.yaml` | Dapr configuration file |
| `--dapr-grpc-port` | | `50001` | The gRPC port for Dapr to listen on |
| `--dapr-http-port` | | `3500` | The HTTP port for Dapr to listen on |
| `--enable-profiling` | | `false` | Enable `pprof` profiling via an HTTP endpoint
| `--help`, `-h` | | | Print this help message |
| `--image` | | | The image to build the code in. Input is: `repository/image` |
| `--log-level` | | `info` | The log verbosity. Valid values are: `debug`, `info`, `warn`, `error`, `fatal`, or `panic` |
| `--placement-host-address` | `DAPR_PLACEMENT_HOST` | `localhost` | The address of the placement service. Format is either `<hostname>` for default port (`6050` on Windows, `50005` on Linux/MacOS) or `<hostname>:<port>` for custom port |
| `--profile-port` | | `7777` | The port for the profile server to listen on |
| `--dapr-http-max-request-size` | | `4` | Max size of request body in MB.|

## Examples

### Run a .NET application

```bash
dapr run --app-id myapp --app-port 5000 -- dotnet run
```

### Run a Java application

```bash
dapr run --app-id myapp -- java -jar myapp.jar
```

### Run a NodeJs application that listens to port 3000

```bash
dapr run --app-id myapp --app-port 3000 -- node myapp.js
```

### Run a Python application

```bash
dapr run --app-id myapp -- python myapp.py
```

### Run sidecar only

```bash
dapr run --app-id myapp
```
