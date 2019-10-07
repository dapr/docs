# Create a stateful service

State management is one of the most common needs of any application: new or legacy, monolith or microservice.
Dealing with different databases libraries, testing them, handling retries and faults can be time consuming and hard.

Dapr provides state management capabilities that span a wide range of abilities including consistency and concurrency options.
In this guide we'll start of with the basics: using a Key/Value state API to allow our app to save, get and delete state.

## 1. Setup a state store

A state store component represents a resource that Dapr will use communicate with a database.
For the purpose of this guide, we'll use a Redis state store.

See a list of supported state stores [here](../setup-state-store/supported-state-stores.md)

### Using the Dapr CLI

The Dapr CLI automatically provisions a state store (Redis) and creates the relevant YAML when running your app with `dapr run`.
To change the state store being used, replace the YAML under `/components` with the file of your choice.

### Kubernetes

See the instructions [here](../setup-state-store) on how to setup different state stores on Kubernetes.

## 2. Save state

The following example shows how to save 2 items in a single call using the Save State API:

*The following example is written in Python, but is applicable to any programming language*

```python
import requests
import json

stateReq = '[{ "key": "k1", "value": "Some Data"}, { "key": "k2", "value": "Some More Data"}]'
response = requests.post("http://localhost:3500/v1.0/state/key1", json=stateReq)
```

## 3. Get state

The following example shows how to get an item by using a key with the Save State API:

*The following example is written in Python, but is applicable to any programming language*

```python
import requests
import json

response = requests.get("http://localhost:3500/v1.0/state/key1")
print(response.text)
```

## 4. Delete state

The following example shows how to delete an item by using a key with the Save State API:

*The following example is written in Python, but is applicable to any programming language*

```python
import requests
import json

response = requests.delete("http://localhost:3500/v1.0/state/key1")
```
