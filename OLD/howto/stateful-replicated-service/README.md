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

## Strong and Eventual consistency

Using strong consistency, Dapr will make sure the underlying state store returns the response once the data has been written to all replicas or received an ack from a quorum before writing or deleting state.

For get requests, Dapr will make sure the store returns the most up to date data consistently among replicas.
The default is eventual consistency, unless specified otherwise in the request to the state API.

The following examples illustrates using strong consistency:

### Saving state

*The following example is written in Python, but is applicable to any programming language*

```python
import requests
import json

store_name = "redis-store" # name of the state store as specified in state store component yaml file
dapr_state_url = "http://localhost:3500/v1.0/state/{}".format(store_name)
stateReq = '[{ "key": "k1", "value": "Some Data", "options": { "consistency": "strong" }}]'
response = requests.post(dapr_state_url, json=stateReq)
```

### Getting state

*The following example is written in Python, but is applicable to any programming language*

```python
import requests
import json

store_name = "redis-store" # name of the state store as specified in state store component yaml file
dapr_state_url = "http://localhost:3500/v1.0/state/{}".format(store_name)
response = requests.get(dapr_state_url + "/key1", headers={"consistency":"strong"})
print(response.headers['ETag'])
```

### Deleting state

*The following example is written in Python, but is applicable to any programming language*

```python
import requests
import json

store_name = "redis-store" # name of the state store as specified in state store component yaml file
dapr_state_url = "http://localhost:3500/v1.0/state/{}".format(store_name)
response = requests.delete(dapr_state_url + "/key1", headers={"consistency":"strong"})
```

Last-write concurrency is the default concurrency mode if the `concurrency` option is not specified.

## First-write-wins and Last-write-wins

Dapr allows developers to opt-in for two common concurrency patterns when working with data stores: First-write-wins and Last-write-wins.
First-Write-Wins is useful in situations where you have multiple instances of an application, all writing to the same key concurrently.

The default mode for Dapr is Last-write-wins.

Dapr uses version numbers to determine whether a specific key has been updated. Clients retain the version number when reading the data for a key and then use the version number during updates such as writes and deletes. If the version information has changed since the client retrieved, an error is thrown, which then requires the client to perform a read again to get the latest version information and state.

Dapr utilizes ETags to determine the state's version number. ETags are returned from state requests in an `ETag` header.

Using ETags, clients know that a resource has been updated since the last time they checked by erroring when there's an ETag mismatch.

The following example shows how to get an ETag, and then use it to save state and then delete the state:

*The following example is written in Python, but is applicable to any programming language*

```python
import requests
import json

store_name = "redis-store" # name of the state store as specified in state store component yaml file
dapr_state_url = "http://localhost:3500/v1.0/state/{}".format(store_name)
response = requests.get(dapr_state_url + "/key1", headers={"concurrency":"first-write"})
etag = response.headers['ETag']
newState = '[{ "key": "k1", "value": "New Data", "etag": {}, "options": { "concurrency": "first-write" }}]'.format(etag)

requests.post(dapr_state_url, json=newState)
response = requests.delete(dapr_state_url + "/key1", headers={"If-Match": "{}".format(etag)})
```

### Handling version mismatch failures

In this example, we'll see how to retry a save state operation when the version has changed:

```python
import requests
import json

# This method saves the state and returns false if failed to save state
def save_state(data):
    try:
        store_name = "redis-store" # name of the state store as specified in state store component yaml file
        dapr_state_url = "http://localhost:3500/v1.0/state/{}".format(store_name)
        response = requests.post(dapr_state_url, json=data)
        if response.status_code == 200:
            return True
    except:
        return False
    return False

# This method gets the state and returns the response, with the ETag in the header -->
def get_state(key):
    response = requests.get("http://localhost:3500/v1.0/state/<state_store_name>/{}".format(key), headers={"concurrency":"first-write"})
    return response

# Exit when save state is successful. success will be False if there's an ETag mismatch -->
success = False
while success != True:
    response = get_state("key1")
    etag = response.headers['ETag']
    newState = '[{ "key": "key1", "value": "New Data", "etag": {}, "options": { "concurrency": "first-write" }}]'.format(etag)

    success = save_state(newState)
```
