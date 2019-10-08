# Create a stateful replicated service

In this HowTo we'll show you how you can create a stateful service which can be horizontally scaled, using opt-in concurrency and consistency models.

This frees developers from difficult state coordination, conflict resolution and failure handling, and allows them instead to consume these capabilities as APIs from Dapr.

## 1. Setup a state store

A state store component represents a resource that Dapr uses to communicate with a database.
For the purpose of this guide, we'll use a Redis state store.

See a list of supported state stores [here](../setup-state-store/supported-state-stores.md)

### Using the Dapr CLI

The Dapr CLI automatically provisions a state store (Redis) and creates the relevant YAML when running your app with `dapr run`.
To change the state store being used, replace the YAML under `/components` with the file of your choice.

### Kubernetes

See the instructions [here](../setup-state-store) on how to setup different state stores on Kubernetes.

## 2. Save state

### Strong consistency

Using strong consistency, Dapr ensures that the underlying state store returns a response once the data has been written to all replicas. This example shows how to save an item with strong consistency.

*The following example is written in Python, but is applicable to any programming language*

```python
import requests
import json

stateReq = '[{ "key": "k1", "value": "Some Data", "options": { "consistency": "strong" }}]'
response = requests.post("http://localhost:3500/v1.0/state/key1", json=stateReq)
```

### Eventual consistency

This example shows how to save an item with eventual consistency:

*The following example is written in Python, but is applicable to any programming language*

```python
import requests
import json

stateReq = '[{ "key": "k1", "value": "Some Data", "options": { "consistency": "eventual" }}]'
response = requests.post("http://localhost:3500/v1.0/state/key1", json=stateReq)
```

Eventual consistency is the default consistency mode if the `consistency` option is not specified.


### First-Write-Wins

This example shows how to save an item with a first-write-wins policy.
This comes in handy when you have multiple instances of the same service writing to the same key.

Dapr utilizes ETags to determine the state's version number. ETags are returned from state requests in an `ETag` header.

*The following example is written in Python, but is applicable to any programming language*

```python
import requests
import json

stateReq = '[{ "key": "k1", "value": "Some Data", "etag": "abc12345", "options": { "concurrency": "first-write" }}]'
response = requests.post("http://localhost:3500/v1.0/state/key1", json=stateReq)
```

### Last-Write-Wins

This example shows how to save an item with a last-write-wins policy.

*The following example is written in Python, but is applicable to any programming language*

```python
import requests
import json

stateReq = '[{ "key": "k1", "value": "Some Data", "options": { "concurrency": "last-write" }}]'
response = requests.post("http://localhost:3500/v1.0/state/key1", json=stateReq)
```
Last-write concurrency is the default concurrency mode if the `concurrency` option is not specified.

## 3. Get state - Strong consistency

The following example shows how to get the most updated snapshot of the data using strong consistency:

*The following example is written in Python, but is applicable to any programming language*

```python
import requests
import json

response = requests.get("http://localhost:3500/v1.0/state/key1", headers={"consistency":"strong"})
print(response.headers['ETag'])
```

## 4. Delete state - Strong consistency

The following example shows how to delete an item using strong consistency:

*The following example is written in Python, but is applicable to any programming language*

```python
import requests
import json

response = requests.delete("http://localhost:3500/v1.0/state/key1", headers={"consistency":"strong", "etag": "abc12345"})
```
