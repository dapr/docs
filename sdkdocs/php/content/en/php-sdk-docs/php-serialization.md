---
type: docs
title: "Custom Serialization"
linkTitle: "Custom Serializers"
weight: 1000
description: How to configure serialization
no_list: true
---

Dapr uses JSON serialization and thus (complex) type information is lost when sending/receiving data.

## Serialization

When returning an object from a controller, passing an object to the `DaprClient`, or storing an object in a state store,
only public properties are scanned and serialized. You can customize this behavior by implementing `\Dapr\Serialization\ISerialize`.
For example, if you wanted to create an ID type that serialized to a string, you may implement it like so:

```php
<?php

class MyId implements \Dapr\Serialization\Serializers\ISerialize 
{
    public string $id;
    
    public function serialize(mixed $value,\Dapr\Serialization\ISerializer $serializer): mixed
    {
        // $value === $this
        return $this->id; 
    }
}
```

This works for any type that we have full ownership over, however, it doesn't work for classes from libraries or PHP itself.
For that, you need to register a custom serializer with the DI container:

```php
<?php
// in config.php

class SerializeSomeClass implements \Dapr\Serialization\Serializers\ISerialize 
{
    public function serialize(mixed $value,\Dapr\Serialization\ISerializer $serializer) : mixed 
    {
        // serialize $value and return the result
    }
}

return [
    'dapr.serializers.custom'      => [SomeClass::class => new SerializeSomeClass()],
];
```

## Deserialization

Deserialization works exactly the same way, except the interface is `\Dapr\Deserialization\Deserializers\IDeserialize`.
