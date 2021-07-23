---
type: docs
title: "How-To: Debug multiple Dapr applications"
linkTitle: "How-To: Debug Dapr applications"
weight: 40000
description:  "Learn how to configure VSCode to debug multiple Dapr applications"
---

As your project grows you may need to configure VS Code to debug multiple Dapr applications. This topic provides guidance on the steps you need to take.

To follow along with the breakdown of configuration features set up the [Hello World Quickstart Project](https://github.com/dapr/quickstarts/tree/v1.0.0/hello-world) 

## Step 1: Configure launch.json
This file contains information regarding the configurations you run during the debugging process. For the Hello World project, you have two applications running alongside 2 Dapr instances.
Each supported language requires a specific configuration for launching the program. However, each configuration contains a Daprd run task and a Daprd stop task for prelaunch and post debug actions.



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

The 3 main parameters each configuration needs are a `request`, `type` and `name`. They work as the basic parameters which help VS Code identify how to handle the task configurations you build later. For more information on VS Code debugging parameters visit the [VS Code launch attributes](https://code.visualstudio.com/Docs/editor/debugging#_launchjson-attributes)

- `type` is related to the language you are trying to run, and depending on the language it might require an extension found in the marketplace, such as the [Python Extension](https://marketplace.visualstudio.com/items?itemName=ms-python.python).
- `name` is a unique name for the configuration, used for compound configurations when calling multiple configurations in your project.
- `${workspaceFolder}` is a VS Code variable reference, equal to the workspace path of the opened VS Code workspace.
- The `preLaunchTask` and `postDebugTask` parameters refer to the program configurations run before and after launching the application. See step 2 on how to configure these.

## Step 2: Configure  task.json

You need to create the tasks mentioned in the launch.json for both application configurations in order for them to launch succesfully.

### Hello World daprd task

For the following tutorial you need to have the following parameters filled out "appId", "httpPort", "metricsPort",  "label" and "type". There are more parameters depending on the specific Daprd command you're trying to run that you need such as "appPort" but those are dependent on what each application is trying to accomplish.

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

## Step 3: Configure compound launch inside launch.json

A compound launch configuration can be made in the launch.json and its purpose is to list the names of two or more launch configurations that should be launched in parallel. Optionally, a preLaunchTask can be specified and run before the individual debug sessions are started.

For our example the compound configuration is be:

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

## Step 4: Run compound launch

You can now run the program in debug mode by finding the compound command in the VS Code debugger.

<img src="/images/vscode-launch-configuration.png" width=400 >


#### Daprd parameter table
Below you will find all the current supported parameters for VS Code tasks.

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
| `controlPlaneAddress` | Address for a Dapr control plane | No | "controlPlaneAddress": ""
| `enableProfiling` | Enable profiling	 | No | "enableProfiling": false
| `enableMtls` | Enables automatic mTLS for daprd to daprd communication channels | No | "enableMtls": false
| `grpcPort` | gRPC port for the Dapr API to listen on (default “50001”) | Yes, if multiple apps | "grpcPort": 50004
| `httpPort` | The HTTP port for the Dapr API | Yes | "httpPort": 3502
| `internalGrpcPort` | gRPC port for the Dapr Internal API to listen on	 | No | "internalGrpcPort": 50001
| `logAsJson` | Setting this parameter to true outputs logs in JSON format. Default is false | No | "logAsJson": false
| `logLevel` | Sets the log level for the Dapr sidecar. Allowed values are debug, info, warn, error. Default is info | No | "logLevel": "debug"
| `metricsPort` | Sets the port for the sidecar metrics server. Default is 9090 | Yes, if multiple apps | "metricsPort": 9093
| `mode` | Runtime mode for Dapr (default “standalone”) | No | "mode": "standalone"
| `placementHostAddress` | Addresses for Dapr Actor Placement servers | No | "placementHostAddress": ""
| `profilePort` | The port for the profile server (default “7777”)	 | No |  "profilePort": 7777
| `sentryAddress` | Address for the Sentry CA service | No | "sentryAddress": ""
| `type` | Tells VS Code it will be a daprd task type | Yes | "type": "daprd"

For more information on daprd, dapr Cli, and Kubernetes arguments visit the [arguments and annotations page]({<ref arguments-annotations-overview.md>}})
## Related Links

* [VS Code Extension Overview]({{< ref vscode-dapr-extension.md >}})
* [VS Code Manual Configurations]({{< ref vscode-manual-configuration.md >}})
