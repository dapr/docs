# Query Redis data store

Dapr doesn't transform state values while saving and retriving states. And Dapr requires all data store implementations abidding to certain key format scheme (see [Dapr state management spec](https://github.com/dapr/spec/blob/master/state.md)). You can directly interact with the underlying store to manipulate the state data, such querying states, creating aggregated views and making backups.

>**NOTE:** The following samples uses Redis CLI against a Redis store using the default Dapr state store implementation. 

## 1. List keys by Dapr id

To get all state keys associated with a Dapr id "myapp", use command:

```bash
KEYS myapp*
```

The above command returns a list of existing keys:
```bash
1) "myapp-balance"
2) "myapp-amount"
```

## 2. Get specific state data

Dapr saves state values as hash values. Each hash value contains a "data" field, which contains the state data; and a "version" field, wich contains an ever-incrementing version serving as the ETag.

To get the state data by a key "myapp-balance", use command:

```bash
HGET myapp-balance data
```

To get the state version/ETag, use command:
```bash
HGET myapp-balance version
```
## 3. Read Actor state

To get all state keys associated with an Actor instance "leroy" of Actor type "cat" belonging to Dapr id "mypets", use command:

```bash
KEYS mypets-cat-leroy*
```
And to get a specific Actor state such as "food", use command:

```bash
HGET mypets-cat-leroy-food value
```

## 4. Delete state

> **WARNING:** You should not manually update or delete states. The following instructions are provided for rare cases that you have to manually intervene.

To delete a state by the key "myapp-balance", use command:
```bash
DEL myapp-balance
```
## 5. Update state

> **WARNING:** You should not manually update or delete states. The following instructions are provided for rare cases that you have to manually intervene.

When you manually update a state, you should maintain the associated version together with your state updates as a single transaction. This can be done by [running a Lua script](https://redis.io/commands/eval).

For example, the following command updates the state associated with the key "dapr1-mystate" to "new state", if the current ETag value in Redis is "3". 

```bash
EVAL "local var1 = redis.pcall(\"HGET\", KEYS[1], \"version\"); if type(var1) == \"table\" then redis.call(\"DEL\", KEYS[1]); end; if not var1 or type(var1)==\"table\" or var1 == \"\" or var1 == ARGV[1] or ARGV[1] == \"0\" then redis.call(\"HSET\", KEYS[1], \"data\", ARGV[2]) return redis.call(\"HINCRBY\", KEYS[1], \"version\", 1) else return error(\"failed to set key \" .. KEYS[1]) end" 1 "dapr1-mystate" "3" "new state"
```

If there's a ETag mismatch, you'll get an error saying ```failed to set key dapr1-mysate```.