# Query Redis data store

Dapr doesn't transform state values while saving and retriving states. And Dapr requires all data store implementations abidding to certain key format scheme (see [Dapr state management spec](https://github.com/dapr/spec/blob/master/state.md)). You can directly interact with the underlying store to manipulate the state data, such querying states, creating aggregated views and making backups.

>**NOTE:** The following samples uses Redis CLI against a Redis store using the default Dapr state store implementation. 

## 1. List keys by Dapr id

To get all state keys associated with application "myapp", use command:

```bash
KEYS myapp*
```

The above command returns a list of existing keys:
```bash
1) "myapp-balance"
2) "myapp-amount"
```

## 2. Get specific state data

Dapr saves state values as hash values. Each hash value contains a "data" field, which contains the state data; and a "version" field, which contains an ever-incrementing version serving as the ETag.

To get the state data by a key "balance" for application "myapp", use command:

```bash
HGET myapp-balance data
```

To get the state version/ETag, use command:
```bash
HGET myapp-balance version
```
## 3. Read Actor state

To get all state keys associated with an Actor instance "leroy" of Actor type "cat" belonging to application "mypets", use command:

```bash
KEYS mypets-cat-leroy*
```
And to get a specific Actor state such as "food", use command:

```bash
HGET mypets-cat-leroy-food value
```

> **WARNING:** You should not manually update or delete states.
