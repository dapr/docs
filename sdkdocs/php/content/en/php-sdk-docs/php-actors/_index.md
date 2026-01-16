---
type: docs
title: "Virtual Actors"
linkTitle: "Actors"
weight: 1000
description: How to build actors
no_list: true
---

If you're new to the actor pattern, the best place to learn about the actor pattern is in
the [Actor Overview.]({{% ref actors-overview.md %}})

In the PHP SDK, there are two sides to an actor, the Client, and the Actor (aka, the Runtime). As a client of an actor,
you'll interact with a remote actor via the `ActorProxy` class. This class generates a proxy class on-the-fly using one
of several configured strategies.

When writing an actor, state can be managed for you. You can hook into the actor lifecycle, and define reminders and
timers. This gives you considerable power for handling all types of problems that the actor pattern is suited for.

## The Actor Proxy

Whenever you want to communicate with an actor, you'll need to get a proxy object to do so. The proxy is responsible for
serializing your request, deserializing the response, and returning it to you, all while obeying the contract defined by
the specified interface.

In order to create the proxy, you'll first need an interface to define how and what you send and receive from an actor.
For example, if you want to communicate with a counting actor that solely keeps track of counts, you might define the
interface as follows:

```php
<?php
#[\Dapr\Actors\Attributes\DaprType('Counter')]
interface ICount {
    function increment(int $amount = 1): void;
    function get_count(): int;
}
```

It's a good idea to put this interface in a shared library that the actor and clients can both access (if both are written in PHP). The `DaprType`
attribute tells the DaprClient the name of the actor to send to. It should match the implementation's `DaprType`, though
you can override the type if needed.

```php
<?php
$app->run(function(\Dapr\Actors\ActorProxy $actorProxy) {
    $actor = $actorProxy->get(ICount::class, 'actor-id');
    $actor->increment(10);
});
```

## Writing Actors

To create an actor, you need to implement the interface you defined earlier and also add the `DaprType` attribute. All
actors *must* implement `IActor`, however there's an `Actor` base class that implements the boilerplate making your
implementation much simpler.

Here's the counter actor:

```php
<?php
#[\Dapr\Actors\Attributes\DaprType('Count')]
class Counter extends \Dapr\Actors\Actor implements ICount {
    function __construct(string $id, private CountState $state) {
        parent::__construct($id);
    }
    
    function increment(int $amount = 1): void {
        $this->state->count += $amount;
    }
    
    function get_count(): int {
        return $this->state->count;
    }
}
```

The most important bit is the constructor. It takes at least one argument with the name of `id` which is the id of the
actor. Any additional arguments are injected by the DI container, including any `ActorState` you want to use.

### Actor Lifecycle

An actor is instantiated via the constructor on every request targeting that actor type. You can use it to calculate
ephemeral state or handle any kind of request-specific startup you require, such as setting up other clients or
connections.

After the actor is instantiated, the `on_activation()` method may be called. The `on_activation()` method is called any
time the actor "wakes up" or when it is created for the first time. It is not called on every request.

Next, the actor method is called. This may be from a timer, reminder, or from a client. You may perform any work that
needs to be done and/or throw an exception.

Finally, the result of the work is returned to the caller. After some time (depending on how you've configured the
service), the actor will be deactivated and `on_deactivation()` will be called. This may not be called if the host dies,
daprd crashes, or some other error occurs which prevents it from being called successfully.

## Actor State

Actor state is a "Plain Old PHP Object" (POPO) that extends `ActorState`. The `ActorState` base class provides a couple
of useful methods. Here's an example implementation:

```php
<?php
class CountState extends \Dapr\Actors\ActorState {
    public int $count = 0;
}
```

## Registering an Actor

Dapr expects to know what actors a service may host at startup. You need to add it to the configuration:

{{< tabpane text=true >}}

{{% tab header="Production" %}}

If you want to take advantage of pre-compiled dependency injection, you need to use a factory:

```php
<?php
// in config.php

return [
    'dapr.actors' => fn() => [Counter::class],
];
```

All that is required to start the app:

```php
<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = \Dapr\App::create(
    configure: fn(\DI\ContainerBuilder $builder) => $builder->addDefinitions('config.php')->enableCompilation(__DIR__)
);
$app->start();
```

{{% /tab %}}
{{% tab header="Development" %}}

```php
<?php
// in config.php

return [
    'dapr.actors' => [Counter::class]
];
```

All that is required to start the app:

```php
<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = \Dapr\App::create(configure: fn(\DI\ContainerBuilder $builder) => $builder->addDefinitions('config.php'));
$app->start();
```

{{% /tab %}}
{{< /tabpane >}}
