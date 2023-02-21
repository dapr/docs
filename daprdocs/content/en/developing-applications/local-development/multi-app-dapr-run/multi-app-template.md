---
type: docs
title: "How to: Use the Multi-App Run template file"
linkTitle: "How to: Use the Multi-App Run template"
weight: 2000
description: Unpack the Multi-App Run template file and its properties
---

{{% alert title="Note" color="primary" %}}
 Multi-App Run is currently a preview feature only supported in Linux/MacOS. 
{{% /alert %}}

The Multi-App Run template file is a YAML file that you can use to run multiple applications at once. In this guide, you'll learn how to:
- Use the multi-app template 
- View started applications
- Stop the multi-app template 
- Stucture the multi-app template file

## Use the multi-app template

You can use the multi-app template file in one of the following two ways:

### Execute by providing a directory path

When you provide a directory path, the CLI will try to locate the Multi-App Run template file, named `dapr.yaml` by default in the directory. If the file is not found, the CLI will return an error.

Execute the following CLI command to read the Multi-App Run template file, named `dapr.yaml` by default:

```cmd
# the template file needs to be called `dapr.yaml` by default if a directory path is given

dapr run -f <dir_path>
```

### Execute by providing a file path

If the Multi-App Run template file is named something other than `dapr.yaml`, then you can provide the relative or absolute file path to the command:

```cmd
dapr run -f ./path/to/<your-preferred-file-name>.yaml
```

## View the started applications

Once the multi-app template is running, you can view the started applications with the following command:

```cmd
dapr list
```

## Stop the multi-app template

Stop the multi-app run template anytime with either of the following commands:

```cmd
# the template file needs to be called `dapr.yaml` by default if a directory path is given

dapr stop -f
```
or:

```cmd
dapr stop -f ./path/to/<your-preferred-file-name>.yaml
```

## Template file structure

The Multi-App Run template file can include the following properties. Below is an example template showing two applications that are configured with some of the properties. 

```yaml
version: 1
common: # optional section for variables shared across apps
  resourcesPath: ./app/components # any dapr resources to be shared across apps
  env:  # any environment variable shared across apps
    DEBUG: true
apps:
  - appID: webapp # optional
    appDirPath: .dapr/webapp/ # REQUIRED
    resourcesPath: .dapr/resources # (optional) can be default by convention
    configFilePath: .dapr/config.yaml # (optional) can be default by convention too, ignore if file is not found.
    appProtocol: HTTP
    appPort: 8080
    appHealthCheckPath: "/healthz" 
    command: ["python3" "app.py"]
  - appID: backend # optional 
    appDirPath: .dapr/backend/ # REQUIRED
    appProtocol: GRPC
    appPort: 3000
    unixDomainSocket: "/tmp/test-socket"
    env:
      - DEBUG: false
    command: ["./backend"]
```

{{% alert title="Important" color="warning" %}}
The following rules apply for all the paths present in the template file:
 - If the path is absolute, it is used as is.
 - All relative paths under comman section should be provided relative to the template file path.
 - `appDirPath` under apps section should be provided relative to the template file path.
 - All relative paths under app section should be provided relative to the appDirPath.

{{% /alert %}}

## Template properties

The properties for the Multi-App Run template align with the `dapr run` CLI flags, [listed in the CLI reference documentation]({{< ref "dapr-run.md#flags" >}}).  


| Properties               | Required | Details | Example |
|--------------------------|:--------:|--------|---------|
| `appDirPath`             | Y        | Path to the your application code | `./webapp/`, `./backend/` |
| `appID`                  | N        | Application's app ID. If not provided, will be derived from `appDirPath` | `webapp`, `backend` |
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
| `runtimePath`            | N        | Dapr runtime install path |  |
| `env`                    | N        | Map to environment variable; environment variables applied per application will overwrite environment variables shared across applications | `DEBUG`, `DAPR_HOST_ADD` |

## Next steps

Watch [this video for an overview on Multi-App Run](https://youtu.be/s1p9MNl4VGo?t=2456):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/s1p9MNl4VGo?start=2456" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
