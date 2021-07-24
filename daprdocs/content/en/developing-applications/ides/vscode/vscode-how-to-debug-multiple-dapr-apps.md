---
type: docs
title: "How-To: Debug multiple Dapr applications"
linkTitle: "How-To: Debug Dapr applications"
weight: 40000
description:  "Learn how to configure VSCode to debug multiple Dapr applications"
---

This doc provides guidance on the steps you need to take to configure VS Code to debug multiple Dapr applications. This guidance will use the [hello world quickstart](https://github.com/dapr/quickstarts/tree/master/hello-world) as an example.

## Step 1: Configure launch.json
The file `launch.json` contains configurations for a VS Code debug run. In the case of the hello world quickstart, two applications are running, each with its own Dapr sidecar.
Configurations are different for differernt languages (in the quickstart NodeJS and Python are used). However, you'll notice that each configuration contains a `daprd run` task and a `daprd stop` task for prelaunch and post debug actions.

### NodeJS

```json
{
    "version": "0.2.0",
    "configurations": [
        {
        "type": "pwa-node",
        "request": "launch",
        "name": "Nodeapp with Dapr",
        "skipFiles": [
            "<node_internals>/**"
        ],
        "program": "${workspaceFolder}/app.js",
        "preLaunchTask": "daprd-debug-node",
        "postDebugTask": "daprd-down-node"
        }
    ]
}
```

### Python

```json
{
    "version": "0.2.0",
    "configurations": [
        {
        "type": "python",
        "request": "launch",
        "name": "Pythonapp with Dapr",
        "program": "${workspaceFolder}/app.py",   
        "console": "integratedTerminal",
        "preLaunchTask": "daprd-debug-python",
        "postDebugTask": "daprd-down-python"
    }
    ]
}
```

The three parameters each configuration needs are `request`, `type` and `name`. These parameters help VS Code identify the task configurations in the `task.json` files (See below). For more information on VS Code debugging parameters see [VS Code launch attributes](https://code.visualstudio.com/Docs/editor/debugging#_launchjson-attributes).

- `type` defines the language used.  Depending on the language, it might require an extension found in the marketplace, such as the [Python Extension](https://marketplace.visualstudio.com/items?itemName=ms-python.python).
- `name` is a unique name for the configuration. This is used for compound configurations when calling multiple configurations in your project.
- `${workspaceFolder}` is a VS Code variable reference. This is the path to the workspace opened in VS Code. 
- The `preLaunchTask` and `postDebugTask` parameters refer to the program configurations run before and after launching the application. See step 2 on how to configure these.

## Step 2: Configure  task.json

For each task defined in the `launch.json` file, a corresponding `task.json` file must be defined.

### Hello world daprd task

In the case of the quickstart the following parameters are required: `appId`, `httpPort`, `metricsPort`, `label` and `type`. There are additional parameters that may be configured. See below for a table detailing the available parameters.

#### NodeJs task

```json
{
    "version": "2.0.0",
    "tasks": [
            {
            "appId": "nodeapp",
            "appPort": 3000,
            "httpPort": 3500,
            "metricsPort": 9090,
            "label": "daprd-debug-node",
            "type": "daprd"
        },
        {
            "appId": "nodeapp",
            "label": "daprd-down-node",
            "type": "daprd-down"
        }
   ]
}
```

#### Python task

```json
{
    "version": "2.0.0",
    "tasks": [
            {
            "appId": "pythonapp",
            "httpPort": 53109,
            "grpcPort": 53317,
            "metricsPort": 9091,
            "label": "daprd-debug-python",
            "type": "daprd"
        },
        {
            "appId": "pythonapp",
            "label": "daprd-down-python",
            "type": "daprd-down"
        }
   ]
}
```

## Step 3: Configure a compound launch in launch.json

A compound launch configuration can defined in `launch.json` and is a set of two or more launch configurations that are launched in parallel. Optionally, a `preLaunchTask` can be specified and run before the individual debug sessions are started.

For this example the compound configuration is:

```json
{
   "compounds": [
        {
            "name": "Node/Python Dapr",
            "configurations": ["Nodeapp with Dapr","Pythonapp with Dapr"]
                }
    ]
}
```

## Step 4: Run a compound launch

You can now run the applications in debug mode by finding the compound command name you have defined in the previous step in the VS Code debugger:

<img src="/images/vscode-launch-configuration.png" width=400 >


#### Daprd parameter table
Below are the supported parameters for VS Code tasks. These parameters are equivalent to `daprd` arguments as detailed in [this reference]({{< ref arguments-annotations-overview.md >}}):

| Parameter    | Description   | Required    | Example |
|--------------|---------------|-------------|---------|
| `allowedOrigins`  | Allowed HTTP origins (default “*")  | No  | "allowedOrigins": "*"
| `appId`| The unique ID of the application. Used for service discovery, state encapsulation and the pub/sub consumer ID	| Yes | "appId": "divideapp"
| `appMaxConcurrency` | Limit the concurrency of your application. A valid value is any number larger than 0 | No | "appMaxConcurrency": -1
| `appPort` | This parameter tells Dapr which port your application is listening on	 | Yes |  "appPort": 4000
| `appProtocol` | Tells Dapr which protocol your application is using. Valid options are http and grpc. Default is http	 | No | "appProtocol": "http"
| `appSsl` | Sets the URI scheme of the app to https and attempts an SSL connection	 | No |  "appSsl": true
| `args` | Sets a list of arguments to pass on to the Dapr app	 | No | "args": [] 
| `componentsPath` | Path for components directory. If empty, components will not be loaded. | No | "componentsPath": "./components"
| `config` | Tells Dapr which Configuration CRD to use | No | "config": "./config"
| `controlPlaneAddress` | Address for a Dapr control plane | No | "controlPlaneAddress": "http://localhost:1366/"
| `enableProfiling` | Enable profiling	 | No | "enableProfiling": false
| `enableMtls` | Enables automatic mTLS for daprd to daprd communication channels | No | "enableMtls": false
| `grpcPort` | gRPC port for the Dapr API to listen on (default “50001”) | Yes, if multiple apps | "grpcPort": 50004
| `httpPort` | The HTTP port for the Dapr API | Yes | "httpPort": 3502
| `internalGrpcPort` | gRPC port for the Dapr Internal API to listen on	 | No | "internalGrpcPort": 50001
| `logAsJson` | Setting this parameter to true outputs logs in JSON format. Default is false | No | "logAsJson": false
| `logLevel` | Sets the log level for the Dapr sidecar. Allowed values are debug, info, warn, error. Default is info | No | "logLevel": "debug"
| `metricsPort` | Sets the port for the sidecar metrics server. Default is 9090 | Yes, if multiple apps | "metricsPort": 9093
| `mode` | Runtime mode for Dapr (default “standalone”) | No | "mode": "standalone"
| `placementHostAddress` | Addresses for Dapr Actor Placement servers | No | "placementHostAddress": "http://localhost:1313/"
| `profilePort` | The port for the profile server (default “7777”)	 | No |  "profilePort": 7777
| `sentryAddress` | Address for the Sentry CA service | No | "sentryAddress": "http://localhost:1345/"
| `type` | Tells VS Code it will be a daprd task type | Yes | "type": "daprd"

For more information on daprd, dapr Cli, and Kubernetes arguments visit the [arguments and annotations page]({<ref arguments-annotations-overview.md>}})
## Related Links

* [VS Code Extension Overview]({{< ref vscode-dapr-extension.md >}})
* [VS Code Manual Configurations]({{< ref vscode-manual-configuration.md >}})
