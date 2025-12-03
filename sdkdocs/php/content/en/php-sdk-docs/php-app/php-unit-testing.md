---
type: docs
title: "Unit Testing"
linkTitle: "Unit Testing"
weight: 1000
description: Unit Testing
no_list: true
---

Unit and integration tests are first-class citizens with the PHP SDK. Using the DI container, mocks, stubs,
and the provided `\Dapr\Mocks\TestClient` allows you to have very fine-grained tests.

## Testing Actors

With actors, there are two things we're interested in while the actor is under test:

1. The returned result based on an initial state
2. The resulting state based on the initial state

{{< tabpane text=true >}}

{{% tab header="integration test with TestClient" %}}

Here's an example test a very simple actor that updates its state and returns a specific value:

```php
<?php

// TestState.php

class TestState extends \Dapr\Actors\ActorState
{
    public int $number;
}

// TestActor.php

#[\Dapr\Actors\Attributes\DaprType('TestActor')]
class TestActor extends \Dapr\Actors\Actor
{
    public function __construct(string $id, private TestState $state)
    {
        parent::__construct($id);
    }

    public function oddIncrement(): bool
    {
        if ($this->state->number % 2 === 0) {
            return false;
        }
        $this->state->number += 1;

        return true;
    }
}

// TheTest.php

class TheTest extends \PHPUnit\Framework\TestCase
{
    private \DI\Container $container;

    public function setUp(): void
    {
        parent::setUp();
        // create a default app and extract the DI container from it
        $app = \Dapr\App::create(
            configure: fn(\DI\ContainerBuilder $builder) => $builder->addDefinitions(
            ['dapr.actors' => [TestActor::class]],
            [\Dapr\DaprClient::class => \DI\autowire(\Dapr\Mocks\TestClient::class)]
        ));
        $app->run(fn(\DI\Container $container) => $this->container = $container);
    }

    public function testIncrementsWhenOdd()
    {
        $id      = uniqid();
        $runtime = $this->container->get(\Dapr\Actors\ActorRuntime::class);
        $client  = $this->getClient();

        // return the current state from http://localhost:1313/reference/api/actors_api/
        $client->register_get("/actors/TestActor/$id/state/number", code: 200, data: 3);

        // ensure it increments from http://localhost:1313/reference/api/actors_api/
        $client->register_post(
            "/actors/TestActor/$id/state",
            code: 204,
            response_data: null,
            expected_request: [
                [
                    'operation' => 'upsert',
                    'request'   => [
                        'key'   => 'number',
                        'value' => 4,
                    ],
                ],
            ]
        );

        $result = $runtime->resolve_actor(
            'TestActor',
            $id,
            fn($actor) => $runtime->do_method($actor, 'oddIncrement', null)
        );
        $this->assertTrue($result);
    }

    private function getClient(): \Dapr\Mocks\TestClient
    {
        return $this->container->get(\Dapr\DaprClient::class);
    }
}
```

{{% /tab %}}
{{% tab header="unit test" %}}

```php
<?php

// TestState.php

class TestState extends \Dapr\Actors\ActorState
{
    public int $number;
}

// TestActor.php

#[\Dapr\Actors\Attributes\DaprType('TestActor')]
class TestActor extends \Dapr\Actors\Actor
{
    public function __construct(string $id, private TestState $state)
    {
        parent::__construct($id);
    }

    public function oddIncrement(): bool
    {
        if ($this->state->number % 2 === 0) {
            return false;
        }
        $this->state->number += 1;

        return true;
    }
}

// TheTest.php

class TheTest extends \PHPUnit\Framework\TestCase
{
    public function testNotIncrementsWhenEven() {
        $container = new \DI\Container();
        $state = new TestState($container, $container);
        $state->number = 4;
        $id = uniqid();
        $actor = new TestActor($id, $state);
        $this->assertFalse($actor->oddIncrement());
        $this->assertSame(4, $state->number);
    }
}
```

{{% /tab %}}

{{< /tabpane >}}

## Testing Transactions

When building on transactions, you'll likely want to test how a failed transaction is handled. In order to do that, you
need to inject failures and ensure the transaction matches what you expect.

{{< tabpane text=true >}}

{{% tab header="integration test with TestClient" %}}

```php
<?php

// MyState.php
#[\Dapr\State\Attributes\StateStore('statestore', \Dapr\consistency\EventualFirstWrite::class)]
class MyState extends \Dapr\State\TransactionalState {
    public string $value = '';
}

// SomeService.php
class SomeService {
    public function __construct(private MyState $state) {}

    public function doWork() {
        $this->state->begin();
        $this->state->value = "hello world";
        $this->state->commit();
    }
}

// TheTest.php
class TheTest extends \PHPUnit\Framework\TestCase {
    private \DI\Container $container;

    public function setUp(): void
    {
        parent::setUp();
        $app = \Dapr\App::create(configure: fn(\DI\ContainerBuilder $builder)
            => $builder->addDefinitions([\Dapr\DaprClient::class => \DI\autowire(\Dapr\Mocks\TestClient::class)]));
        $this->container = $app->run(fn(\DI\Container $container) => $container);
    }

    private function getClient(): \Dapr\Mocks\TestClient {
        return $this->container->get(\Dapr\DaprClient::class);
    }

    public function testTransactionFailure() {
        $client = $this->getClient();

        // create a response from {{% ref state_api %}}
        $client->register_post('/state/statestore/bulk', code: 200, response_data: [
            [
                'key' => 'value',
                // no previous value
            ],
        ], expected_request: [
            'keys' => ['value'],
            'parallelism' => 10
        ]);
        $client->register_post('/state/statestore/transaction',
            code: 200,
            response_data: null,
            expected_request: [
                'operations' => [
                    [
                        'operation' => 'upsert',
                        'request' => [
                            'key' => 'value',
                            'value' => 'hello world'
                        ]
                    ]
                ]
            ]
        );
        $state = new MyState($this->container, $this->container);
        $service = new SomeService($state);
        $service->doWork();
        $this->assertSame('hello world', $state->value);
    }
}
```

{{% /tab %}}
{{% tab header="unit test" %}}

```php
<?php
// MyState.php
#[\Dapr\State\Attributes\StateStore('statestore', \Dapr\consistency\EventualFirstWrite::class)]
class MyState extends \Dapr\State\TransactionalState {
    public string $value = '';
}

// SomeService.php
class SomeService {
    public function __construct(private MyState $state) {}

    public function doWork() {
        $this->state->begin();
        $this->state->value = "hello world";
        $this->state->commit();
    }
}

// TheTest.php
class TheTest extends \PHPUnit\Framework\TestCase {
    public function testTransactionFailure() {
        $state = $this->createStub(MyState::class);
        $service = new SomeService($state);
        $service->doWork();
        $this->assertSame('hello world', $state->value);
    }
}
```

{{% /tab %}}

{{< /tabpane >}}
