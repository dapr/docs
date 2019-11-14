# Configuring Visual Studio Code for debugging with daprd

While developing locally in VSCode, you might find it useful to be able to attach the debugger to your code that is utilizing Dapr. To do this, you can run the daprd process separately and then launch your code and attach the debugger. While this is a perfectly acceptable solution, it does require a few extra steps and some instruction to developers who might want to clone your repo and hit the "play" button to begin debugging.

Using the ***tasks.json*** and ***launch.json*** files in Visual Studio Code, we can simplify the process and request that VSCode kick off the daprd process prior to launching the debugger.

Let's get started!

## Modifying launch.json configurations to include a preLaunchTask

In your ***launch.json*** file add a **preLaunchTask** for each configuration that you want daprd launched. The **preLaunchTask** will reference tasks that you define in your tasks.json file. Here is an example for both Node and .NET Core. Notice the **preLaunchTask**s referenced: daprd-web and daprd-leaderboard.

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

## Adding daprd tasks to tasks.json

You will need to define a task and problem matcher for daprd in your ***tasks.json*** file. Here are two examples (both referenced via the **preLaunchTask** members above). Notice that in the case of the .NET Core daprd task (daprd-leaderboard) there is also a **dependsOn** member that references the build task to ensure the latest code is being run/debugged. The **problemMatcher** is used so that VSCode can understand when the daprd process is up and running.

Let's take a quick look at the args that are being passed to the daprd command.

* -dapr-id -- the id (how you will locate it via service invocation) of your microservice
* -app-port -- the port number that your application code is listening on
* -dapr-http-port -- the http port for the dapr api
* -dapr-grpc-port -- the grpc port for the dapr api
* -placement-address -- the location of the placement service (this should be running in docker as it was created when you installed dapr and ran ```dapr init```)

>**Note: You will need to ensure that you specify different http/grpc (-dapr-http-port and -dapr-grpc-port) ports for each daprd task that you create, otherwise you will run into port conflicts when you attempt to launch the second configuration.**

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
                "-dapr-id",
                "whac-a-mole--web",
                "-app-port",
                "3000",
                "-dapr-http-port",
                "51000",
                "-dapr-grpc-port",
                "52000",
                "-placement-address",
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
                "-dapr-id",
                "whac-a-mole--leaderboard",
                "-app-port",
                "5000",
                "-dapr-http-port",
                "51001",
                "-dapr-grpc-port",
                "52001",
                "-placement-address",
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

## Wrapping up

Once you have made the required changes, you should be able to switch to the debug view in VSCode and launch your "daprized" configurations by clicking the "play" button. If everything was configured correctly, you should see daprd launch in the VSCode terminal window and the debugger should attach to your application (you should see it's output in the debug window). Happy debugging!
