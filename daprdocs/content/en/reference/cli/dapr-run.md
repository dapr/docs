---
type: docs
title: "run CLI command reference"
linkTitle: "run"
description: "Detailed information on the run CLI command"
---

### Description

Run Dapr and (optionally) your application side by side. A full list comparing daprd arguments, CLI arguments, and Kubernetes annotations can be found [here]({{< ref arguments-annotations-overview.md >}}).

### Supported platforms

- [Self-Hosted]({{< ref self-hosted >}})

### Usage

```bash
dapr run [flags] [command]
```

### Flags

| Name                           | Environment Variable | Default                                                                            | Description                                                                                          |
| ------------------------------ | -------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `--app-id`, `-a`               | `APP_ID`             |                                                                                    | The id for your application, used for service discovery                                              |
| `--app-max-concurrency`        |                      | `unlimited`                                                                        | The concurrency level of the application, otherwise is unlimited                                     |
| `--app-port`, `-p`             | `APP_PORT`           |                                                                                    | The port your application is listening on                                                            |
| `--app-protocol`, `-P`         |                      | `http`                                                                             | The protocol (gRPC or HTTP) Dapr uses to talk to the application. Valid values are: `http` or `grpc` |
| `--app-ssl`                    |                      | `false`                                                                            | Enable https when Dapr invokes the application                                                       |
| `--components-path`, `-d`      |                      | `Linux & Mac: $HOME/.dapr/components`, `Windows: %USERPROFILE%\.dapr\components`   | The path for components directory                                                                    |
| `--config`, `-c`               |                      | `Linux & Mac: $HOME/.dapr/config.yaml`, `Windows: %USERPROFILE%\.dapr\config.yaml` | Dapr configuration file                                                                              |
| `--dapr-grpc-port`             | `DAPR_GRPC_PORT`     | `50001`                                                                            | The gRPC port for Dapr to listen on                                                                  |
| `--dapr-http-port`             | `DAPR_HTTP_PORT`     | `3500`                                                                             | The HTTP port for Dapr to listen on                                                                  |
| `--enable-profiling`           |                      | `false`                                                                            | Enable `pprof` profiling via an HTTP endpoint                                                        |
| `--help`, `-h`                 |                      |                                                                                    | Print this help message                                                                              |
| `--image`                      |                      |                                                                                    | The image to build the code in. Input is: `repository/image`                                         |
| `--log-level`                  |                      | `info`                                                                             | The log verbosity. Valid values are: `debug`, `info`, `warn`, `error`, `fatal`, or `panic`           |
| `--enable-api-logging`                  |                      | `false`                                                                             | Enable the logging of all API calls from application to Dapr      |
| `--metrics-port`               | `DAPR_METRICS_PORT`  | `9090`                                                                             | The port that Dapr sends its metrics information to                                                  |
| `--profile-port`               |                      | `7777`                                                                             | The port for the profile server to listen on                                                         |
| `--unix-domain-socket`, `-u`   |                      |                                                                                    |  Path to a unix domain socket dir mount. If specified, communication with the Dapr sidecar uses unix domain sockets for lower latency and greater throughput when compared to using TCP ports. Not available on Windows OS |
| `--dapr-http-max-request-size` |                      | `4`                                                                                | Max size of request body in MB.                                                                      |
| `--dapr-http-read-buffer-size` |                      | `4`                                                                                | Max size of http header read buffer in KB.  The default 4 KB.  When sending bigger than default 4KB http headers, you should set this to a larger value, for example 16 (for 16KB).                                                                     |
### Examples

```bash
# Run a .NET application
dapr run --app-id myapp --app-port 5000 -- dotnet run

# Run a .Net application with unix domain sockets
dapr run --app-id myapp --app-port 5000 --unix-domain-socket /tmp -- dotnet run

# Run a Java application
dapr run --app-id myapp -- java -jar myapp.jar

# Run a NodeJs application that listens to port 3000
dapr run --app-id myapp --app-port 3000 -- node myapp.js

# Run a Python application
dapr run --app-id myapp -- python myapp.py

# Run sidecar only
dapr run --app-id myapp

# Run a gRPC application written in Go (listening on port 3000)
dapr run --app-id myapp --app-port 5000 --app-protocol grpc -- go run main.go

# Run a NodeJs application that listens to port 3000 with API logging enabled
dapr run --app-id myapp --app-port 3000 --enable-api-logging  -- node myapp.js
```
