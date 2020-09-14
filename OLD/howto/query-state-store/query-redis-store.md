# Query Redis state store

Dapr doesn't transform state values while saving and retrieving states. Dapr requires all state store implementations to abide by a certain key format scheme (see [Dapr state management spec](../../reference/api/state_api.md). You can directly interact with the underlying store to manipulate the state data, such querying states, creating aggregated views and making backups.

>**NOTE:** The following examples uses Redis CLI against a Redis store using the default Dapr state store implementation.

## 1. Connect to Redis

You can use the official [redis-cli](https://redis.io/topics/rediscli) or any other Redis compatible tools to connect to the Redis state store to directly query Dapr states. If you are running Redis in a container, the easiest way to use redis-cli is to use a container:

```bash
docker run --rm -it --link <name of the Redis container> redis redis-cli -h <name of the Redis container>
```

## 2. List keys by App ID

To get all state keys associated with application "myapp", use the command:

```bash
KEYS myapp*
```

The above command returns a list of existing keys, for example:

```bash
1) "myapp||balance"
2) "myapp||amount"
```

## 3. Get specific state data

Dapr saves state values as hash values. Each hash value contains a "data" field, which contains the state data and a "version" field, which contains an ever-incrementing version serving as the ETag.

For example, to get the state data by a key "balance" for the application "myapp", use the command:

```bash
HGET myapp||balance data
```

To get the state version/ETag, use the command:

```bash
HGET myapp||balance version
```

## 4. Read actor state

To get all the state keys associated with an actor with the instance ID "leroy" of actor type "cat" belonging to the application with ID "mypets", use the command:

```bash
KEYS mypets||cat||leroy*
```

And to get a specific actor state such as "food", use the command:

```bash
HGET mypets||cat||leroy||food value
```

> **WARNING:** You should not manually update or delete states in the store. All writes and delete operations should be done via the Dapr runtime.
