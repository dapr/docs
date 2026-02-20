---
type: docs
title: "Getting started with the Dapr client Rust SDK"
linkTitle: "Client"
weight: 20000
description: How to get up and running with the Dapr Rust SDK
no_list: true
---

The Dapr client package allows you to interact with other Dapr applications from
a Rust application.

{{% alert title="Note" color="primary" %}}
The Dapr Rust-SDK is currently in Alpha. Work is underway to bring it to a
stable release and will likely involve breaking changes.
{{% /alert %}}

## Prerequisites

- [Dapr CLI]({{% ref install-dapr-cli.md %}}) installed
- Initialized [Dapr environment]({{% ref install-dapr-selfhost.md %}})
- [Rust installed](https://www.rust-lang.org/tools/install)

## Import the client package

Add Dapr to your `cargo.toml`

```toml
[dependencies]
dapr = "0.16"
```

You can either reference `dapr::Client` or bind the full path to a new name as follows:

```rust
use dapr::Client as DaprClient;
```

## Instantiating the Dapr client

```rust
let addr = "https://127.0.0.1".to_string();

let mut client = dapr::Client::<dapr::client::TonicClient>::connect(addr,
port).await?;
```

Alternatively if you would like to specify a custom port, this can be done by using this connect method:

```rust
let mut client = dapr::Client::<dapr::client::TonicClient>::connect_with_port(addr, "3500".to_string()).await?;
```

## Building blocks

The Rust SDK allows you to interface with the
[Dapr building blocks]({{% ref building-blocks %}}).

### Service Invocation (gRPC)

To invoke a specific method on another service running with Dapr sidecar, the
Dapr client provides two options:

Invoke a (gRPC) service

```rust
let response = client
    .invoke_service("service-to-invoke", "method-to-invoke", Some(data))
    .await
    .unwrap();
```

For a full guide on service invocation, visit
[How-To: Invoke a service]({{% ref howto-invoke-discover-services.md %}}).

### State Management

The Dapr Client provides access to these state management methods:  `save_state`
, `get_state`, `delete_state` that can be used like so:

```rust
let store_name = String::from("statestore");

let key = String::from("hello");
let val = String::from("world").into_bytes();

// save key-value pair in the state store
client
    .save_state(store_name, key, val, None, None, None)
    .await?;

let get_response = client
    .get_state("statestore", "hello", None)
    .await?;

// delete a value from the state store
client
    .delete_state("statestore", "hello", None)
    .await?;
```

Multiple states can be sent with the `save_bulk_states` method.

For a full guide on state management, visit
[How-To: Save & get state]({{% ref howto-get-save-state.md %}}).

### Publish Messages

To publish data onto a topic, the Dapr client provides a simple method:

```rust
let pubsub_name = "pubsub-name".to_string();
let pubsub_topic = "topic-name".to_string();
let pubsub_content_type = "text/plain".to_string();

let data = "content".to_string().into_bytes();
client
    .publish_event(pubsub_name, pubsub_topic, pubsub_content_type, data, None)
    .await?;
```

For a full guide on pub/sub, visit
[How-To: Publish & subscribe]({{% ref howto-publish-subscribe.md %}}).

## Related links

[Rust SDK Examples](https://github.com/dapr/rust-sdk/tree/master/examples)
