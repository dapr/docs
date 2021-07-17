---
type: docs
title: "Dapr Services"
linkTitle: "Services"
weight: 100
---


Dapr supports multiple services that help sidecar - sidecar, sidecar - app and sidecar - system communication. Following are the services and the way to leverage them with your application.

#### Daprd

Dapr sidecar is available as Kubernetes container or as a Daprd process while using Dapr locally. Dapr runs Daprd by default when `Dapr Run` is executed through Dapr cli. While that's the default behavior, some users might still have to use Daprd explicity in certain special scenarios. For example a user may want to run sidecar in production system without running in a container. In cases like that when daprd can be executed through command line as follows

```bash
~/.dapr/bin/daprd -app-id <app-name>
```
app-id is a required argument which indicates a unique string id for your Dapr instance. Following are other arguments that can be used while executing daprd.

| Options | Description |
|----------------|-------------|
| **allowed-origins (string)** | Allowed HTTP origins (default "*")
| **app-max-concurrency (int)** | Controls the concurrency level when forwarding requests to user code (default -1)
| **app-ssl** | Sets the URI scheme of the app to https and attempts an SSL connection
| **components-path (string)** | Path for components directory. If empty, components will not be loaded. Self-hosted mode only
| **config string** | Path to config file, or name of a configuration object
| **control-plane-address (string)** | Address for a Dapr control plane
| **dapr-grpc-port (string)** | gRPC port for the Dapr API to listen on (default "50001")
| **dapr-http-max-request-size (int)** | Increasing max size of request body in MB to handle uploading of big files. By default 4 MB. (default -1)
| **dapr-http-port (string)** | HTTP port for Dapr API to listen on (default "3500")
| **dapr-internal-grpc-port (string)** | gRPC port for the Dapr Internal API to listen on
| **enable-metrics** | Enable prometheus metric (default true)
| **enable-mtls** | Enables automatic mTLS for daprd to daprd communication channels
| **enable-profiling** | Enable profiling
| **kubeconfig (string)** | (optional) absolute path to the kubeconfig file (default "/Users/tanvigour/.kube/config")
| **log-as-json** | print log as JSON (default false)
| **log-level (string)** | Options are debug, info, warn, error, or fatal (default info) (default "info")
| **metrics-port (string)** | The port for the metrics server (default "9090")
| **mode (string)** | Runtime mode for Dapr (default "standalone")
| **placement-host-address (string)** | Addresses for Dapr Actor Placement servers
| **profile-port (string)** | The port for the profile server (default "7777")
| **sentry-address (string)** | Address for the Sentry CA service
| **testify.m (string)** | regular expression to select tests of the testify suite to run
| **version** | Prints the runtime version
| **wait** | wait for Dapr outbound ready
