---
type: docs
title: "Developing gRPC-based Components"
linkTitle: "Developing gRPC-based Components"
weight: 250
description: "Extending Dapr with external gRPC-based components"
---

## Pluggable Components Overview

Out of the box, Dapr [building blocks] come with integrations to a wide range of cloud providers and open source solutions. We call each of these individual integrations _"components"_. For instance, a input biding integration for MySql is a _[component]_ and a state store integration for MySQL would be a different component.

<img src="/images/concepts-building-blocks.png" width=250>

Sometimes one needs to integrate Dapr with something for which there is no existing component. When that happens, it might be time to invest on the creation of a new component.

Traditionally, Dapr components are

- written in Go,
- are run as part of the same executable as Dapr itself,
- integrated directly with Dapr codebase,
- are distributed and hosted with the rest of Dapr codebase.

Creating a new component for Dapr is not a huge undertaking and doing so helps not only a single developer or team but the whole Dapr community.

There are circumstances for which creating a traditional Dapr component might not be feasible. For instance, for teams with no familiarity with Go. Or teams that don't want to depend on Dapr release cycle or community process for onboarding new components. Or even teams that don't want or, for a variety of reasons, can't integrate their component codebase with Dapr. For those situations there is an alternative method of extending Dapr with new functionality: gRPC Pluggable Components.

### gRPC Pluggable Components

<!-- TODO what of gRPC pluggable components? -->

gRPC Pluggable Components as an alternative way of adding new integrations and functionality to Dapr. They differ from "traditional" or (embedded?) components in the following ways:

- They can be written in any [gRPC-supported programming language](https://grpc.io/docs/languages/).
- They run in a distinct process, container or pod than Dapr itself.
- They integrate with Dapr by means well defined SPI (Service Provider Interface) defined using [gRPC] through [Unix Domain Sockets][uds].
- They can be distributed independently from Dapr itself, on their own repository, with their own release cycle.

`Insert picture of a pluggable component here`

<!-- Component: is a piece of (Go) code that bridges Dapr concepts, formats and behavior to the ones used by the new integration. -->

<!-- TODO why of gRPC pluggable components? -->
<!-- What is cool interesting about developing components as gRPC pluggable components? What are the benefits? -->

[gRPC-based][grpc] Dapr components are typically run as containers or processes that communicate with the Dapr main process via [Unix Domain Sockets][uds].

<!-- TODO how of gRPC pluggable components? -->

## Developing a Pluggable Component from scratch

{{< tabs ".NET" >}}
{{% codetab %}}

### Step 1: Prerequisites

For this tutorial, you must:

1. Have some knowledge of how to use and build services using [gRPC and protocol buffers][grpc]. In doubt, check the their [Quick Start](https://grpc.io/docs/languages/csharp/quickstart/) and [Basics tutorial](https://grpc.io/docs/languages/csharp/quickstart/).
2. Use a [gRPC-supported programming language](https://grpc.io/docs/languages/).
3. Have an operating system that supports Unix Domain Sockets.

For simplicity, all code samples uses the generated code from the [protoc](https://developers.google.com/protocol-buffers/docs/downloads) tool or supported gRPC build tools by languages.

As previously mentioned, Dapr uses a Unix Domain Socket to communicate with gRPC-based components, which means that as a prerequisite you also need a UNIX-like system, or for Windows users, [WSL](https://learn.microsoft.com/windows/wsl/install) should be sufficient.

Install [.NET Core 6+](https://dotnet.microsoft.com/download)

This tutorial is based on the [official Microsoft documentation for development using Protocol Buffers](https://learn.microsoft.com/aspnet/core/grpc/basics?view=aspnetcore-6.0#c-tooling-support-for-proto-files).

### Step 2: Downloading the base template project

We've prepared a blueprint project that helps you to skip a few manual steps like cloning Dapr repository and adding the required libraries. Get started by downloading and unzipping it using the following <a href="/code/dotnet-memstore.zip">link</a>.

This template contains all the required changes to start developing a gRPC-based component from scratch, including protobuf definitions and an unimplemented in-memory StateStore that you are going to implement.

### Step 3: Building and running

At this point, you are ready to build and run the component. Let's test it out by running `dotnet build`

```
$  DaprMemStoreComponent dotnet build
MSBuild version 17.3.0+92e077650 for .NET
  Determining projects to restore...
  All projects are up-to-date for restore.
  DaprMemStoreComponent -> [redacted]

Build succeeded.
    0 Warning(s)
    0 Error(s)

Time Elapsed 00:00:01.03
```

Great! You've just built your first gRPC-based pluggable component: an in-memory StateStore component!

Now, let's run this StateStore service by issuing a `dotnet run`

```
$  DaprMemStoreComponent dotnet run
Building...
warn: Microsoft.AspNetCore.Server.Kestrel[0]
      Overriding address(es) 'http://localhost:5259, https://localhost:7089'. Binding to endpoints defined via IConfiguration and/or UseKestrel() instead.
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://unix:/tmp/Dapr-components-sockets/memstore.sock
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
info: Microsoft.Hosting.Lifetime[0]
      Hosting environment: Development
info: Microsoft.Hosting.Lifetime[0]
```

To see it working, you can use the [grpc_cli](https://github.com/grpc/grpc/blob/master/doc/command_line_tool.md) tool for making gRPC calls. You can download and use it or use your preferred tool.

Once properly downloaded and installed, open a new terminal instance, and let's invoke the `Features` method from the StateStore service, using the following command: `grpc_cli call unix:///tmp/Dapr-components-sockets/memstore.sock Features ''`

```
$ memstore-dotnet grpc_cli call unix:///tmp/Dapr-components-sockets/memstore.sock Features ''
connecting to unix:///tmp/Dapr-components-sockets/memstore.sock
Received trailing metadata from server:
content-length : 0
date : Thu, 29 Sep 2022 18:26:54 GMT
server : Kestrel
Rpc failed with status code 12, error message:
```

Great, don't worry about errors for now.

Now you are ready to go,

### Step 4: Implementing an In-Memory StateStore

<img src="/images/pluggable-component-arch.png" width=800 alt="Diagram showing the final MemStore design">

Go to your `MemStoreService.cs` and let's override the Features method.

```csharp
using Dapr.Client.Autogen.Grpc.v1;
using Dapr.Proto.Components.V1;
using Grpc.Core;

namespace DaprMemStoreComponent.Services;

public class MemStoreService : StateStore.StateStoreBase
{
    private readonly ILogger<MemStoreService> _logger;
    public MemStoreService(ILogger<MemStoreService> logger)
    {
        _logger = logger;
    }

    public override Task<FeaturesResponse> Features(FeaturesRequest request, ServerCallContext ctx)
    {
        return Task.FromResult(new FeaturesResponse { });
    }
}

```

Great, stop the current `dotnet run` execution and reissue the run command.

Let's make the same call as you did before: `grpc_cli call unix:///tmp/Dapr-components-sockets/memstore.sock Features ''`

Now you should get the OK as a response;

```
$ memstore-dotnet grpc_cli call unix:///tmp/Dapr-components-sockets/memstore.sock Features ''
connecting to unix:///tmp/Dapr-components-sockets/memstore.sock
Received initial metadata from server:
date : Fri, 30 Sep 2022 14:36:56 GMT
server : Kestrel
Rpc succeeded with OK status
```

As the goal here is to create a simple in-memory statestore, let's use a .NET `ConcurrentDictionary` as component persistence layer. Go again to the `MemStoreService.cs`

> Note: It should be static because the framework recreates your StateStore for every request.

```csharp
using System.Collections.Concurrent;
using Dapr.Client.Autogen.Grpc.v1;
using Dapr.Proto.Components.V1;
using Grpc.Core;

namespace DaprMemStoreComponent.Services;

public class MemStoreService : StateStore.StateStoreBase
{
    private readonly ILogger<MemStoreService> _logger;
    private readonly static IDictionary<string, string?> Storage = new ConcurrentDictionary<string, string?>();
    public MemStoreService(ILogger<MemStoreService> logger)
    {
        _logger = logger;
    }

    public override Task<FeaturesResponse> Features(FeaturesRequest request, ServerCallContext ctx)
    {
        return Task.FromResult(new FeaturesResponse { });
    }
}

```

Now let's override the Get, Set and BulkSet methods,

```csharp
using System.Collections.Concurrent;
using Dapr.Client.Autogen.Grpc.v1;
using Dapr.Proto.Components.V1;
using Google.Protobuf;
using Grpc.Core;

namespace DaprMemStoreComponent.Services;

public class MemStoreService : StateStore.StateStoreBase
{
    private readonly ILogger<MemStoreService> _logger;
    private readonly static IDictionary<string, string?> Storage = new ConcurrentDictionary<string, string?>();
    public MemStoreService(ILogger<MemStoreService> logger)
    {
        _logger = logger;
    }

    public override Task<FeaturesResponse> Features(FeaturesRequest request, ServerCallContext ctx)
    {
        return Task.FromResult(new FeaturesResponse { });
    }

    public override Task<GetResponse> Get(GetRequest request, ServerCallContext ctx)
    {
        if (Storage.TryGetValue(request.Key, out var data))
        {
            return Task.FromResult(new GetResponse
            {
                Data = ByteString.CopyFromUtf8(data),
            });
        }
        return Task.FromResult(new GetResponse { }); // in case of not found you should not return any error.
    }

    public override Task<SetResponse> Set(SetRequest request, ServerCallContext ctx)
    {
        Storage[request.Key] = request.Value?.ToStringUtf8();
        return Task.FromResult(new SetResponse());
    }

    public override Task<BulkSetResponse> BulkSet(BulkSetRequest request, ServerCallContext ctx)
    {
        foreach (var item in request.Items)
        {
            Storage[item.Key] = item.Value?.ToStringUtf8();
        }
        return Task.FromResult(new BulkSetResponse { });
    }
}
```

Great, let's re-run your service and try out a simple set call:

```shell
grpc_cli call unix:///tmp/Dapr-components-sockets/memstore.sock Dapr.proto.components.v1.StateStore/Set "key:'my_key', value:'my_value'"
```

You should receive an OK

```
$ memstore-dotnet grpc_cli call unix:///tmp/Dapr-components-sockets/memstore.sock Dapr.proto.components.v1.StateStore/Set "key:'my_key', value:'my_value'"
connecting to unix:///tmp/Dapr-components-sockets/memstore.sock
Received initial metadata from server:
date : Fri, 30 Sep 2022 14:49:38 GMT
server : Kestrel
Rpc succeeded with OK status
```

Now let's retrieve the value,

```shell
grpc_cli call unix:///tmp/Dapr-components-sockets/memstore.sock Dapr.proto.components.v1.StateStore/Get "key:'my_key'"
```

```
$  memstore-dotnet grpc_cli call unix:///tmp/Dapr-components-sockets/memstore.sock Dapr.proto.components.v1.StateStore/Get "key:'my_key'"

connecting to unix:///tmp/Dapr-components-sockets/memstore.sock
Received initial metadata from server:
date : Fri, 30 Sep 2022 15:36:00 GMT
server : Kestrel
data: "my_value"
Rpc succeeded with OK status
```

At this point your component is partially implemented, more methods like `bulk*` operations should be added to consider functionally complete, but there are two important methods that should be implemented to consider ready to be used by Dapr, they are `Init` and `Ping` methods.

### Step 5: Init and Ping

The Dapr runtime uses the ping method as a liveness probe, so it's up to you to decide what is `liveness` from your component point of view. As a simple implementation, `Ping` can just respond back without any deep check, but implementing it is a requirement to work with Daprd.

```csharp
    public override Task<PingResponse> Ping(PingRequest request, ServerCallContext ctx)
    {
        return Task.FromResult(new PingResponse());
    }
```

Init method is called as part of Dapr initialization, it is called at first before any interaction with others components methods. The component can use init to create database connections, make async calls or whatever is necessary to consider your component ready to work, be mindful on time consuming operations because there are timeouts associated to initializing components.

Init receives component metadata as a parameter and there are no semantics associated with it, metadata can be anything the component needs to be ready, like connection strings, timeouts or services addresses.

Let's see the final MemStoreService version,

```csharp
using System.Collections.Concurrent;
using Dapr.Client.Autogen.Grpc.v1;
using Dapr.Proto.Components.V1;
using Google.Protobuf;
using Grpc.Core;

namespace DaprMemStoreComponent.Services;

public class MemStoreService : StateStore.StateStoreBase
{
    private readonly ILogger<MemStoreService> _logger;
    private readonly static IDictionary<string, string?> Storage = new ConcurrentDictionary<string, string?>();
    public MemStoreService(ILogger<MemStoreService> logger)
    {
        _logger = logger;
    }

    public override Task<FeaturesResponse> Features(FeaturesRequest request, ServerCallContext ctx)
    {
        return Task.FromResult(new FeaturesResponse { });
    }

    public override Task<GetResponse> Get(GetRequest request, ServerCallContext ctx)
    {
        if (Storage.TryGetValue(request.Key, out var data))
        {
            return Task.FromResult(new GetResponse
            {
                Data = ByteString.CopyFromUtf8(data),
            });
        }
        return Task.FromResult(new GetResponse { }); // in case of not found you should not return any error.
    }

    public override Task<SetResponse> Set(SetRequest request, ServerCallContext ctx)
    {
        Storage[request.Key] = request.Value?.ToStringUtf8();
        return Task.FromResult(new SetResponse());
    }

    public override Task<BulkSetResponse> BulkSet(BulkSetRequest request, ServerCallContext ctx)
    {
        foreach (var item in request.Items)
        {
            Storage[item.Key] = item.Value?.ToStringUtf8();
        }
        return Task.FromResult(new BulkSetResponse { });
    }

    public override Task<InitResponse> Init(InitRequest request, ServerCallContext ctx)
    {
        return Task.FromResult(new InitResponse { });
    }

    public override Task<PingResponse> Ping(PingRequest request, ServerCallContext ctx)
    {
        return Task.FromResult(new PingResponse());
    }
}
```

> There are other missing methods like `bulk*` and `delete`, however at this point you might be able to implement it without any issues.

{{% /codetab %}}

{{< /tabs >}}

## Next Steps

- Follow these guides on:
  - [How-To: Use a gRPC-based Pluggable Component]({{< ref using-grpc-components.md >}})

[building blocks]: {{< ref building-blocks-concept >}}
[gRPC]: https://grpc.io/
[UDS]: https://en.wikipedia.org/wiki/Unix_domain_socket
[component]: {{< ref components-concept.md >}}
