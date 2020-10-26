---
type: docs
title: "run CLI command reference"
linkTitle: "run"
description: "Detailed information on the run CLI command"
---

## Description

Launches Dapr and (optionally) your app side by side

## Usage

```bash
dapr run [flags] [command]
```

## Flags

| Name | Environment Variable | Default | Description
| --- | --- | --- | --- |
| `--app-id` | | | An ID for your application, used for service discovery |
| `--app-port` | | `-1` | The port your application is listening o
| `--run-path` | | `Linux & Mac: $HOME/.dapr/run`, `Windows: %USERPROFILE%\.dapr\run` | Path for run directory |
| `--config` | | `Linux & Mac: $HOME/.dapr/config.yaml`, `Windows: %USERPROFILE%\.dapr\config.yaml` | Dapr configuration file |
| `--enable-profiling` | | | Enable `pprof` profiling via an HTTP endpoint |
| `--dapr-grpc-port` | | `-1` | The gRPC port for Dapr to listen on |
| `--help`, `-h` | | | Help for run |
| `--image` | | | The image to build the code in. Input is: `repository/image` |
| `--log-level` | | `info` | Sets the log verbosity. Valid values are: `debug`, `info`, `warning`, `error`, `fatal`, or `panic` |
| `--max-concurrency` | | `-1` | Controls the concurrency level of the app |
| `--placement-host-address` | `DAPR_PLACEMENT_HOST` | `localhost` | The host on which the placement service resides |
| `--port`, `-p` | | `-1` | The HTTP port for Dapr to listen on |
| `--profile-port` | | `-1` | The port for the profile server to listen on |
| `--protocol` | | `http` | Tells Dapr to use HTTP or gRPC to talk to the app. Valid values are: `http` or `grpc` |
