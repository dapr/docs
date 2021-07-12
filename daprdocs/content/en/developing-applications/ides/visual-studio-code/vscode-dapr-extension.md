---
type: docs
title: "Dapr Visual Studio Code extension overview"
linkTitle: "Dapr extension"
weight: 10000
description:  "How to develop and run Dapr applications with the Dapr extension"
---


Dapr offers a *preview* [Dapr Visual Studio Code extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-dapr) for local development and debugging of your Dapr applications.

<a href="vscode:extension/ms-azuretools.vscode-dapr" class="btn btn-primary" role="button">Open in VSCode</a>

## Features

### Scaffold Dapr debugging tasks

The Dapr extension helps you debug your applications with Dapr using Visual Studio Code's [built-in debugging capability](https://code.visualstudio.com/Docs/editor/debugging).

Using the `Dapr: Scaffold Dapr Tasks` [Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) operation, you can update your existing `task.json` and `launch.json` files to launch and configure the Dapr sidecar when you begin debugging.

1. Make sure you have a launch configuration set for your app. ([Learn more](https://code.visualstudio.com/Docs/editor/debugging))
1. Open the Command Palette with `Ctrl+Shift+P`
1. Select `Dapr: Scaffold Dapr Tasks`
1. Run your app and the Dapr sidecar with `F5` or via the Run view.

### Scaffold Dapr components

When adding Dapr to your application, you may want to have a dedicated components directory, separate from the default components initialized as part of `dapr init`.

To create a dedicated components folder with the default `statestore`, `pubsub`, and `zipkin` components, use the `Dapr: Scaffold Dapr Components` [Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) operation.

1. Open your application directory in Visual Studio Code
1. Open the Command Palette with `Ctrl+Shift+P`
1. Select `Dapr: Scaffold Dapr Components`
1. Run your application with `dapr run --components-path ./components -- ...`

### View running Dapr applications

The Applications view shows Dapr applications running locally on your machine.

<br /><img src="/images/vscode-extension-view.png" alt="Screenshot of the Dapr VSCode extension view running applications option" width="800">

### Invoke Dapr applications

Within the Applications view, users can right-click and invoke Dapr apps via GET or POST methods, optionally specifying a payload.

<br /><img src="/images/vscode-extension-invoke.png" alt="Screenshot of the Dapr VSCode extension invoke option" width="800">

### Publish events to Dapr applications

Within the Applications view, users can right-click and publish messages to a running Dapr application, specifying the topic and payload.

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
