---
type: docs
title: "Serialization in Dapr's SDKs"
linkTitle: "SDK Serialization"
description: "How Dapr serializes data within the SDKs"
weight: 400
aliases:
  - '/developing-applications/sdks/serialization/'
---

Dapr SDKs provide serialization for two use cases. First, for API objects sent through request and response payloads. Second, for objects to be persisted. For both of these cases, a default serialization method is provided in each language SDK.

| Language SDK                 | Default Serializer                                                                                                                                                                                                                                          |
|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [.NET]({{< ref dotnet >}}) | [DataContracts](https://learn.microsoft.com/dotnet/framework/wcf/feature-details/using-data-contracts) for remoted actors, [System.Text.Json](https://www.nuget.org/packages/System.Text.Json) otherwise. Read more about .NET serialization [here]({{< ref dotnet-actors-serialization >}}) |                                               |
| [Java]({{< ref java >}})   | [DefaultObjectSerializer](https://dapr.github.io/java-sdk/io/dapr/serializer/DefaultObjectSerializer.html) for JSON serialization                                                                                                                           |
| [JavaScript]({{< ref js >}}) | JSON                                                                                                                                                                                                                                                        | 

## Service invocation

{{< tabs ".NET" "Java" >}}

<!-- .NET -->
{{% codetab %}}

```csharp
    using var client = (new DaprClientBuilder()).Build();
    await client.InvokeMethodAsync("myappid", "saySomething", "My Message");
```

{{% /codetab %}}

<!-- Java -->
{{% codetab %}}

```java
    DaprClient client = (new DaprClientBuilder()).build();
    client.invokeMethod("myappid", "saySomething", "My Message", HttpExtension.POST).block();
```

{{% /codetab %}}

In the example above, the app `myappid` receives a `POST` request for the `saySomething` method with the request payload as 
`"My Message"` - quoted since the serializer will serialize the input String to JSON.

```text
POST /saySomething HTTP/1.1
Host: localhost
Content-Type: text/plain
Content-Length: 12

"My Message"
```

## State management

{{< tabs ".NET" "Java" >}}

<!-- .NET -->
{{% codetab %}}

```csharp
    using var client = (new DaprClientBuilder()).Build();
    var state = new Dictionary<string, string>
    {
      { "key": "MyKey" },
      { "value": "My Message" }
    };
    await client.SaveStateAsync("MyStateStore", "MyKey", state);
```

{{% /codetab %}}

<!-- Java -->
{{% codetab %}}

```java
    DaprClient client = (new DaprClientBuilder()).build();
    client.saveState("MyStateStore", "MyKey", "My Message").block();
```

{{% /codetab %}}

In this example, `My Message` is saved. It is not quoted because Dapr's API internally parse the JSON request 
object before saving it.

```JSON
[
    {
        "key": "MyKey",
        "value": "My Message"
    }
]
```

## PubSub

{{< tabs ".NET" "Java" >}}

<!-- .NET -->
{{% codetab %}}

```csharp
    using var client = (new DaprClientBuilder()).Build();
    await client.PublishEventAsync("MyPubSubName", "TopicName", "My Message");
```

The event is published and the content is serialized to `byte[]` and sent to Dapr sidecar. The subscriber receives it as a [CloudEvent](https://github.com/cloudevents/spec). Cloud event defines `data` as String. The Dapr SDK also provides a built-in deserializer for `CloudEvent` object. 

```csharp
public async Task<IActionResult> HandleMessage(string message) 
{
  //ASP.NET Core automatically deserializes the UTF-8 encoded bytes to a string
  return new Ok();
}
```

or

```csharp
app.MapPost("/TopicName", [Topic("MyPubSubName", "TopicName")] (string message) => {
  return Results.Ok();
}
```

{{% /codetab %}}

<!-- Java -->
{{% codetab %}}

```java
  DaprClient client = (new DaprClientBuilder()).build();
  client.publishEvent("TopicName", "My Message").block();
```

The event is published and the content is serialized to `byte[]` and sent to Dapr sidecar. The subscriber receives it as a [CloudEvent](https://github.com/cloudevents/spec). Cloud event defines `data` as String. The Dapr SDK also provides a built-in deserializer for `CloudEvent` objects.

```java
  @PostMapping(path = "/TopicName")
  public void handleMessage(@RequestBody(required = false) byte[] body) {
      // Dapr's event is compliant to CloudEvent.
      CloudEvent event = CloudEvent.deserialize(body);
  }
```

{{% /codetab %}}

## Bindings

For output bindings the object is serialized to `byte[]` whereas the input binding receives the raw `byte[]` as-is and deserializes it to the expected object type.

{{< tabs ".NET" "Java" >}}

<!-- .NET -->
{{% codetab %}}

* Output binding:
```csharp
    using var client = (new DaprClientBuilder()).Build();
    await client.InvokeBindingAsync("sample", "My Message");
```

* Input binding (controllers):
```csharp
  [ApiController]
  public class SampleController : ControllerBase
  {
    [HttpPost("propagate")]
    public ActionResult<string> GetValue([FromBody] int itemId)
    {
      Console.WriteLine($"Received message:  {itemId}");
      return $"itemID:{itemId}";
    }
  }
 ```
  
* Input binding (minimal API):
```csharp
app.MapPost("value", ([FromBody] int itemId) =>
{
  Console.WriteLine($"Received message: {itemId}");
  return ${itemID:{itemId}";
});
* ```

{{% /codetab %}}

<!-- Java -->
{{% codetab %}}

* Output binding:
```java
    DaprClient client = (new DaprClientBuilder()).build();
    client.invokeBinding("sample", "My Message").block();
```

* Input binding:
```java
  @PostMapping(path = "/sample")
  public void handleInputBinding(@RequestBody(required = false) byte[] body) {
      String message = (new DefaultObjectSerializer()).deserialize(body, String.class);
      System.out.println(message);
  }
```

{{% /codetab %}}

It should print:
```
My Message
```

## Actor Method invocation
Object serialization and deserialization for Actor method invocation are same as for the service method invocation, 
the only difference is that the application does not need to deserialize the request or serialize the response since it 
is all done transparently by the SDK.

For Actor methods, the SDK only supports methods with zero or one parameter.

{{< tabs ".NET" "Java" >}}

The .NET SDK supports two different serialization types based on whether you're using strongly-typed (DataContracts)
or weakly-typed (DataContracts or System.Text.JSON) actor client. [This document]({{< ref dotnet-actors-serialization >}}) 
can provide more information about the differences between each and additional considerations to keep in mind.

<!-- .NET -->
{{% codetab %}}

* Invoking an Actor's method using the weakly-typed client and System.Text.JSON:
```csharp
    var proxy = this.ProxyFactory.Create(ActorId.CreateRandom(), "DemoActor");
    await proxy.SayAsync("My message");
```

* Implementing an Actor's method:
```csharp
public Task SayAsync(string message) 
{
    Console.WriteLine(message);
    return Task.CompletedTask;
}
```

{{% /codetab %}}

<!-- Java -->
{{% codetab %}}

* Invoking an Actor's method:
```java
public static void main() {
    ActorProxyBuilder builder = new ActorProxyBuilder("DemoActor");
    String result = actor.invokeActorMethod("say", "My Message", String.class).block();
}
```

* Implementing an Actor's method:
```java
public String say(String something) {
  System.out.println(something);
  return "OK";
}
```

{{% /codetab %}}

It should print:
```
    My Message
```

## Actor's state management
Actors can also have state. In this case, the state manager will serialize and deserialize the objects using the state 
serializer and handle it transparently to the application.

<!-- .NET -->
{{% codetab %}}

```csharp
public Task SayAsync(string message) 
{
    // Reads state from a key
    var previousMessage = await this.StateManager.GetStateAsync<string>("lastmessage");
    
    // Sets the new state for the key after serializing it
    await this.StateManager.SetStateAsync("lastmessage", message);
    return previousMessage;
}
```

{{% /codetab %}}

<!-- Java -->
{{% codetab %}}

```java
public String actorMethod(String message) {
    // Reads a state from key and deserializes it to String.
    String previousMessage = super.getActorStateManager().get("lastmessage", String.class).block();

    // Sets the new state for the key after serializing it.
    super.getActorStateManager().set("lastmessage", message).block();
    return previousMessage;
}
```

{{% /codetab %}}

## Default serializer

The default serializer for Dapr is a JSON serializer with the following expectations:

1. Use of basic [JSON data types](https://www.w3schools.com/js/js_json_datatypes.asp) for cross-language and cross-platform compatibility: string, number, array, 
boolean, null and another JSON object. Every complex property type in application's serializable objects (DateTime, 
for example), should be represented as one of the JSON's basic types.
2. Data persisted with the default serializer should be saved as JSON objects too, without extra quotes or encoding. 
The example below shows how a string and a JSON object would look like in a Redis store.
```bash
redis-cli MGET "ActorStateIT_StatefulActorService||StatefulActorTest||1581130928192||message
"This is a message to be saved and retrieved."
```
```bash
 redis-cli MGET "ActorStateIT_StatefulActorService||StatefulActorTest||1581130928192||mydata
{"value":"My data value."}
```
3. Custom serializers must serialize object to `byte[]`.
4. Custom serializers must deserialize `byte[]` to object.
5. When user provides a custom serializer, it should be transferred or persisted as `byte[]`. When persisting, also 
encode as Base64 string. This is done natively by most JSON libraries.
```bash
redis-cli MGET "ActorStateIT_StatefulActorService||StatefulActorTest||1581130928192||message
"VGhpcyBpcyBhIG1lc3NhZ2UgdG8gYmUgc2F2ZWQgYW5kIHJldHJpZXZlZC4="
```
```bash
 redis-cli MGET "ActorStateIT_StatefulActorService||StatefulActorTest||1581130928192||mydata
"eyJ2YWx1ZSI6Ik15IGRhdGEgdmFsdWUuIn0="
```
