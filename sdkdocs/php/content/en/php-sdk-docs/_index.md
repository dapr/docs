---
type: docs 
title: "Dapr PHP SDK"
linkTitle: "PHP"
weight: 1000 
description: PHP SDK packages for developing Dapr applications 
no_list: true
cascade:
  github_repo: https://github.com/dapr/php-sdk
  github_subdir: daprdocs/content/en/php-sdk-docs
  path_base_for_github_subdir: content/en/developing-applications/sdks/php/
  github_branch: main
---

Dapr offers an SDK to help with the development of PHP applications. Using it, you can create PHP clients, servers, and virtual actors with Dapr.

## Setting up

### Prerequisites

- [Composer](https://getcomposer.org/)
- [PHP 8](https://www.php.net/)

### Optional Prerequisites

- [Docker](https://www.docker.com/)
- [xdebug](http://xdebug.org/) -- for debugging

## Initialize your project

In a directory where you want to create your service, run `composer init` and answer the questions.
Install with `composer require dapr/php-sdk` and any other dependencies you may wish to use.

## Configure your service

Create a config.php, copying the contents below:

```php
<?php

use Dapr\Actors\Generators\ProxyFactory;
use Dapr\Middleware\Defaults\{Response\ApplicationJson,Tracing};
use Psr\Log\LogLevel;
use function DI\{env,get};

return [
    // set the log level
    'dapr.log.level'               => LogLevel::WARNING,

    // Generate a new proxy on each request - recommended for development
    'dapr.actors.proxy.generation' => ProxyFactory::GENERATED,
    
    // put any subscriptions here
    'dapr.subscriptions'           => [],
    
    // if this service will be hosting any actors, add them here
    'dapr.actors'                  => [],
    
    // if this service will be hosting any actors, configure how long until dapr should consider an actor idle
    'dapr.actors.idle_timeout'     => null,
    
    // if this service will be hosting any actors, configure how often dapr will check for idle actors 
    'dapr.actors.scan_interval'    => null,
    
    // if this service will be hosting any actors, configure how long dapr will wait for an actor to finish during drains
    'dapr.actors.drain_timeout'    => null,
    
    // if this service will be hosting any actors, configure if dapr should wait for an actor to finish
    'dapr.actors.drain_enabled'    => null,
    
    // you shouldn't have to change this, but the setting is here if you need to
    'dapr.port'                    => env('DAPR_HTTP_PORT', '3500'),
    
    // add any custom serialization routines here
    'dapr.serializers.custom'      => [],
    
    // add any custom deserialization routines here
    'dapr.deserializers.custom'    => [],
    
    // the following has no effect, as it is the default middlewares and processed in order specified
    'dapr.http.middleware.request'  => [get(Tracing::class)],
    'dapr.http.middleware.response' => [get(ApplicationJson::class), get(Tracing::class)],
];
```

## Create your service

Create `index.php` and put the following contents:

```php
<?php

require_once __DIR__.'/vendor/autoload.php';

use Dapr\App;

$app = App::create(configure: fn(\DI\ContainerBuilder $builder) => $builder->addDefinitions(__DIR__ . '/config.php'));
$app->get('/hello/{name}', function(string $name) {
    return ['hello' => $name];
});
$app->start();
```

## Try it out

Initialize dapr with `dapr init` and then start the project with `dapr run -a dev -p 3000 -- php -S 0.0.0.0:3000`.

<!-- IGNORE_LINKS -->
You can now open a web browser and point it to [http://localhost:3000/hello/world](http://localhost:3000/hello/world)
replacing `world` with your name, a pet's name, or whatever you want.
<!-- END_IGNORE -->

Congratulations, you've created your first Dapr service! I'm excited to see what you'll do with it!

## More Information

- [Packagist](https://packagist.org/packages/dapr/php-sdk)
- [Dapr SDK serialization]({{% ref sdk-serialization.md %}})
