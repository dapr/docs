---
type: docs
title: "Developing pluggable components (.NET)"
linkTitle: "How-to: Develop external pluggable components"
weight: 4500
description: "Process for developing external gRPC components"
---

If you haven't already, make sure to read through the tutorial for gRPC pluggable components. The tutorial details many of the steps found here but in greater depth. 

{{< tabs ".NET" >}}
{{% codetab %}}

## Download, build and run an external gRPC Component 

### Prerequisites
- [Familiarity with gRPC and protocol buffers][grpc]. 
- [A gRPC-supported programming language](https://grpc.io/docs/languages/).
- Operating system that supports Unix Domain Sockets.
- UNIX or UNIX-like system (Mac, Linux, or [WSL](https://learn.microsoft.com/windows/wsl/install) for Windows users)
- [.NET Core 6+](https://dotnet.microsoft.com/download)
- [grpc_cli tool](https://github.com/grpc/grpc/blob/master/doc/command_line_tool.md) for making gRPC calls

### Download, Build and Run Template files
To get started, download the zip files for the template component, [DaprMemStoreComponent](link). The template The files provided are written for a in-memory state-store component but can be used for other component-types like pubsub components or binding components. 

Open the `MemStoreService.cs` file.

```csharp
using Dapr.Proto.Components.V1;

namespace DaprMemStoreComponent.Services;

public class MemStoreService : StateStore.StateStoreBase
{
    private readonly ILogger<MemStoreService> _logger;
    public MemStoreService(ILogger<MemStoreService> logger)
    {
        _logger = logger;
    }
}

```
This file contains the basic template for creating a gRPC pluggable component. You can change the component type in your file to match your preference. For example, here's the same file but adjusted for a pubsub component. 

```csharp
using Dapr.Proto.Components.V1;

namespace DaprPubsubComponent.Services;

public class PubsubService : Pubsub.pubsubBase
{
    private readonly ILogger<PubsubService> _logger;
    public PubsubService(ILogger<PubsubService> logger)
    {
        _logger = logger;
    }
}

```
### Build and run component service

Build the external gRPC component. 
```shell
`dotnet build`
```


Now you should be able to implement any methods you would like to define for your external gRPC component service. 

Below is a code sample that shows how to implement methods. The sample is the same state store template from above (`MemStoreService.cs`) but with added methods for Features, Get, Set and BulkSet. All methods have been overridden in the code sample.

```csharp
Now implement the external gRPC component

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

After your methods have been implemented, run your external gRPC component service. If you're using the code sample, just run the `MemStoreService.cs` file with included methods from above. If you do not add any methods to the original file, you will errors when you run this step. 


Run the external gRPC component service. 
```shell
dotnet run
```

Try invoking a method from your externbal gRPC component. You should get an `OK` as a response.

```shell
`grpc_cli call unix:///tmp/Dapr-components-sockets/memstore.sock Features ''`
```

### Recommended methods to implement: Init and Ping

The Dapr runtime uses the ping method as a liveness probe, so it's up to you to decide what is `liveness` from your component point of view. As a simple implementation, `Ping` can just respond back without any deep check, but implementing it is a requirement to work with Daprd. 

Add the ping method to your `MemStoreService.cs` file.

```csharp
    public override Task<PingResponse> Ping(PingRequest request, ServerCallContext ctx)
    {
        return Task.FromResult(new PingResponse());
    }
```

### Validation step

To validate that your external gRPC component is workking as expected, you can try a simple `Set` call

```shell
grpc_cli call unix:///tmp/dapr-components-sockets/memstore.sock dapr.proto.components.v1.StateStore/Set "key:'my_key', value:'my_value'"
```

Now retrieve the value

```shell
grpc_cli call unix:///tmp/dapr-components-sockets/memstore.sock dapr.proto.components.v1.StateStore/Get "key:'my_key'"
```

If you recieved an OK for both requests, your externaal component is up and running. However, to consider your external gRPC component fully implemented we reccomend implementing additional methods for added functionality for your external gRPC pluggable component


## Next Steps
- Learn hwo to use your external gRPC component.


