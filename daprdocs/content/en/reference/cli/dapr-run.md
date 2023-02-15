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
| `--app-id`, `-a`               | `APP_ID`             |                                                                                    | The id for your application, used for service discovery. Cannot contain dots.                        |
| `--app-max-concurrency`        |                      | `unlimited`                                                                        | The concurrency level of the application; default is unlimited                                       |
| `--app-port`, `-p`             | `APP_PORT`           |                                                                                    | The port your application is listening on                                                            |
| `--app-protocol`, `-P`         |                      | `http`                                                                             | The protocol Dapr uses to talk to the application. Valid values are: `http` or `grpc` |
| `--app-ssl`                    |                      | `false`                                                                            | Enable https when Dapr invokes the application                                                       |
| `--resources-path`, `-d`      |                      | Linux/Mac: `$HOME/.dapr/components` <br/>Windows: `%USERPROFILE%\.dapr\components`   | The path for components directory                                                                   |
| `--runtime-path`                  |        |  | Dapr runtime install path |
| `--config`, `-c`               |                      | Linux/Mac: `$HOME/.dapr/config.yaml` <br/>Windows: `%USERPROFILE%\.dapr\config.yaml` | Dapr configuration file                                                                            |
| `--dapr-grpc-port`, `-G`       | `DAPR_GRPC_PORT`     | `50001`                                                                            | The gRPC port for Dapr to listen on                                                                  |
| `--dapr-internal-grpc-port`, `-I` |                      | `50002`                                                                            | The gRPC port for the Dapr internal API to listen on. Set during development for apps experiencing temporary errors with service invocation failures due to mDNS caching, or configuring Dapr sidecars behind firewall. Can be any value greater than 1024 and must be different for each app.              |
| `--dapr-http-port`, `-H`       | `DAPR_HTTP_PORT`     | `3500`                                                                             | The HTTP port for Dapr to listen on                                                                  |
| `--enable-profiling`           |                      | `false`                                                                            | Enable "pprof" profiling via an HTTP endpoint                                                        |
| `--help`, `-h`                 |                      |                                                                                    | Print the help message                                                                              |
| `--run-file`, `-f`                 |                      |  Linux/MacOS: `$HOME/.dapr/dapr.yaml`                              | Run multiple applications at once using a Multi-App Run template file. Currently in [alpha]({{< ref "support-preview-features.md" >}}) and only available in Linux/MacOS                                                                     |
| `--image`                      |                      |                                                                                    | Use a custom Docker image. Format is `repository/image` for Docker Hub, or `example.com/repository/image` for a custom registry. |
| `--log-level`                  |                      | `info`                                                                             | The log verbosity. Valid values are: `debug`, `info`, `warn`, `error`, `fatal`, or `panic`           |
| `--enable-api-logging`         |                      | `false`                                                                            | Enable the logging of all API calls from application to Dapr      |
| `--metrics-port`               | `DAPR_METRICS_PORT`  | `9090`                                                                             | The port that Dapr sends its metrics information to                                                  |
| `--profile-port`               |                      | `7777`                                                                             | The port for the profile server to listen on                                                         |
| `--enable-app-health-check`    |                      | `false`                                                                            | Enable health checks for the application using the protocol defined with app-protocol |
| `--app-health-check-path`      |                      |                                                                                    | Path used for health checks; HTTP only |
| `--app-health-probe-interval`  |                      |                                                                                    | Interval to probe for the health of the app in seconds |
| `--app-health-probe-timeout`   |                      |                                                                                    | Timeout for app health probes in milliseconds |
| `--app-health-threshold`       |                      |                                                                                    | Number of consecutive failures for the app to be considered unhealthy |
| `--unix-domain-socket`, `-u`   |                      |                                                                                    |  Path to a unix domain socket dir mount. If specified, communication with the Dapr sidecar uses unix domain sockets for lower latency and greater throughput when compared to using TCP ports. Not available on Windows. |
| `--dapr-http-max-request-size` |                      | `4`                                                                                | Max size of the request body in MB. |
| `--dapr-http-read-buffer-size` |                      | `4`                                                                                | Max size of the HTTP read buffer in KB. This also limits the maximum size of HTTP headers. The default 4 KB |
| `--components-path`, `-d`      |                      | Linux/Mac: `$HOME/.dapr/components` <br/>Windows: `%USERPROFILE%\.dapr\components` | **Deprecated** in favor of `--resources-path`                                                      |

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
