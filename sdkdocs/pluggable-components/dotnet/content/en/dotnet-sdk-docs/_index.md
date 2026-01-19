---
type: docs
title: "Getting started with the Dapr pluggable components .NET SDK"
linkTitle: ".NET"
weight: 1000
description: How to get up and running with the Dapr pluggable components .NET SDK
no_list: true
is_preview: true
cascade:
  github_repo: https://github.com/dapr-sandbox/components-dotnet-sdk
  github_subdir: daprdocs/content/en/dotnet-sdk-docs
  path_base_for_github_subdir: content/en/developing-applications/develop-components/pluggable-components/pluggable-components-sdks/pluggable-components-dotnet/
  github_branch: main
---

Dapr offers NuGet packages to help with the development of .NET pluggable components.

## Prerequisites

- [.NET 6 SDK](https://dotnet.microsoft.com/download/dotnet) or later
- [Dapr 1.9 CLI]({{% ref install-dapr-cli.md %}}) or later
- Initialized [Dapr environment]({{% ref install-dapr-selfhost.md %}})
- Linux, Mac, or Windows (with WSL)

{{% alert title="Note" color="primary" %}}
Development of Dapr pluggable components on Windows requires WSL as some development platforms do not fully support Unix Domain Sockets on "native" Windows.
{{% /alert %}}

## Project creation

Creating a pluggable component starts with an empty ASP.NET project.

```bash
dotnet new web --name <project name>
```

## Add NuGet packages

Add the Dapr .NET pluggable components NuGet package.

```bash
dotnet add package Dapr.PluggableComponents.AspNetCore
```

## Create application and service

Creating a Dapr pluggable component application is similar to creating an ASP.NET application.  In `Program.cs`, replace the `WebApplication` related code with the Dapr `DaprPluggableComponentsApplication` equivalent.

```csharp
using Dapr.PluggableComponents;

var app = DaprPluggableComponentsApplication.Create();

app.RegisterService(
    "<socket name>",
    serviceBuilder =>
    {
        // Register one or more components with this service.
    });

app.Run();
```

This creates an application with a single service. Each service:

- Corresponds to a single Unix Domain Socket
- Can host one or more component types

{{% alert title="Note" color="primary" %}}
Only a single component of each type can be registered with an individual service. However, [multiple components of the same type can be spread across multiple services]({{% ref dotnet-multiple-services %}}).
{{% /alert %}}

## Implement and register components

 - [Implementing an input/output binding component]({{% ref dotnet-bindings %}})
 - [Implementing a pub-sub component]({{% ref dotnet-pub-sub %}})
 - [Implementing a state store component]({{% ref dotnet-state-store %}})

## Test components locally

Pluggable components can be tested by starting the application on the command line and configuring a Dapr sidecar to use it.

To start the component, in the application directory:

```bash
dotnet run
```

To configure Dapr to use the component, in the resources path directory:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <component name>
spec:
  type: state.<socket name>
  version: v1
  metadata:
  - name: key1
    value: value1
  - name: key2
    value: value2
```

Any `metadata` properties will be passed to the component via its `IPluggableComponent.InitAsync()` method when the component is instantiated.

To start Dapr (and, optionally, the service making use of the service):

```bash
dapr run --app-id <app id> --resources-path <resources path> ...
```

At this point, the Dapr sidecar will have started and connected via Unix Domain Socket to the component. You can then interact with the component either:
- Through the service using the component (if started), or 
- By using the Dapr HTTP or gRPC API directly

## Create Container

There are several ways to create a container for your component for eventual deployment.

### Use .NET SDK

The [.NET 7 and later SDKs](https://dotnet.microsoft.com/download/dotnet) enable you to create a .NET-based container for your application *without* a `Dockerfile`, even for those targeting earlier versions of the .NET SDK. This is probably the simplest way of generating a container for your component today.

{{% alert title="Note" color="primary" %}}
Currently, the .NET 7 SDK requires Docker Desktop on the local machine, a special NuGet package, and Docker Desktop on the local machine to build containers. Future versions of .NET SDK plan to eliminate those requirements.

Multiple versions of the .NET SDK can be installed on the local machine at the same time.
{{% /alert %}}

Add the `Microsoft.NET.Build.Containers` NuGet package to the component project.

```bash
dotnet add package Microsoft.NET.Build.Containers
```

Publish the application as a container:

```bash
dotnet publish --os linux --arch x64 /t:PublishContainer -c Release
```

{{% alert title="Note" color="primary" %}}
Ensure the architecture argument `--arch x64` matches that of the component's ultimate deployment target. By default, the architecture of the generated container matches that of the local machine. For example, if the local machine is ARM64-based (for example, a M1 or M2 Mac) and the argument is omitted, an ARM64 container will be generated which may not be compatible with deployment targets expecting an AMD64 container.
{{% /alert %}}

For more configuration options, such as controlling the container name, tag, and base image, see the [.NET publish as container guide](https://learn.microsoft.com/dotnet/core/docker/publish-as-container).

### Use a Dockerfile

While there are tools that can generate a `Dockerfile` for a .NET application, the .NET SDK itself does not. A typical `Dockerfile` might look like:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:<runtime> AS base
WORKDIR /app

# Creates a non-root user with an explicit UID and adds permission to access the /app folder
# For more info, please refer to https://aka.ms/vscode-docker-dotnet-configure-containers
RUN adduser -u 5678 --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

FROM mcr.microsoft.com/dotnet/sdk:<runtime> AS build
WORKDIR /src
COPY ["<application>.csproj", "<application folder>/"]
RUN dotnet restore "<application folder>/<application>.csproj"
COPY . .
WORKDIR "/src/<application folder>"
RUN dotnet build "<application>.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "<application>.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "<application>.dll"]
```

Build the image:

```bash
docker build -f Dockerfile -t <image name>:<tag> .
```

{{% alert title="Note" color="primary" %}}
Paths for `COPY` operations in the `Dockerfile` are relative to the Docker context passed when building the image, while the Docker context itself will vary depending on the needs of the project being built (for example, if it has referenced projects). In the example above, the assumption is that the Docker context is the component project directory.
{{% /alert %}}

## Demo

Watch this video for a [demo on building pluggable components with .NET](https://youtu.be/s1p9MNl4VGo?t=1606):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/s1p9MNl4VGo?start=1606" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Next steps

- [Learn advanced steps for the Pluggable Component .NET SDK]({{% ref "dotnet-advanced" %}})
- Learn more about using the Pluggable Component .NET SDK for:
  - [Bindings]({{% ref "dotnet-bindings" %}})
  - [Pub/sub]({{% ref "dotnet-pub-sub" %}})
  - [State store]({{% ref "dotnet-state-store" %}})