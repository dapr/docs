# Serialization in Dapr's SDKs

An SDK for Dapr should provide serialization for two use cases. First, for API objects sent through request and response payloads. Second, for objects to be persisted. For both these use cases, a default serialization is provided. In the Java SDK, it is the [DefaultObjectSerializer](https://dapr.github.io/java-sdk/io/dapr/serializer/DefaultObjectSerializer.html) class, providing JSON serialization.

## Service invocation

```java
    DaprClient client = (new DaprClientBuilder()).build();
    client.invokeService(Verb.POST, "myappid", "saySomething", "My Message", null).block();
```

In the example above, the app will receive a `POST` request for the `saySomething` method with the request payload as `"My Message"` - quoted since the serializer will serialize the input String to JSON.

```text
POST /saySomething HTTP/1.1
Host: localhost
Content-Type: text/plain
Content-Length: 12

"My Message"
```

## State management

```java
    DaprClient client = (new DaprClientBuilder()).build();
    client.saveState("MyStateStore", "MyKey", "My Message").block();
```
In this example, `My Message` will be saved. It is not quoted because Dapr's API will internally parse the JSON request object before saving it.

```JSON
[
    {
        "key": "MyKey",
        "value": "My Message"
    }
]
```

## PubSub

```java
  DaprClient client = (new DaprClientBuilder()).build();
  client.publishEvent("TopicName", "My Message").block();
```

The event is published and the content is serialized to `byte[]` and sent to Dapr sidecar. The subscriber will receive it as a [CloudEvent](https://github.com/cloudevents/spec). Cloud event defines `data` as String. Dapr SDK also provides a built-in deserializer for `CloudEvent` object.

```java
  @PostMapping(path = "/TopicName")
  public void handleMessage(@RequestBody(required = false) byte[] body) {
      // Dapr's event is compliant to CloudEvent.
      CloudEvent event = CloudEvent.deserialize(body);
  }
```

## Bindings

In this case, the object is serialized to `byte[]` as well and the input binding receives the raw `byte[]` as-is and deserializes it to the expected object type.

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
It should print:
```
My Message
```

## Actor Method invocation
Object serialization and deserialization for invocation of Actor's methods are same as for the service method invocation, the only difference is that the application does not need to deserialize the request or serialize the response since it is all done transparently by the SDK.

For Actor's methods, the SDK only supports methods with zero or one parameter.

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
It should print:
```
    My Message
```

## Actor's state management
Actors can also have state. In this case, the state manager will serialize and deserialize the objects using the state serializer and handle it transparently to the application.

```java
public String actorMethod(String message) {
    // Reads a state from key and deserializes it to String.
    String previousMessage = super.getActorStateManager().get("lastmessage", String.class).block();

    // Sets the new state for the key after serializing it.
    super.getActorStateManager().set("lastmessage", message).block();
    return previousMessage;
}
```

## Default serializer

The default serializer for Dapr is a JSON serializer with the following expectations:

1. Use of basic [JSON data types](https://www.w3schools.com/js/js_json_datatypes.asp) for cross-language and cross-platform compatibility: string, number, array, boolean, null and another JSON object. Every complex property type in application's serializable objects (DateTime, for example), should be represented as one of the JSON's basic types.
2. Data persisted with the default serializer should be saved as JSON objects too, without extra quotes or encoding. The example below shows how a string and a JSON object would look like in a Redis store.
```bash
redis-cli MGET "ActorStateIT_StatefulActorService||StatefulActorTest||1581130928192||message
"This is a message to be saved and retrieved."
```
```bash
 redis-cli MGET "ActorStateIT_StatefulActorService||StatefulActorTest||1581130928192||mydata
{"value":"My data value."}
```
3. Custom serializers must serialize object to `byte[]`.
4. Custom serializers must deserilize `byte[]` to object.
5. When user provides a custom serializer, it should be transferred or persisted as `byte[]`. When persisting, also encode as Base64 string. This is done natively by most JSON libraries.
```bash
redis-cli MGET "ActorStateIT_StatefulActorService||StatefulActorTest||1581130928192||message
"VGhpcyBpcyBhIG1lc3NhZ2UgdG8gYmUgc2F2ZWQgYW5kIHJldHJpZXZlZC4="
```
```bash
 redis-cli MGET "ActorStateIT_StatefulActorService||StatefulActorTest||1581130928192||mydata
"eyJ2YWx1ZSI6Ik15IGRhdGEgdmFsdWUuIn0="
```
6. When serializing a object that is a `byte[]`, the serializer should just pass it through since `byte[]` shoould be already handled internally in the SDK. The same happens when deserializing to `byte[]`.

*As of now, the [Java SDK](https://github.com/dapr/java-sdk/) is the only Dapr SDK that implements this specification. In the near future, other SDKs will also implement the same.*