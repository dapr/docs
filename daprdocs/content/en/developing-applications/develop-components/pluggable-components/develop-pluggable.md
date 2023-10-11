---
type: docs
title: "How to: Implement pluggable components"
linkTitle: "Implement pluggable components"
weight: 1100
description: "Learn how to author and implement pluggable components"
---

In this guide, you'll learn why and how to implement a [pluggable component]({{< ref pluggable-components-overview >}}). To learn how to configure and register a pluggable component, refer to [How to: Register a pluggable component]({{< ref pluggable-components-registration.md >}})

## Implement a pluggable component

In order to implement a pluggable component, you need to implement a gRPC service in the component. Implementing the gRPC service requires three steps:

### Find the proto definition file

Proto definitions are provided for each supported service interface (state store, pub/sub, bindings, secret stores).

Currently, the following component APIs are supported:

- State stores
- Pub/sub
- Bindings
- Secret stores

|  Component  |    Type    | gRPC definition  |                       Built-in Reference Implementation                        | Docs                                                                                                                                                                  |
| :---------: | :--------: | :--------------: | :----------------------------------------------------------------------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| State Store |  `state`   |  [state.proto](https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/state.proto)   |  [Redis](https://github.com/dapr/components-contrib/tree/master/state/redis)   | [concept]({{< ref "state-management-overview" >}}), [howto]({{< ref "howto-get-save-state" >}}), [api spec]({{< ref "state_api" >}})                                        |
|   Pub/sub   |  `pubsub`  |  [pubsub.proto](https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/pubsub.proto)  |  [Redis](https://github.com/dapr/components-contrib/tree/master/pubsub/redis)  | [concept]({{< ref "pubsub-overview" >}}), [howto]({{< ref "howto-publish-subscribe" >}}), [api spec]({{< ref "pubsub_api" >}})                                              |
|  Bindings   | `bindings` | [bindings.proto](https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/bindings.proto) | [Kafka](https://github.com/dapr/components-contrib/tree/master/bindings/kafka) | [concept]({{< ref "bindings-overview" >}}), [input howto]({{< ref "howto-triggers" >}}), [output howto]({{< ref "howto-bindings" >}}), [api spec]({{< ref "bindings_api" >}}) |
|  Secret Store   | `secretstores` | [secretstore.proto](https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/secretstore.proto) | [Hashicorp/Vault](https://github.com/dapr/components-contrib/blob/master/secretstores/hashicorp/vault/vault.go) | [concept]({{< ref "secrets-overview" >}}), [howto-secrets]({{< ref "howto-secrets" >}}), [api spec]({{< ref "secrets_api" >}}) |

Below is a snippet of the gRPC service definition for pluggable component state stores ([state.proto]):

```protobuf
// StateStore service provides a gRPC interface for state store components.
service StateStore {
  // Initializes the state store component with the given metadata.
  rpc Init(InitRequest) returns (InitResponse) {}
  // Returns a list of implemented state store features.
  rpc Features(FeaturesRequest) returns (FeaturesResponse) {}
  // Ping the state store. Used for liveness purposes.
  rpc Ping(PingRequest) returns (PingResponse) {}
  
  // Deletes the specified key from the state store.
  rpc Delete(DeleteRequest) returns (DeleteResponse) {}
  // Get data from the given key.
  rpc Get(GetRequest) returns (GetResponse) {}
  // Sets the value of the specified key.
  rpc Set(SetRequest) returns (SetResponse) {}


  // Deletes many keys at once.
  rpc BulkDelete(BulkDeleteRequest) returns (BulkDeleteResponse) {}
  // Retrieves many keys at once.
  rpc BulkGet(BulkGetRequest) returns (BulkGetResponse) {}
  // Set the value of many keys at once.
  rpc BulkSet(BulkSetRequest) returns (BulkSetResponse) {}
}
```

The interface for the `StateStore` service exposes a total of 9 methods:

- 2 methods for initialization and components capability advertisement (Init and Features)
- 1 method for health-ness or liveness check (Ping)
- 3 methods for CRUD (Get, Set, Delete)
- 3 methods for bulk CRUD operations (BulkGet, BulkSet, BulkDelete)

### Create service scaffolding 

Use [protocol buffers and gRPC tools](https://grpc.io) to create the necessary scaffolding for the service. Learn more about these tools via [the gRPC concepts documentation](https://grpc.io/docs/what-is-grpc/core-concepts/).

These tools generate code targeting [any gRPC-supported language](https://grpc.io/docs/what-is-grpc/introduction/#protocol-buffer-versions). This code serves as the base for your server and it provides:
- Functionality to handle client calls
- Infrastructure to:
  - Decode incoming requests
  - Execute service methods
  - Encode service responses

The generated code is incomplete. It is missing:

- A concrete implementation for the methods your target service defines (the core of your pluggable component). 
- Code on how to handle Unix Socket Domain integration, which is Dapr specific.
- Code handling integration with your downstream services.

Learn more about filling these gaps in the next step.

### Define the service

Provide a concrete implementation of the desired service. Each component has a gRPC service definition for its core functionality which is the same as the core component interface. For example:

- **State stores**

   A pluggable state store **must** provide an implementation of the `StateStore` service interface. 
   
   In addition to this core functionality, some components might also expose functionality under other **optional** services. For example, you can add extra functionality by defining the implementation for a `QueriableStateStore` service and a `TransactionalStateStore` service.
   
- **Pub/sub**

   Pluggable pub/sub components only have a single core service interface defined [pubsub.proto](https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/pubsub.proto). They have no optional service interfaces.
 
- **Bindings**

   Pluggable input and output bindings have a single core service definition on [bindings.proto](https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/bindings.proto). They have no optional service interfaces.

- **Secret Store**

   Pluggable Secret store have a single core service definition on [secretstore.proto](https://github.com/dapr/dapr/blob/master/dapr/proto/components/v1/secretstore.proto). They have no optional service interfaces.

After generating the above state store example's service scaffolding code using gRPC and protocol buffers tools, you can define concrete implementations for the 9 methods defined under `service StateStore`, along with code to initialize and communicate with your dependencies.

This concrete implementation and auxiliary code are the **core** of your pluggable component. They define how your component behaves when handling gRPC requests from Dapr.

## Returning semantic errors

Returning semantic errors are also part of the pluggable component protocol. The component must return specific gRPC codes that have semantic meaning for the user application, those errors are used to a variety of situations from concurrency requirements to informational only.

| Error                    | gRPC error code                 | Source component | Description |
| ------------------------ | ------------------------------- | ---------------- | ----------- |
| ETag Mismatch            | `codes.FailedPrecondition`      | State store      | Error mapping to meet concurrency requirements |
| ETag Invalid             | `codes.InvalidArgument`         | State store      |  |
| Bulk Delete Row Mismatch | `codes.Internal`                | State store      |  |

Learn more about concurrency requirements in the [State Management overview]({{< ref "state-management-overview.md#concurrency" >}}).

The following examples demonstrate how to return an error in your own pluggable component, changing the messages to suit your needs.

{{< tabs ".NET" "Java" "Go" >}}
 <!-- .NET -->
{{% codetab %}}

> **Important:** In order to use .NET for error mapping, first install the [`Google.Api.CommonProtos` NuGet package](https://www.nuget.org/packages/Google.Api.CommonProtos/).

**Etag Mismatch**

```csharp
var badRequest = new BadRequest();
var des = "The ETag field provided does not match the one in the store";
badRequest.FieldViolations.Add(    
   new Google.Rpc.BadRequest.Types.FieldViolation
       {        
         Field = "etag",
         Description = des
       });

var baseStatusCode = Grpc.Core.StatusCode.FailedPrecondition;
var status = new Google.Rpc.Status{    
   Code = (int)baseStatusCode
};

status.Details.Add(Google.Protobuf.WellKnownTypes.Any.Pack(badRequest));

var metadata = new Metadata();
metadata.Add("grpc-status-details-bin", status.ToByteArray());
throw new RpcException(new Grpc.Core.Status(baseStatusCode, "fake-err-msg"), metadata);
```

**Etag Invalid**

```csharp
var badRequest = new BadRequest();
var des = "The ETag field must only contain alphanumeric characters";
badRequest.FieldViolations.Add(
   new Google.Rpc.BadRequest.Types.FieldViolation
   {
      Field = "etag",
      Description = des
   });

var baseStatusCode = Grpc.Core.StatusCode.InvalidArgument;
var status = new Google.Rpc.Status
{
   Code = (int)baseStatusCode
};

status.Details.Add(Google.Protobuf.WellKnownTypes.Any.Pack(badRequest));

var metadata = new Metadata();
metadata.Add("grpc-status-details-bin", status.ToByteArray());
throw new RpcException(new Grpc.Core.Status(baseStatusCode, "fake-err-msg"), metadata);
```

**Bulk Delete Row Mismatch**

```csharp
var errorInfo = new Google.Rpc.ErrorInfo();

errorInfo.Metadata.Add("expected", "100");
errorInfo.Metadata.Add("affected", "99");

var baseStatusCode = Grpc.Core.StatusCode.Internal;
var status = new Google.Rpc.Status{
    Code = (int)baseStatusCode
};

status.Details.Add(Google.Protobuf.WellKnownTypes.Any.Pack(errorInfo));

var metadata = new Metadata();
metadata.Add("grpc-status-details-bin", status.ToByteArray());
throw new RpcException(new Grpc.Core.Status(baseStatusCode, "fake-err-msg"), metadata);
```

{{% /codetab %}}

 <!-- Java -->
{{% codetab %}}

Just like the [Dapr Java SDK](https://github.com/tmacam/dapr-java-sdk/), the Java Pluggable Components SDK uses [Project Reactor](https://projectreactor.io/), which provides an asynchronous API for Java.

Errors can be returned directly by:
1. Calling the `.error()` method in the `Mono` or `Flux` that your method returns
1. Providing the appropriate exception as parameter. 

You can also raise an exception, as long as it is captured and fed back to your resulting `Mono` or `Flux`.

**ETag Mismatch**

```java
final Status status = Status.newBuilder()
    .setCode(io.grpc.Status.Code.FAILED_PRECONDITION.value())
    .setMessage("fake-err-msg-for-etag-mismatch")
    .addDetails(Any.pack(BadRequest.FieldViolation.newBuilder()
        .setField("etag")
        .setDescription("The ETag field provided does not match the one in the store")
        .build()))
    .build();
return Mono.error(StatusProto.toStatusException(status));
```

**ETag Invalid**

```java
final Status status = Status.newBuilder()
    .setCode(io.grpc.Status.Code.INVALID_ARGUMENT.value())
    .setMessage("fake-err-msg-for-invalid-etag")
    .addDetails(Any.pack(BadRequest.FieldViolation.newBuilder()
        .setField("etag")
        .setDescription("The ETag field must only contain alphanumeric characters")
        .build()))
    .build();
return Mono.error(StatusProto.toStatusException(status));
```

**Bulk Delete Row Mismatch**

```java
final Status status = Status.newBuilder()
    .setCode(io.grpc.Status.Code.INTERNAL.value())
    .setMessage("fake-err-msg-for-bulk-delete-row-mismatch")
    .addDetails(Any.pack(ErrorInfo.newBuilder()
        .putAllMetadata(Map.ofEntries(
            Map.entry("affected", "99"),
            Map.entry("expected", "100")
        ))
        .build()))
    .build();
return Mono.error(StatusProto.toStatusException(status));
```

{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}

**ETag Mismatch**

```go
st := status.New(codes.FailedPrecondition, "fake-err-msg")
desc := "The ETag field provided does not match the one in the store"
v := &errdetails.BadRequest_FieldViolation{
	Field:       etagField,
	Description: desc,
}
br := &errdetails.BadRequest{}
br.FieldViolations = append(br.FieldViolations, v)
st, err := st.WithDetails(br)
```

**ETag Invalid**

```go
st := status.New(codes.InvalidArgument, "fake-err-msg")
desc := "The ETag field must only contain alphanumeric characters"
v := &errdetails.BadRequest_FieldViolation{
	Field:       etagField,
	Description: desc,
}
br := &errdetails.BadRequest{}
br.FieldViolations = append(br.FieldViolations, v)
st, err := st.WithDetails(br)
```

**Bulk Delete Row Mismatch**

```go
st := status.New(codes.Internal, "fake-err-msg")
br := &errdetails.ErrorInfo{}
br.Metadata = map[string]string{
	affected: "99",
	expected: "100",
}
st, err := st.WithDetails(br)
```

{{% /codetab %}}

{{< /tabs >}}

## Next steps

- Get started with developing .NET pluggable component using this [sample code](https://github.com/dapr/samples/tree/master/pluggable-components-dotnet-template) 
- [Review the pluggable components overview]({{< ref pluggable-components-overview.md >}})
- [Learn how to register your pluggable component]({{< ref pluggable-components-registration >}})