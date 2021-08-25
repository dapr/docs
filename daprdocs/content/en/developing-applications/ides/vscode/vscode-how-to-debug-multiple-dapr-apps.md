---
type: docs
title: "How-To: Debug Dapr applications with Visual Studio Code"
linkTitle: "How-To: Debug with VSCode"
weight: 20000
description:  "Learn how to configure VSCode to debug Dapr applications"
aliases:
  - /developing-applications/ides/vscode/vscode-manual-configuration/
---

## Manual debugging

When developing Dapr applications, you typically use the Dapr CLI to start your daprized service similar to this:

```bash
dapr run --app-id nodeapp --app-port 3000 --dapr-http-port 3500 app.js
```

One approach to attaching the debugger to your service is to first run daprd with the correct arguments from the command line and then launch your code and attach the debugger. While this is a perfectly acceptable solution, it does require a few extra steps and some instruction to developers who might want to clone your repo and hit the "play" button to begin debugging.

If your application is a collection of microservices, each with a Dapr sidecar, it will be useful to debug them together in Visual Studio Code. This page will use the [hello world quickstart](https://github.com/dapr/quickstarts/tree/master/hello-world) to showcase how to configure VSCode to debug multiple Dapr application using [VSCode debugging](https://code.visualstudio.com/Docs/editor/debugging).

## Prerequisites

- Install the [Dapr extension]({{< ref vscode-dapr-extension.md >}}). You will be using the [tasks](https://code.visualstudio.com/docs/editor/tasks) it offers later on.
- Optionally clone the [hello world quickstart](https://github.com/dapr/quickstarts/tree/master/hello-world)

## Step 1: Configure launch.json

The file `.vscode/launch.json` contains [launch configurations](https://code.visualstudio.com/Docs/editor/debugging#_launch-configurations) for a VS Code debug run. This file defines what will launch and how it is configured when the user begins debugging. Configurations are available for each programming language in the [Visual Studio Code marketplace](https://marketplace.visualstudio.com/VSCode).

{{% alert title="Scaffold debugging configuration" color="primary" %}}
The [Dapr VSCode extension]({{< ref vscode-dapr-extension.md >}}) offers built-in scaffolding to generate `launch.json` and `tasks.json` for you.

{{< button text="Learn more" page="vscode-dapr-extension#scaffold-dapr-components" >}}
{{% /alert %}}

In the case of the hello world quickstart, two applications are launched, each with its own Dapr sidecar. One is written in Node.JS, and the other in Python. You'll notice each configuration contains a `daprd run` preLaunchTask and a `daprd stop` postDebugTask.

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
       },
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

Each configuration requires a `request`, `type` and `name`. These parameters help VSCode identify the task configurations in the `.vscode/task.json` files.

- `type` defines the language used.  Depending on the language, it might require an extension found in the marketplace, such as the [Python Extension](https://marketplace.visualstudio.com/items?itemName=ms-python.python).
- `name` is a unique name for the configuration. This is used for compound configurations when calling multiple configurations in your project.
- `${workspaceFolder}` is a VS Code variable reference. This is the path to the workspace opened in VS Code.
- The `preLaunchTask` and `postDebugTask` parameters refer to the program configurations run before and after launching the application. See step 2 on how to configure these.

For more information on VSCode debugging parameters see [VS Code launch attributes](https://code.visualstudio.com/Docs/editor/debugging#_launchjson-attributes).

## Step 2: Configure task.json

For each [task](https://code.visualstudio.com/docs/editor/tasks) defined in `.vscode/launch.json` , a corresponding task definition must exist in `.vscode/task.json`.

For the quickstart, each service needs a task to launch a Dapr sidecar with the `daprd` type, and a task to stop the sidecar with `daprd-down`. The parameters `appId`, `httpPort`, `metricsPort`, `label` and `type` are required. Additional optional parameters are available, see the [reference table here](#daprd-parameter-table").

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "daprd-debug-node",
            "type": "daprd",
            "appId": "nodeapp",
            "appPort": 3000,
            "httpPort": 3500,
            "metricsPort": 9090
        },
        {
            "label": "daprd-down-node",
            "type": "daprd-down",
            "appId": "nodeapp"
        },
        {
            "label": "daprd-debug-python",
            "type": "daprd",
            "appId": "pythonapp",
            "httpPort": 53109,
            "grpcPort": 53317,
            "metricsPort": 9091
        },
        {
            "label": "daprd-down-python",
            "type": "daprd-down",
            "appId": "pythonapp"
        }
   ]
}
```

## Step 3: Configure a compound launch in launch.json

A compound launch configuration can defined in `.vscode/launch.json` and is a set of two or more launch configurations that are launched in parallel. Optionally, a `preLaunchTask` can be specified and run before the individual debug sessions are started.

For this example the compound configuration is:

```json
{
   "version": "2.0.0",
   "tasks": [...],
   "compounds": [
      {
        "name": "Node/Python Dapr",
        "configurations": ["Nodeapp with Dapr","Pythonapp with Dapr"]
      }
    ]
}
```

## Step 4: Launch your debugging session

You can now run the applications in debug mode by finding the compound command name you have defined in the previous step in the VS Code debugger:

<img src="/images/vscode-launch-configuration.png" width=400 >

You are now debugging multiple applications with Dapr!

## Daprd parameter table

Below are the supported parameters for VS Code tasks. These parameters are equivalent to `daprd` arguments as detailed in [this reference]({{< ref arguments-annotations-overview.md >}}):

| Parameter    | Description   | Required    | Example |
|--------------|---------------|-------------|---------|
| `allowedOrigins`  | Allowed HTTP origins (default "\*")  | No  | `"allowedOrigins": "*"`
| `appId`| The unique ID of the application. Used for service discovery, state encapsulation and the pub/sub consumer ID	| Yes | `"appId": "divideapp"`
| `appMaxConcurrency` | Limit the concurrency of your application. A valid value is any number larger than 0 | No | `"appMaxConcurrency": -1`
| `appPort` | This parameter tells Dapr which port your application is listening on	 | Yes |  `"appPort": 4000`
| `appProtocol` | Tells Dapr which protocol your application is using. Valid options are http and grpc. Default is http	 | No | `"appProtocol": "http"`
| `appSsl` | Sets the URI scheme of the app to https and attempts an SSL connection	 | No |  `"appSsl": true`
| `args` | Sets a list of arguments to pass on to the Dapr app	 | No | "args": []
| `componentsPath` | Path for components directory. If empty, components will not be loaded. | No | `"componentsPath": "./components"`
| `config` | Tells Dapr which Configuration CRD to use | No | `"config": "./config"`
| `controlPlaneAddress` | Address for a Dapr control plane | No | `"controlPlaneAddress": "http://localhost:1366/"`
| `enableProfiling` | Enable profiling	 | No | `"enableProfiling": false`
| `enableMtls` | Enables automatic mTLS for daprd to daprd communication channels | No | `"enableMtls": false`
| `grpcPort` | gRPC port for the Dapr API to listen on (default “50001”) | Yes, if multiple apps | `"grpcPort": 50004`
| `httpPort` | The HTTP port for the Dapr API | Yes | `"httpPort": 3502`
| `internalGrpcPort` | gRPC port for the Dapr Internal API to listen on	 | No | `"internalGrpcPort": 50001`
| `logAsJson` | Setting this parameter to true outputs logs in JSON format. Default is false | No | `"logAsJson": false`
| `logLevel` | Sets the log level for the Dapr sidecar. Allowed values are debug, info, warn, error. Default is info | No | `"logLevel": "debug"`
| `metricsPort` | Sets the port for the sidecar metrics server. Default is 9090 | Yes, if multiple apps | `"metricsPort": 9093`
| `mode` | Runtime mode for Dapr (default “standalone”) | No | `"mode": "standalone"`
| `placementHostAddress` | Addresses for Dapr Actor Placement servers | No | `"placementHostAddress": "http://localhost:1313/"`
| `profilePort` | The port for the profile server (default “7777”)	 | No |  `"profilePort": 7777`
| `sentryAddress` | Address for the Sentry CA service | No | `"sentryAddress": "http://localhost:1345/"`
| `type` | Tells VS Code it will be a daprd task type | Yes | `"type": "daprd"`


## Related Links

- [Visual Studio Code Extension Overview]({{< ref vscode-dapr-extension.md >}})
- [Visual Studio Code Debugging](https://code.visualstudio.com/docs/editor/debugging)
