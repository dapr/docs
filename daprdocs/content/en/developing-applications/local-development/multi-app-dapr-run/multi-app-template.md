---
type: docs
title: Multi-app template file
linkTitle: Multi-app template
weight: 2000
description: Unpack the multi-app template file and its variables
---

{{% alert title="Note" color="primary" %}}
 Multi-app `dapr run -f` is currently a preview feature only supported in Linux/MacOS. 
{{% /alert %}}

The multi-app template file is a single YAML configuration file that you can use to configure multiple applications alongside a Dapr sidecar. Execute the following command for Dapr to parse the multi-app template file, named `dapr.yaml` by default:

```cmd
dapr run -f
```

To name the multi-app template file something other than `dapr.yaml`, run:

```cmd
dapr run -f ./<your-preferred-file-name>.yaml
```

The multi-app template file can include any of the following parameters. 

```yaml
version: 1
common: # optional section for variables shared across apps
  resourcesPath: ./app/components # any dapr resources to be shared across apps
  env:  # any environment variable shared across apps
    - DEBUG: true
apps:
  - appID: webapp # required
    appDirPath: ./webapp/ # required
    resourcesPath: ./webapp/components # (optional) can be default by convention
    configFilePath: ./webapp/config.yaml # (optional) can be default by convention too, ignore if file is not found.
    appProtocol: HTTP
    appPort: 8080
    appHealthCheckPath: "/healthz" # All _ converted to - for all properties defined under daprd section
    command: ["python3" "app.py"]
  - appID: backend
    appDirPath: ./backend/
    appProtocol: GRPC
    appPort: 3000
    unixDomainSocket: "/tmp/test-socket"
    env:
      - DEBUG: false
    command: ["./backend"]
```

## Parameters


| Parameter                | Required | Details | Example |
|--------------------------|:--------:|--------|---------|
| `appID`                  | Y        | Your application's app ID | `webapp`, `backend` |
| `appDirPath`             | Y        | Path to the your application | `./webapp/`, `./backend/` |
| `resourcesPath`          | N        | Path to your Dapr resources. Can be default by convention; ignore if directory isn't found | `./app/components`, `./webapp/components` |
| `configFilePath`         | N        | Path to your application's configuration file | `./webapp/config.yaml` |
| `appProtocol`            | N        | Application protocol | `HTTP`, `GRPC` |
| `appPort`                | N        | Designated port for your application | `8080`, `3000` |
| `daprHTTPPort`           | N        | Dapr HTTP port |  |
| `daprGRPCPort`           | N        | Dapr GRPC port |  |
| `daprInternalGRPCPort`   | N        |  |  |
| `metricsPort`            | N        |  |  |
| `unixDomainSocket`       | N        | Path to the Unix Domain Socket | `/tmp/test-socket` |
| `profilePort`            | N        |  |  |
| `enableProfiling`        | N        |  |  |
| `apiListenAddresses`     | N        | Dapr API listen addresses |  |
| `logLevel`               | N        |  |  |
| `appMaxConcurrency`      | N        |  |  |
| `placementHostAddress`   | N        |  |  |
| `appSSL`                 | N        |  |  |
| `daprHTTPMaxRequestSize` | N        |  |  |
| `daprHTTPReadBufferSize` | N        |  |  |
| `enableAppHealthCheck`   | N        | Enable the app health check on the application | `true`, `false` |
| `appHealthCheckPath`     | N        | Path to the health check file | `/healthz` |
| `appHealthProbeInterval` | N        | App health check interval time range |  |
| `appHealthProbeTimeout`  | N        | When the app health check will timeout |  |
| `appHealthThreshold`     | N        |  |  |
| `enableApiLogging`       | N        |  |  |
| `daprPath`               | N        | Dapr install path |  |
| `env`                    | N        | Map to environment variable; environment variables applied per application will overwrite environment variables shared across applications | `DEBUG`, `DAPR_HOST_ADD` |

## Scenario

todo

## Next steps