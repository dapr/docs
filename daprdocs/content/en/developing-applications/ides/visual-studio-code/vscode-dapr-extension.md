---
type: docs
title: "Dapr Visual Studio Code extension overview"
linkTitle: "Overview"
weight: 10000
description:  "How to develop and run Dapr applications with the Dapr extension"
---


Dapr offers a *preview* [Dapr Visual Studio Code extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-dapr) for local development and debugging of your Dapr applications.

<a href="vscode:extension/ms-azuretools.vscode-dapr" class="btn btn-primary" role="button">Open in VSCode</a>

## Features

### Scaffold Dapr tasks 

* Helps scaffold VS Code task.json and launch.json configurations needed to debug your application within the Dapr environment.
* Requires an already existing launch.json files to be found in the VS Code workspace.
* Example NodeJS app:


Before scaffolding version of launch.json configurations:
```json
{
     "version": "0.2.0",
     "configurations": [
        {
            "type": "pwa-node",
            "request": "launch",
            "name": "Launch Program",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "program": "${workspaceFolder}/app.js"
        }
}
```
After scaffolding version of launch.json:
```json
{
     "version": "0.2.0",
     "configurations": [
        {
            "type": "pwa-node",
            "request": "launch",
            "name": "Launch Program",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "program": "${workspaceFolder}/app.js"
        },
        {
            "type": "pwa-node",
            "request": "launch",
            "name": "Launch Program with Dapr",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "program": "${workspaceFolder}/app.js",
            "preLaunchTask": "daprd-debug",
            "postDebugTask": "daprd-down"
        }
}
```
After scaffolding task.json:

```json
{
	"version": "2.0.0",
	"tasks": [
		{
			"appId": "nodeapp",
			"appPort": 3500,
			"label": "daprd-debug",
			"type": "daprd"
		},
		{
			"appId": "nodeapp",
			"label": "daprd-down",
			"type": "daprd-down"
		}
	]
}
```

### Scaffold Dapr components 
* Generates the Dapr component assets needed for general Dapr applications.
* Provides a Component folder in your VS Code workspace that contains pubsub, statestore and a zipkin yaml file.
* Example pubsub file:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.redis
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
```

### View running Dapr applications
* The Applications view shows Dapr applications running locally on your machine.
<br /><img src="/images/vscode-extension-view.png" alt="Screenshot of the Dapr VSCode extension view running applications option" width="800">

### Invoke Dapr application methods
* Allows users to select a Dapr application found in the tree view "Applications" and invoke GET/POST methods by name.
* Allows users to specify an optional payload for POST methods
<br /><img src="/images/vscode-extension-invoke.png" alt="Screenshot of the Dapr VSCode extension invoke option" width="800">

### Publish events to Dapr applications
* Within the Applications view, users can right-click and publish messages to a running Dapr application, specifying the topic and payload.
Users can also publish messages to all running applications.
  <br /><img src="/images/vscode-extension-publish.png" alt="Screenshot of the Dapr VSCode extension publish option" width="800">


## Telemetry

### Data collection

The software may collect information about you and your use of the software and send it to Microsoft. Microsoft may use this information to provide services and improve our products and services. You may turn off the telemetry as described [in the repository](https://github.com/microsoft/vscode-dapr). There are also some features in the software that may enable you and Microsoft to collect data from users of your applications. If you use these features, you must comply with applicable law, including providing appropriate notices to users of your applications together with a copy of Microsoft's privacy statement. Microsoft's privacy statement is located at https://go.microsoft.com/fwlink/?LinkID=824704. You can learn more about data collection and use in the help documentation and privacy statement. Your use of the software operates as your consent to these practices.

### Disabling Telemetry
If you don’t wish to send usage data to Microsoft, you can set the `telemetry.enableTelemetry` setting to `false`. Learn more in the VSCode [FAQ](https://code.visualstudio.com/docs/supporting/faq#_how-to-disable-telemetry-reporting).

## Additional resources

### Debugging multiple Dapr applications at the same time
Using the VS Code extension, you can debug multiple Dapr applications at the same time with [Multi-target debugging](https://code.visualstudio.com/docs/editor/debugging#_multitarget-debugging).
### Community call demo
Watch this [video](https://www.youtube.com/watch?v=OtbYCBt9C34&t=85) on how to use the Dapr VS Code extension:
<iframe width="560" height="315" src="https://www.youtube.com/embed/OtbYCBt9C34?start=85" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>