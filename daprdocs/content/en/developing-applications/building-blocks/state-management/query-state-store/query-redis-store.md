---
type: docs
title: "Redis"
linkTitle: "Redis"
weight: 2000
description: "Use Redis as a state store"
---

Dapr doesn't transform state values while saving and retrieving states. Dapr requires all state store implementations to abide by a certain key format scheme (see [the state management spec]({{< ref state_api.md >}}). You can directly interact with the underlying store to manipulate the state data, such as:

- Querying states.
- Creating aggregated views.
- Making backups.

{{% alert title="Note" color="primary" %}}
The following examples uses Redis CLI against a Redis store using the default Dapr state store implementation.

{{% /alert %}}

## Connect to Redis

You can use the official [redis-cli](https://redis.io/topics/rediscli) or any other Redis compatible tools to connect to the Redis state store to query Dapr states directly. If you are running Redis in a container, the easiest way to use redis-cli is via a container:

```bash
docker run --rm -it --link <name of the Redis container> redis redis-cli -h <name of the Redis container>
```

## List keys by App ID

To get all state keys associated with application "myapp", use the command:

```bash
KEYS myapp*
```

The above command returns a list of existing keys, for example:

```bash
1) "myapp||balance"
2) "myapp||amount"
```

## Get specific state data

Dapr saves state values as hash values. Each hash value contains a "data" field, which contains:

- The state data.
- A "version" field, with an ever-incrementing version serving as the ETag.

For example, to get the state data by a key "balance" for the application "myapp", use the command:

```bash
HGET myapp||balance data
```

To get the state version/ETag, use the command:

```bash
HGET myapp||balance version
```

## Read actor state

To get all the state keys associated with an actor with the instance ID "leroy" of actor type "cat" belonging to the application with ID "mypets", use the command:

```bash
KEYS mypets||cat||leroy*
```

To get a specific actor state such as "food", use the command:

```bash
HGET mypets||cat||leroy||food value
```

{{% alert title="Warning" color="warning" %}}
You should not manually update or delete states in the store. All writes and delete operations should be done via the Dapr runtime. **The only exception:** it is often required to delete actor records in a state store, _once you know that these are no longer in use_, to prevent a build up of unused actor instances that may never be loaded again.

{{% /alert %}}