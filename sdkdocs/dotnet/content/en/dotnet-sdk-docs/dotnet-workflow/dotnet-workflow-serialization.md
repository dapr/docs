---
type: docs
title: "Workflow serialization in the .NET SDK"
linkTitle: "Workflow serialization"
weight: 1500
description: Configure workflow serialization for the Dapr .NET SDK
---

## Overview

Starting with Dapr .NET SDK v1.17.0, `Dapr.Workflow` supports pluggable serialization. The SDK continues to use
`System.Text.Json` by default, but you can now:

- Override the default `System.Text.Json` settings.
- Register a custom serializer (for example, MessagePack or BSON).

Serialization configuration is entirely client-side and does not require a specific Dapr runtime version.

For large payloads, [workflow data references (alpha)]({{% ref dotnet-workflow-data-references.md %}}) can store
serialized data in a binary store instead of inline in history. Offloading is separate from serializer selection
and happens after serialization. Unlike serializer configuration alone, it requires a runtime with binary-store
support. Registration alone preserves ordinary inline values; select `PayloadWritePreference.PreferReference` to
enable automatic offloading. Cross-app call inputs remain inline unless the call explicitly allows references.
Forwarding references requires compatible, payload-aware destinations with access to the same referenced
objects. The [JavaScript SDK]({{% ref js-workflow-data-references.md %}}) also supports the version-1
reference envelope from `@dapr/dapr` 3.19.0, provided serialization and storage access are compatible
and payload stages do not require reversal. Do not assume other language SDKs support data references.

{{% alert title="Note" color="primary" %}}
This feature requires Dapr .NET SDK v1.17.0 or later.
{{% /alert %}}

## Compatibility and breaking changes

{{% alert title="Warning" color="warning" %}}
Changing serialization can be a breaking change for existing workflows. There is no supported migration path between serialization implementations.

All Dapr SDKs use a standard JSON convention by default. If you change the serialization settings or switch to a custom serializer in your .NET workflows and activities, cross-SDK workflows may fail because other SDKs might not support your custom serialization format.
{{% /alert %}}

## Default JSON serialization

By default, the .NET SDK uses `System.Text.Json` with `JsonSerializerDefaults.Web` (see the
[`JsonSerializerDefaults.Web` reference](https://learn.microsoft.com/dotnet/api/system.text.json.jsonserializerdefaults)).
This means:

- Property names are case-insensitive.
- "camelCase" formatting is used for property names.
- Quoted numbers (JSON strings for number properties) are allowed when reading.

This default convention is designed to be compatible with other Dapr language SDKs for multi-app workflows.

## Override `System.Text.Json` defaults

To override the default JSON settings, register the workflow client using the workflow builder so you can provide custom `JsonSerializerOptions`:

```csharp
builder.Services
    .AddDaprWorkflowBuilder(options =>
    {
        // Explicit registration is optional.
        options.RegisterWorkflow<MyWorkflow>();
        options.RegisterActivity<MyActivity>();
    })
    .WithJsonSerializer(new JsonSerializerOptions { PropertyNamingPolicy = null });
```

The DI-registered client and worker use these settings for payloads. Independently constructed clients must use
compatible settings too. Serializer instances are shared, so custom implementations must be safe for concurrent use.

## Custom serialization providers

In SDK 1.19.0, serializers implement `IDaprSerializer` from `Dapr.Common.Serialization`.
`IWorkflowSerializer` from `Dapr.Workflow.Serialization` extends that shared interface and remains supported,
including by the factory-based registration overload. Registering an `IWorkflowSerializer` directly in DI is
marked `[Obsolete]` and will be removed in the SDK release coinciding with Dapr v1.20; prefer implementing
`IDaprSerializer` for new code. Implement all four methods, including `Serialize<T>`.
The following example shows a MessagePack-based implementation that encodes data as Base64 strings for transport.
It also requires the `MessagePack` NuGet package; choose serialization options compatible with your DTO contracts:

```csharp
using Dapr.Workflow.Serialization;
using MessagePack;

public sealed class MessagePackWorkflowSerializer : IWorkflowSerializer
{
    private readonly MessagePackSerializerOptions _options;

    public MessagePackWorkflowSerializer(MessagePackSerializerOptions options)
    {
        _options = options;
    }

    public string Serialize<T>(T value) => Serialize(value, typeof(T));

    /// <inheritdoc/>
    public string Serialize(object? value, Type? inputType = null)
    {
        if (value == null)
        {
            return string.Empty;
        }

        var targetType = inputType ?? value.GetType();
        var bytes = MessagePackSerializer.Serialize(targetType, value, _options);
        return Convert.ToBase64String(bytes);
    }

    /// <inheritdoc/>
    public T? Deserialize<T>(string? data)
    {
        return (T?)Deserialize(data, typeof(T));
    }

    /// <inheritdoc/>
    public object? Deserialize(string? data, Type returnType)
    {
        if (returnType == null)
        {
            throw new ArgumentNullException(nameof(returnType));
        }

        if (string.IsNullOrEmpty(data))
        {
            return default;
        }

        try
        {
            var bytes = Convert.FromBase64String(data);
            return MessagePackSerializer.Deserialize(returnType, bytes, _options);
        }
        catch (FormatException ex)
        {
            throw new InvalidOperationException(
                "Failed to decode Base64 data. The input may not be valid MessagePack-serialized data.",
                ex);
        }
        catch (MessagePackSerializationException ex)
        {
            throw new InvalidOperationException(
                $"Failed to deserialize data to type {returnType.FullName}.",
                ex);
        }
    }
}
```

### Register a custom serializer

Register the serializer with the workflow builder:

```csharp
builder.Services
    .AddDaprWorkflowBuilder(options =>
    {
        // Explicit registration is optional.
        options.RegisterWorkflow<MyWorkflow>();
        options.RegisterActivity<MyActivity>();
    })
    .WithSerializer(new MessagePackWorkflowSerializer(MessagePackSerializerOptions.Standard));
```

If you need DI-provided configuration, use the overload that receives an `IServiceProvider`:

```csharp
builder.Services
    .AddDaprWorkflowBuilder(options =>
    {
        // Explicit registration is optional.
        options.RegisterWorkflow<MyWorkflow>();
        options.RegisterActivity<MyActivity>();
    })
    .WithSerializer(serviceProvider =>
    {
        var options = serviceProvider
            .GetRequiredService<IOptions<MessagePackSerializerOptions>>()
            .Value;

        return new MessagePackWorkflowSerializer(options);
    });
```

## Next steps

- [Workflow client registration]({{% ref dotnet-workflowclient-usage.md %}})
- [Workflow data references]({{% ref dotnet-workflow-data-references.md %}})
- [Workflow versioning]({{% ref dotnet-workflow-versioning.md %}})
