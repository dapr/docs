# Application development with TypeScript

<!-- TOC depthFrom:2 -->

- [Prerequisites](#prerequisites)
- [Using VS Code remote containers for your application development](#using-vs-code-remote-containers-for-your-application-development)
    - [Advanced: Docker volume for storing the Node modules](#advanced-docker-volume-for-storing-the-node-modules)
- [Prepare your workspace](#prepare-your-workspace)
- [Linting](#linting)
- [Production](#production)
    - [Create your production container image](#create-your-production-container-image)
- [Development](#development)
    - [Run in standalone mode](#run-in-standalone-mode)
    - [Debugging via VS Code](#debugging-via-vs-code)

<!-- /TOC -->

## Prerequisites

Prerequsities for running the demo application:

1. Docker
2. Node 12 (not required on host machine in case of VS Code remote containers)

## Using VS Code remote containers for your application development

> ℹ️ Dapr has pre-built Docker remote containers for each of the language SDKs. Note these pre-built containers automatically update to the latest Dapr release. If you want to lock on a specific Dapr release, you've to manually modify the generated `./.devcontainer/Dockerfile`

These are the steps to use the Dapr Remote Container for TypeScript applications:

1. Open your application workspace in VS Code
2. In the command palette select `Remote-Containers: Add Development Container Configuration Files...` > `Show All Definitions`
3. Type `dapr` to filter the list and choose `Dapr with Node.js 12 & TypeScript`
5. In the command palette select `Remote-Containers: Reopen in Container`

### Advanced: Docker volume for storing the Node modules

To speed up the `npm install` command on Windows and macOS you can mount your `./node_modules` folder using a named volume. See "[use a targeted named volume](https://code.visualstudio.com/docs/remote/containers-advanced#_use-a-targeted-named-volume)" for further details.

> ℹ️ Docker volumes are especially helpful on Windows to avoid issues with the Windows filesystem during the Node modules installation

```yaml
# ./.devcontainer/docker-compose.yml
services:
  docker-in-docker:
    volumes:
      - workspace_node_modules:/workspace/node_modules

volumes:
  workspace_node_modules:
```

## Prepare your workspace

After the initial checkout of the application you need to install all required dependencies.

> ℹ️ In case you're using the VSCode remote container setup, please run this command (and all following commands) inside of your dev container and not directly on the host machine

```
npm install
```

## Linting

This demo project uses ESLint for linting in combination with the [ESLint standard configuration](https://github.com/standard/eslint-config-standard).

## Production

Create the production build

> ℹ️ ECMAScript target version is set to `es2019`.

```
npm run dist
```

The transpiled JavaScript code will be located in the `./dist` folder and can be copied from there into your final container image.

Test your production build in standalone mode

```
dapr run --app-id demo-node-app node dist/main.js
```

### Create your production container image

An exemplary `Dockerfile` has been added to this demo project to demonstrate how you can package your Dapr application into a container image. This image uses `node:12-alpine` as a base image and implements some of the best practices listed in "[Docker and Node.js Best Practices](https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md)". To build the container image run the following commands

```
npm run dist
docker build -t dapr-typescript-example-app .
```

## Development

### Run in standalone mode

> ⚠️ Do not use this command for running your application in production

Run the application in standalone mode

```
npm start
```

You can also set a custom App ID via the `--app-id` argument

```
npm start --app-id=my-custom-app-id
```

### Debugging via VS Code

Navigate to the run view and select `Node Launch w/Dapr`. All necessary configurations are already included in the `.vscode` folder.

Alternatively, you can also use the VSCode Dapr Extension for creating all neccecary debug configurations, see "[Visual Studio Code Dapr extension](https://github.com/dapr/docs/tree/master/howto/vscode-debugging-daprd#visual-studio-code-dapr-extension)".
