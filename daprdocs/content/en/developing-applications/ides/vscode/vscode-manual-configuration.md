---
type: docs
title: "Visual Studio Code manual debugging configuration"
linkTitle: "Manual debugging"
weight: 30000
description:  "How to manually setup Visual Studio Code debugging"
---

The [Dapr VSCode extension]({{< ref vscode-dapr-extension.md >}}) automates the setup of [VSCode debugging](https://code.visualstudio.com/Docs/editor/debugging).

If instead you wish to manually configure the `[tasks.json](https://code.visualstudio.com/Docs/editor/tasks)` and `[launch.json](https://code.visualstudio.com/Docs/editor/debugging)` files to use Dapr, these are the steps.

When developing Dapr applications, you typically use the Dapr cli to start your daprized service similar to this:

```bash
dapr run --app-id nodeapp --app-port 3000 --dapr-http-port 3500 app.js
```

One approach to attaching the debugger to your service is to first run daprd with the correct arguments from the command line and then launch your code and attach the debugger. While this is a perfectly acceptable solution, it does require a few extra steps and some instruction to developers who might want to clone your repo and hit the "play" button to begin debugging.

Using the [tasks.json](https://code.visualstudio.com/Docs/editor/tasks) and [launch.json](https://code.visualstudio.com/Docs/editor/debugging) files in Visual Studio Code, you can simplify the process and request that VS Code kick off the daprd process prior to launching the debugger.

#### Modifying launch.json configurations to include a preLaunchTask

In your [launch.json](https://code.visualstudio.com/Docs/editor/debugging) file add a [preLaunchTask](https://code.visualstudio.com/Docs/editor/debugging#_launchjson-attributes) for each configuration that you want daprd launched. The [preLaunchTask](https://code.visualstudio.com/Docs/editor/debugging#_launchjson-attributes) references tasks that you define in your tasks.json file. Here is an example for both Node and .NET Core. Notice the [preLaunchTasks](https://code.visualstudio.com/Docs/editor/debugging#_launchjson-attributes) referenced: daprd-web and daprd-leaderboard.

```json
{
   "version": "0.2.0",
   "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Node Launch w/Dapr (Web)",
            "preLaunchTask": "daprd-web",
            "program": "${workspaceFolder}/Game/Web/server.js",
            "skipFiles": [
                "<node_internals>/**"
            ]
        },
        {
            "type": "coreclr",
            "request": "launch",
            "name": ".NET Core Launch w/Dapr (LeaderboardService)",
            "preLaunchTask": "daprd-leaderboard",
            "program": "${workspaceFolder}/Game/Services/LeaderboardService/bin/Debug/netcoreapp3.0/LeaderboardService.dll",
            "args": [],
            "cwd": "${workspaceFolder}/Game/Services/LeaderboardService",
            "stopAtEntry": false,
            "serverReadyAction": {
                "action": "openExternally",
                "pattern": "^\\s*Now listening on:\\s+(https?://\\S+)"
            },
            "env": {
                "ASPNETCORE_ENVIRONMENT": "Development"
            },
            "sourceFileMap": {
                "/Views": "${workspaceFolder}/Views"
            }
        }
    ]
}
```

#### Adding daprd tasks to tasks.json

You need to define a task and problem matcher for daprd in your [tasks.json](https://code.visualstudio.com/Docs/editor/tasks) file. Here are two examples (both referenced via the [preLaunchTask](https://code.visualstudio.com/Docs/editor/debugging#_launchjson-attributes) members above). Notice that in the case of the .NET Core daprd task (daprd-leaderboard) there is also a [dependsOn](https://code.visualstudio.com/Docs/editor/tasks#_compound-tasks) member that references the build task to ensure the latest code is being run/debugged. The [problemMatcher](https://code.visualstudio.com/Docs/editor/tasks#_defining-a-problem-matcher) is used so that VSCode can understand when the daprd process is up and running.

Let's take a quick look at the args that are being passed to the daprd command.

* -app-id -- the id (how you locate it via service invocation) of your microservice
* -app-port -- the port number that your application code is listening on
* -dapr-http-port -- the http port for the dapr api
* -dapr-grpc-port -- the grpc port for the dapr api
* -placement-host-address -- the location of the placement service (this should be running in docker as it was created when you installed dapr and ran ```dapr init```)

>Note: You  need to ensure that you specify different http/grpc (-dapr-http-port and -dapr-grpc-port) ports for each daprd task that you create, otherwise you  run into port conflicts when you attempt to launch the second configuration.

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "build",
            "command": "dotnet",
            "type": "process",
            "args": [
                "build",
                "${workspaceFolder}/Game/Services/LeaderboardService/LeaderboardService.csproj",
                "/property:GenerateFullPaths=true",
                "/consoleloggerparameters:NoSummary"
            ],
            "problemMatcher": "$msCompile"
        },
        {
            "label": "daprd-web",
            "command": "daprd",
            "args": [
                "-app-id",
                "whac-a-mole--web",
                "-app-port",
                "3000",
                "-dapr-http-port",
                "51000",
                "-dapr-grpc-port",
                "52000",
                "-placement-host-address",
                "localhost:50005"
            ],
            "isBackground": true,
            "problemMatcher": {
                "pattern": [
                    {
                      "regexp": ".",
                      "file": 1,
                      "location": 2,
                      "message": 3
                    }
                ],
                "background": {
                    "beginsPattern": "^.*starting Dapr Runtime.*",
                    "endsPattern": "^.*waiting on port.*"
                }
            }
        },
        {
            "label": "daprd-leaderboard",
            "command": "daprd",
            "args": [
                "-app-id",
                "whac-a-mole--leaderboard",
                "-app-port",
                "5000",
                "-dapr-http-port",
                "51001",
                "-dapr-grpc-port",
                "52001",
                "-placement-host-address",
                "localhost:50005"
            ],
            "isBackground": true,
            "problemMatcher": {
                "pattern": [
                    {
                      "regexp": ".",
                      "file": 1,
                      "location": 2,
                      "message": 3
                    }
                ],
                "background": {
                    "beginsPattern": "^.*starting Dapr Runtime.*",
                    "endsPattern": "^.*waiting on port.*"
                }
            },
            "dependsOn": "build"
        }
    ]
}
```

#### Wrapping up

Once you have made the required changes, you should be able to switch to the [debug](https://code.visualstudio.com/Docs/editor/debugging) view in VSCode and launch your daprized configurations by clicking the "play" button. If everything was configured correctly, you should see daprd launch in the VSCode terminal window and the [debugger](https://code.visualstudio.com/Docs/editor/debugging) should attach to your application (you should see it's output in the debug window).

{{% alert title="Note" color="primary" %}}
Since you didn't launch the service(s) using the **dapr** ***run*** cli command, but instead by running **daprd**, the **dapr** ***list*** command will not show a list of apps that are currently running.
{{% /alert %}}
