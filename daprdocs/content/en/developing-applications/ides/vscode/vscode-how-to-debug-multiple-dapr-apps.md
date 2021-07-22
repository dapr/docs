---
type: docs
title: "How-To: Debug multiple Dapr applications"
linkTitle: "How-To: Debug multiple Dapr applications"
weight: 40000
description:  "How to configure Dapr for multiple applications"
---

As your project grows you will experience a need to configure VS Code to handle multiple Dapr applications to debug your project. This guide will offer you a simple to follow explanation of the type of changes you will need
in order to ensure that your debugging experience is consistent.

To follow along with the breakdown of configuration features please setup the [Hello World Quickstart Project](https://github.com/dapr/quickstarts/tree/v1.0.0/hello-world) 

## Step 1: Configure launch.json
This file contains information regarding the configurations you run during the debugging process. For the Hello World project, you will have two applications running along side 2 Dapr instances.
Each SDK supported will require its own tweaks for the launching of the program but each configuration will contain a Daprd run task and a Daprd stop task.



### NodeJS

```json
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
```

### Python

```json
{
    "type": "python",
    "request": "launch",
    "name": "Pythonapp with Dapr",
    "program": "${workspaceFolder}/app.py",   
    "console": "integratedTerminal",
    "preLaunchTask": "daprd-debug-python",
    "postDebugTask": "daprd-down-python"
}
```

The 3 main parameters each configuration will need is a `request`, `type` and `name`. In these scenarios we need only the `launch` request as we will be launching each application and connecting to a running Daprd instance which we will launch right before the application itself.

- `type` is related to the SDK you are trying to run, and depending on the SDK it might require an extension found in the marketplace, such as the [Python Extension](https://marketplace.visualstudio.com/items?itemName=ms-python.python).
- `name` is a unique name for the configuration, used for compound configurations when calling multiple configurations in your project.
- `${workspaceFolder}` is a VS Code variable reference, equal to the workspace path of the opened VS Code workspace.
- The `preLaunchTask` and `postDebugTask` parameters refer to the program configurations run before and after launching the application. See step 2 on how to configure these.

## Step 2: Configure  task.json

You need to create the tasks mentioned in the launch.json for both application configurations in order for them to launch succesfully.

### Daprd parameters
```json
{
    "allowedOrigins": "string",
    "appId": "string",
    "appMaxConcurrency": "number",
    "appPort": "number",
    "appProtocol": "grpc" | "http",
    "appSsl": "boolean",
    "args": "string[]",
    "componentsPath": "string",
    "config": "string",
    "controlPlaneAddress": "string",
    "enableProfiling": "boolean",
    "enableMtls": "boolean",
    "grpcPort": "number",
    "httpPort": "number",
    "internalGrpcPort": "number",
    "kubeConfig": "string",
    "logAsJson": "boolean",
    "logLevel": "DaprdLogLevel",
    "metricsPort": "number",
    "mode": "standalone" | "kubernetes",
    "placementHostAddress": "string",
    "profilePort": "number",
    "sentryAddress": "string",
    "type": "daprd"
}
```

This is the full list of the parameters the Daprd tasks you need to create can use, not all are going to be necessary but for future customization its important to be aware.

### Hello World daprd task

For the following tutorial you need to have the following parameters filled out "appId", "httpPort", "metricsPort",  "label" and "type". There are more parameters depending on the specific Daprd command you're trying to run that you willneed such as "appPort" but those are dependent on what each application is trying to accomplish.

#### NodeJs task

```json
{
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
}
```

#### Python task


```json
{
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
}
```

## Step 3: Configure compound launch inside launch.json

A compound launch configuration can be made in the launch.json and its purpose is to list the names of two or more launch configurations that should be launched in parallel. Optionally a preLaunchTask can be specified that is run before the individual debug sessions are started.

For our example the compound configuration will be:

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

<img src="/images/vscode-launch-configuration.png" width=500 >


## Related Links

* [VS Code Extension Overview]({{< ref vscode-dapr-extension.md >}})
* [VS Code Manual Configurations]({{< ref vscode-manual-configuration.md >}})
