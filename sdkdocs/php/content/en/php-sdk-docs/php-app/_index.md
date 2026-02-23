---
type: docs
title: "The App"
linkTitle: "App"
weight: 1000
description: Using the App Class
no_list: true
---

In PHP, there is no default router. Thus, the `\Dapr\App` class is provided. It uses 
[Nikic's FastRoute](https://github.com/nikic/FastRoute) under the hood. However, you are free to use any router or
framework that you'd like. Just check out the `add_dapr_routes()` method in the `App` class to see how actors and
subscriptions are implemented.

Every app should start with `App::create()` which takes two parameters, the first is an existing DI container, if you
have one, and the second is a callback to hook into the `ContainerBuilder` and add your own configuration.

From there, you should define your routes and then call `$app->start()` to execute the route on the current request.


```php
<?php
// app.php

require_once __DIR__ . '/vendor/autoload.php';

$app = \Dapr\App::create(configure: fn(\DI\ContainerBuilder $builder) => $builder->addDefinitions('config.php'));

// add a controller for GET /test/{id} that returns the id
$app->get('/test/{id}', fn(string $id) => $id);

$app->start();
```

## Returning from a controller

You can return anything from a controller, and it will be serialized into a json object. You can also request the
Psr Response object and return that instead, allowing you to customize headers, and have control over the entire response:

```php
<?php
$app = \Dapr\App::create(configure: fn(\DI\ContainerBuilder $builder) => $builder->addDefinitions('config.php'));

// add a controller for GET /test/{id} that returns the id
$app->get('/test/{id}', 
    fn(
        string $id, 
        \Psr\Http\Message\ResponseInterface $response, 
        \Nyholm\Psr7\Factory\Psr17Factory $factory) => $response->withBody($factory->createStream($id)));

$app->start();
```

## Using the app as a client

When you just want to use Dapr as a client, such as in existing code, you can call `$app->run()`. In these cases, there's
usually no need for a custom configuration, however, you may want to use a compiled DI container, especially in production:

```php
<?php
// app.php

require_once __DIR__ . '/vendor/autoload.php';

$app = \Dapr\App::create(configure: fn(\DI\ContainerBuilder $builder) => $builder->enableCompilation(__DIR__));
$result = $app->run(fn(\Dapr\DaprClient $client) => $client->get('/invoke/other-app/method/my-method'));
```

## Using in other frameworks

A `DaprClient` object is provided, in fact, all the sugar used by the `App` object is built on the `DaprClient`.

```php
<?php

require_once __DIR__ . '/vendor/autoload.php';

$clientBuilder = \Dapr\Client\DaprClient::clientBuilder();

// you can customize (de)serialization or comment out to use the default JSON serializers.
$clientBuilder = $clientBuilder->withSerializationConfig($yourSerializer)->withDeserializationConfig($yourDeserializer);

// you can also pass it a logger
$clientBuilder = $clientBuilder->withLogger($myLogger);

// and change the url of the sidecar, for example, using https
$clientBuilder = $clientBuilder->useHttpClient('https://localhost:3800') 
```

There are several functions you can call before 
