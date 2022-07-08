---
type: docs
title: "Developing Dapr applications with remote dev containers"
linkTitle: "Remote dev containers"
weight: 20000
description:  "How to setup a remote dev container environment with Dapr"
---

The Visual Studio Code [Remote Containers extension](https://code.visualstudio.com/docs/remote/containers) lets you use a Docker container as a full-featured development environment without installing any additional frameworks or packages to your local filesystem.

Dapr has pre-built Docker remote containers for NodeJS and C#. You can pick the one of your choice for a ready made environment. Note these pre-built containers automatically update to the latest Dapr release.

### Setup a remote dev container

#### Prerequisites
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Visual Studio Code](https://code.visualstudio.com/)
- [VSCode Remote Development extension pack](https://aka.ms/vscode-remote/download/extension)
<!-- END_IGNORE -->
#### Create remote Dapr container
1. Open your application workspace in VS Code
2. In the command command palette (`CTRL+SHIFT+P`) type and select `Remote-Containers: Add Development Container Configuration Files...`
    <br /><img src="/images/vscode-remotecontainers-addcontainer.png" alt="Screenshot of adding a remote container" width="700">
3. Type `dapr` to filter the list to available Dapr remote containers and choose the language container that matches your application. Note you may need to select `Show All Definitions...`
    <br /><img src="/images/vscode-remotecontainers-daprcontainers.png" alt="Screenshot of adding a Dapr container" width="700">
4. Follow the prompts to rebuild your application in container.
    <br /><img src="/images/vscode-remotecontainers-reopen.png" alt="Screenshot of reopening an application in the dev container" width="700">

#### Example
Watch this [video](https://www.youtube.com/watch?v=D2dO4aGpHcg&t=120) on how to use the Dapr VS Code Remote Containers with your application.
<iframe width="560" height="315" src="https://www.youtube.com/embed/D2dO4aGpHcg?start=120" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>