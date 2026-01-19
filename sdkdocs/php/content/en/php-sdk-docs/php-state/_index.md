---
type: docs 
title: "State Management with PHP"
linkTitle: "State management"
weight: 1000 
description: How to use 
no_list: true
---

Dapr offers a great modular approach to using state in your application. The best way to learn the basics is to visit
[the howto]({{% ref howto-get-save-state.md %}}).

## Metadata

Many state components allow you to pass metadata to the component to control specific aspects of the component's
behavior. The PHP SDK allows you to pass that metadata through:

```php
<?php
// using the state manager
$app->run(
    fn(\Dapr\State\StateManager $stateManager) => 
        $stateManager->save_state('statestore', new \Dapr\State\StateItem('key', 'value', metadata: ['port' => '112'])));

// using the DaprClient
$app->run(fn(\Dapr\Client\DaprClient $daprClient) => $daprClient->saveState(storeName: 'statestore', key: 'key', value: 'value', metadata: ['port' => '112']))
```

This is an example of how you might pass the port metadata to [Cassandra]({{% ref setup-cassandra.md %}}).

Every state operation allows passing metadata.

## Consistency/concurrency

In the PHP SDK, there are four classes that represent the four different types of consistency and concurrency in Dapr:

```php
<?php
[
    \Dapr\consistency\StrongLastWrite::class, 
    \Dapr\consistency\StrongFirstWrite::class,
    \Dapr\consistency\EventualLastWrite::class,
    \Dapr\consistency\EventualFirstWrite::class,
] 
```

Passing one of them to a `StateManager` method or using the `StateStore()` attribute allows you to define how the state
store should handle conflicts.

## Parallelism

When doing a bulk read or beginning a transaction, you can specify the amount of parallelism. Dapr will read "at most"
that many keys at a time from the underlying store if it has to read one key at a time. This can be helpful to control
the load on the state store at the expense of performance. The default is `10`.

## Prefix

Hardcoded key names are useful, but why not make state objects more reusable? When committing a transaction or saving an
object to state, you can pass a prefix that is applied to every key in the object.

{{< tabpane text=true >}}

{{% tab header="Transaction prefix" %}}

```php
<?php
class TransactionObject extends \Dapr\State\TransactionalState {
    public string $key;
}

$app->run(function (TransactionObject $object ) {
    $object->begin(prefix: 'my-prefix-');
    $object->key = 'value';
    // commit to key `my-prefix-key`
    $object->commit();
});
```

{{% /tab %}}
{{% tab header="StateManager prefix" %}}

```php
<?php
class StateObject {
    public string $key;
}

$app->run(function(\Dapr\State\StateManager $stateManager) {
    $stateManager->load_object($obj = new StateObject(), prefix: 'my-prefix-');
    // original value is from `my-prefix-key`
    $obj->key = 'value';
    // save to `my-prefix-key`
    $stateManager->save_object($obj, prefix: 'my-prefix-');
});
```

{{% /tab %}}

{{< /tabpane >}}
