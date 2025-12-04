---
type: docs
title: "Production Reference: Actors"
linkTitle: "Production Reference"
weight: 1000
description: Running PHP actors in production
no_list: true
---

## Proxy modes

There are four different modes actor proxies are handled. Each mode presents different trade-offs that you'll need to
weigh during development and in production.

```php
<?php
\Dapr\Actors\Generators\ProxyFactory::GENERATED;
\Dapr\Actors\Generators\ProxyFactory::GENERATED_CACHED;
\Dapr\Actors\Generators\ProxyFactory::ONLY_EXISTING;
\Dapr\Actors\Generators\ProxyFactory::DYNAMIC;
```

It can be set with `dapr.actors.proxy.generation` configuration key.

{{< tabpane text=true >}}
{{% tab header="GENERATED" %}}

This is the default mode. In this mode, a class is generated and `eval`'d on every request. It's mostly for development
and shouldn't be used in production.

{{% /tab %}}
{{% tab header="GENERATED_CACHED" %}}

This is the same as `ProxyModes::GENERATED` except the class is stored in a tmp file so it doesn't need to be
regenerated on every request. It doesn't know when to update the cached class, so using it in development is discouraged
but is offered for when manually generating the files isn't possible.

{{% /tab %}}
{{% tab header="ONLY_EXISTING" %}}

In this mode, an exception is thrown if the proxy class doesn't exist. This is useful for when you don't want to 
generate code in production. You'll have to make sure the class is generated and pre-/autoloaded.

### Generating proxies

You can create a composer script to generate proxies on demand to take advantage of the `ONLY_EXISTING` mode.

Create a `ProxyCompiler.php`

```php
<?php

class ProxyCompiler {
    private const PROXIES = [
        MyActorInterface::class,
        MyOtherActorInterface::class,
    ];
    
    private const PROXY_LOCATION = __DIR__.'/proxies/';
    
    public static function compile() {
        try {
            $app = \Dapr\App::create();
            foreach(self::PROXIES as $interface) {
                $output = $app->run(function(\DI\FactoryInterface $factory) use ($interface) {
                    return \Dapr\Actors\Generators\FileGenerator::generate($interface, $factory);
                });
                $reflection = new ReflectionClass($interface);
                $dapr_type = $reflection->getAttributes(\Dapr\Actors\Attributes\DaprType::class)[0]->newInstance()->type;
                $filename = 'dapr_proxy_'.$dapr_type.'.php';
                file_put_contents(self::PROXY_LOCATION.$filename, $output);
                echo "Compiled: $interface";
            }
        } catch (Exception $ex) {
            echo "Failed to generate proxy for $interface\n{$ex->getMessage()} on line {$ex->getLine()} in {$ex->getFile()}\n";
        }
    }
}
```

Then add a psr-4 autoloader for the generated proxies and a script in `composer.json`:

```json
{
  "autoload": {
    "psr-4": {
      "Dapr\\Proxies\\": "path/to/proxies"
    }
  },
  "scripts": {
    "compile-proxies": "ProxyCompiler::compile"
  }
}
```

And finally, configure dapr to only use the generated proxies:

```php
<?php
// in config.php

return [
    'dapr.actors.proxy.generation' => ProxyFactory::ONLY_EXISTING,
];
```

{{% /tab %}}
{{% tab header="DYNAMIC" %}}

In this mode, the proxy satisfies the interface contract, however, it does not actually implement the interface itself
(meaning `instanceof` will be `false`). This mode takes advantage of a few quirks in PHP to work and exists for cases
where code cannot be `eval`'d or generated.

{{% /tab %}}
{{< /tabpane >}}

### Requests

Creating an actor proxy is very inexpensive for any mode. There are no requests made when creating an actor proxy object.

When you call a method on a proxy object, only methods that you implemented are serviced by your actor implementation. 
`get_id()` is handled locally, and `get_reminder()`, `delete_reminder()`, etc. are handled by the `daprd`.

## Actor implementation

Every actor implementation in PHP must implement `\Dapr\Actors\IActor` and use the `\Dapr\Actors\ActorTrait` trait. This
allows for fast reflection and some shortcuts. Using the `\Dapr\Actors\Actor` abstract base class does this for you, but
if you need to override the default behavior, you can do so by implementing the interface and using the trait.

## Activation and deactivation

When an actor activates, a token file is written to a temporary directory (by default this is in 
`'/tmp/dapr_' + sha256(concat(Dapr type, id))` in linux and `'%temp%/dapr_' + sha256(concat(Dapr type, id))` on Windows).
This is persisted until the actor deactivates, or the host shuts down. This allows for `on_activation` to be called once
and only once when Dapr activates the actor on the host.

## Performance

Actor method invocation is very fast on a production setup with `php-fpm` and `nginx`, or IIS on Windows. Even though 
the actor is constructed on every request, actor state keys are only loaded on-demand and not during each request. 
However, there is some overhead in loading each key individually. This can be mitigated by storing an array of data in 
state, trading some usability for speed. It is not recommended doing this from the start, but as an optimization when 
needed.

## Versioning state

The names of the variables in the `ActorState` object directly correspond to key names in the store. This means that if
you change the type or name of a variable, you may run into errors. To get around this, you may need to version your state
object. In order to do this, you'll need to override how state is loaded and stored. There are many ways to approach this,
one such solution might be something like this:

```php
<?php

class VersionedState extends \Dapr\Actors\ActorState {
    /**
     * @var int The current version of the state in the store. We give a default value of the current version. 
     * However, it may be in the store with a different value. 
     */
    public int $state_version = self::VERSION;
    
    /**
     * @var int The current version of the data
     */
    private const VERSION = 3;
    
    /**
     * Call when your actor activates.
     */
    public function upgrade() {
        if($this->state_version < self::VERSION) {
            $value = parent::__get($this->get_versioned_key('key', $this->state_version));
            // update the value after updating the data structure
            parent::__set($this->get_versioned_key('key', self::VERSION), $value);
            $this->state_version = self::VERSION;
            $this->save_state();
        }
    }
    
    // if you upgrade all keys as needed in the method above, you don't need to walk the previous
    // keys when loading/saving and you can just get the current version of the key.
    
    private function get_previous_version(int $version): int {
        return $this->has_previous_version($version) ? $version - 1 : $version;
    }
    
    private function has_previous_version(int $version): bool {
        return $version >= 0;
    }
    
    private function walk_versions(int $version, callable $callback, callable $predicate): mixed {
        $value = $callback($version);
        if($predicate($value) || !$this->has_previous_version($version)) {
            return $value;
        }
        return $this->walk_versions($this->get_previous_version($version), $callback, $predicate);
    }
    
    private function get_versioned_key(string $key, int $version) {
        return $this->has_previous_version($version) ? $version.$key : $key;
    }
    
    public function __get(string $key): mixed {
        return $this->walk_versions(
            self::VERSION, 
            fn($version) => parent::__get($this->get_versioned_key($key, $version)),
            fn($value) => isset($value)
        );
    }
    
    public function __isset(string $key): bool {
        return $this->walk_versions(
            self::VERSION,
            fn($version) => parent::__isset($this->get_versioned_key($key, $version)),
            fn($isset) => $isset
        );
    }
    
    public function __set(string $key,mixed $value): void {
        // optional: you can unset previous versions of the key
        parent::__set($this->get_versioned_key($key, self::VERSION), $value);
    }
    
    public function __unset(string $key) : void {
        // unset this version and all previous versions
        $this->walk_versions(
            self::VERSION, 
            fn($version) => parent::__unset($this->get_versioned_key($key, $version)), 
            fn() => false
        );
    }
}
```

There's a lot to be optimized, and it wouldn't be a good idea to use this verbatim in production, but you can get the 
gist of how it would work. A lot of it will depend on your use case which is why there's not something like this in 
the SDK. For instance, in this example implementation, the previous value is kept for where there may be a bug during an upgrade; 
keeping the previous value allows for running the upgrade again, but you may wish to delete the previous value. 
