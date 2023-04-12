---
type: docs
title: "Developing Dapr applications with Dev Containers"
linkTitle: "Dev Containers"
weight: 30000
description:  "How to setup a containerized development environment with Dapr"
---

The Visual Studio Code [Dev Containers extension](https://code.visualstudio.com/docs/remote/containers) lets you use a self-contained Docker container as a complete development environment, without installing any additional packages, libraries, or utilities in your local filesystem.

Dapr has pre-built Dev Containers for C# and JavaScript/TypeScript; you can pick the one of your choice for a ready made environment. Note these pre-built containers automatically update to the latest Dapr release.

We also publish a Dev Container feature that installs the Dapr CLI inside any Dev Container.

## Setup the development environment

### Prerequisites

- [Docker Desktop](https://docs.docker.com/desktop/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [VS Code Remote Development extension pack](https://aka.ms/vscode-remote/download/extension)

### Add the Dapr CLI using a Dev Container feature

You can install the Dapr CLI inside any Dev Container using [Dev Container features](https://containers.dev/features).

To do that, edit your `devcontainer.json` and add two objects in the `"features"` section:

```json
"features": {
    // Install the Dapr CLI
    "ghcr.io/dapr/cli/dapr-cli:0": {},
    // Enable Docker (via Docker-in-Docker)
    "ghcr.io/devcontainers/features/docker-in-docker:2": {},
    // Alternatively, use Docker-outside-of-Docker (uses Docker in the host)
    //"ghcr.io/devcontainers/features/docker-outside-of-docker:1": {},
}
```

After saving the JSON file and (re-)building the container that hosts your development environment, you will have the Dapr CLI (and Docker) available, and can install Dapr by running this command in the container:

```sh
dapr init
```

#### Example: create a Java Dev Container for Dapr

This is an exmaple of creating a Dev Container for creating Java apps that use Dapr, based on the [official Java 17 Dev Container image](https://github.com/devcontainers/images/tree/main/src/java).

Place this in a file called `.devcontainer/devcontainer.json` in your project:

```json
// For format details, see https://aka.ms/devcontainer.json. For config options, see the
// README at: https://github.com/devcontainers/templates/tree/main/src/java
{
	"name": "Java",
	// Or use a Dockerfile or Docker Compose file. More info: https://containers.dev/guide/dockerfile
	"image": "mcr.microsoft.com/devcontainers/java:0-17",

	"features": {
		"ghcr.io/devcontainers/features/java:1": {
			"version": "none",
			"installMaven": "false",
			"installGradle": "false"
		},
        // Install the Dapr CLI
        "ghcr.io/dapr/cli/dapr-cli:0": {},
        // Enable Docker (via Docker-in-Docker)
        "ghcr.io/devcontainers/features/docker-in-docker:2": {},
        // Alternatively, use Docker-outside-of-Docker (uses Docker in the host)
        //"ghcr.io/devcontainers/features/docker-outside-of-docker:1": {},
	}

	// Use 'forwardPorts' to make a list of ports inside the container available locally.
	// "forwardPorts": [],

	// Use 'postCreateCommand' to run commands after the container is created.
	// "postCreateCommand": "java -version",

	// Configure tool-specific properties.
	// "customizations": {},

	// Uncomment to connect as root instead. More info: https://aka.ms/dev-containers-non-root.
	// "remoteUser": "root"
}
```

Then, using the VS Code command palette (`CTRL + SHIFT + P` or `CMD + SHIFT + P` on Mac), select `Dev Containers: Rebuild and Reopen in Container`.

### Use a pre-built Dev Container (C# and JavaScript/TypeScript)

1. Open your application workspace in VS Code
2. In the command command palette (`CTRL + SHIFT + P` or `CMD + SHIFT + P` on Mac) type and select `Dev Containers: Add Development Container Configuration Files...`
    <br /><img src="/images/vscode-remotecontainers-addcontainer.png" alt="Screenshot of adding a remote container" width="700">
3. Type `dapr` to filter the list to available Dapr remote containers and choose the language container that matches your application. Note you may need to select `Show All Definitions...`
    <br /><img src="/images/vscode-remotecontainers-daprcontainers.png" alt="Screenshot of adding a Dapr container" width="700">
4. Follow the prompts to reopen your workspace in the container.
    <br /><img src="/images/vscode-remotecontainers-reopen.png" alt="Screenshot of reopening an application in the dev container" width="700">

#### Example

Watch this [video](https://www.youtube.com/watch?v=D2dO4aGpHcg&t=120) on how to use the Dapr Dev Containers with your application.

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/D2dO4aGpHcg?start=120" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>