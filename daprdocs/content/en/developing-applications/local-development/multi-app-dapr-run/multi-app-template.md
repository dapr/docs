---
type: docs
title: MapR template file
linkTitle: MapR template
weight: 2000
description: Unpack the MapR template file and its properties
---

{{% alert title="Note" color="primary" %}}
 MapR (Multi-app Run using `dapr run -f`) is currently a preview feature only supported in Linux/MacOS. 
{{% /alert %}}

The MapR template file is a YAML file that you can use to run multiple applications at once. Execute the following CLI command to read the MapR template file, named `dapr.yaml` by default:

```cmd
// the template file needs to be called `dapr.yaml` by default

dapr run -f
```

If the MapR template file is named something other than `dapr.yaml`, run:

```cmd
dapr run -f ./<your-preferred-file-name>.yaml
```

The MapR template file can include the following properties. Below is an example template showing two applications that are configured with some of the properties. 

```yaml
version: 1
common: # optional section for variables shared across apps
  resourcesPath: ./app/components # any dapr resources to be shared across apps
  env:  # any environment variable shared across apps
    - DEBUG: true
apps:
  - appID: webapp # required
    appDirPath: .dapr/webapp/ # required
    resourcesPath: .dapr/resources # (optional) can be default by convention
    configFilePath: .dapr/config.yaml # (optional) can be default by convention too, ignore if file is not found.
    appProtocol: HTTP
    appPort: 8080
    appHealthCheckPath: "/healthz" 
    command: ["python3" "app.py"]
  - appID: backend
    appDirPath: .dapr/backend/
    appProtocol: GRPC
    appPort: 3000
    unixDomainSocket: "/tmp/test-socket"
    env:
      - DEBUG: false
    command: ["./backend"]
```

## Template properties

The properties for the MapR template align with the `dapr run` CLI flags, [listed in the CLI reference documentation]({{< ref "dapr-run.md#flags" >}}).  


| Properties               | Required | Details | Example |
|--------------------------|:--------:|--------|---------|
| `appID`                  | Y        | Application's app ID | `webapp`, `backend` |
| `appDirPath`             | Y        | Path to the your application code | `./webapp/`, `./backend/` |
| `resourcesPath`          | N        | Path to your Dapr resources. Can be default by convention; ignore if directory isn't found | `./app/components`, `./webapp/components` |
| `configFilePath`         | N        | Path to your application's configuration file | `./webapp/config.yaml` |
| `appProtocol`            | N        | The protocol Dapr uses to talk to the application. | `HTTP`, `GRPC` |
| `appPort`                | N        | The port your application is listening on | `8080`, `3000` |
| `daprHTTPPort`           | N        | Dapr HTTP port |  |
| `daprGRPCPort`           | N        | Dapr GRPC port |  |
| `daprInternalGRPCPort`   | N        | gRPC port for the Dapr Internal API to listen on; used when parsing the value from a local DNS component |  |
| `metricsPort`            | N        | The port that Dapr sends its metrics information to |  |
| `unixDomainSocket`       | N        | Path to a unix domain socket dir mount. If specified, communication with the Dapr sidecar uses unix domain sockets for lower latency and greater throughput when compared to using TCP ports. Not available on Windows. | `/tmp/test-socket` |
| `profilePort`            | N        | The port for the profile server to listen on |  |
| `enableProfiling`        | N        | Enable profiling via an HTTP endpoint |  |
| `apiListenAddresses`     | N        | Dapr API listen addresses |  |
| `logLevel`               | N        | The log verbosity. |  |
| `appMaxConcurrency`      | N        | The concurrency level of the application; default is unlimited |  |
| `placementHostAddress`   | N        |  |  |
| `appSSL`                 | N        | Enable https when Dapr invokes the application |  |
| `daprHTTPMaxRequestSize` | N        | Max size of the request body in MB. |  |
| `daprHTTPReadBufferSize` | N        | Max size of the HTTP read buffer in KB. This also limits the maximum size of HTTP headers. The default 4 KB |  |
| `enableAppHealthCheck`   | N        | Enable the app health check on the application | `true`, `false` |
| `appHealthCheckPath`     | N        | Path to the health check file | `/healthz` |
| `appHealthProbeInterval` | N        | Interval to probe for the health of the app in seconds
 |  |
| `appHealthProbeTimeout`  | N        | Timeout for app health probes in milliseconds |  |
| `appHealthThreshold`     | N        | Number of consecutive failures for the app to be considered unhealthy |  |
| `enableApiLogging`       | N        | Enable the logging of all API calls from application to Dapr |  |
| `daprPath`               | N        | Dapr install path |  |
| `env`                    | N        | Map to environment variable; environment variables applied per application will overwrite environment variables shared across applications | `DEBUG`, `DAPR_HOST_ADD` |

## Next steps

[Try out the MapR template using the Distributed Calculator tutorial]