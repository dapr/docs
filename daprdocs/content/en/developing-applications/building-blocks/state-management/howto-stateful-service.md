---
type: docs
title: "How-To: Build a stateful service"
linkTitle: "How-To: Build a stateful service"
weight: 300
description: "Use state management with a scaled, replicated service"
---

In this article, you'll learn how to create a stateful service which can be horizontally scaled, using opt-in concurrency and consistency models. Consuming the state management API frees developers from difficult state coordination, conflict resolution, and failure handling.

## Set up a state store

A state store component represents a resource that Dapr uses to communicate with a database.
For the purpose of this guide, we'll use the default Redis state store.

### Using the Dapr CLI

When you run `dapr init` in self-hosted mode, Dapr creates a default Redis `statestore.yaml` and runs a Redis state store on your local machine, located:

- On Windows, under `%UserProfile%\.dapr\components\statestore.yaml`
- On Linux/MacOS, under `~/.dapr/components/statestore.yaml`

With the `statestore.yaml` component, you can easily swap out underlying components without application code changes.

See a [list of supported state stores]({{< ref supported-state-stores >}}).

### Kubernetes

See [how to setup different state stores on Kubernetes]({{<ref setup-state-store>}}).

## Strong and eventual consistency

Using strong consistency, Dapr makes sure that the underlying state store:

- Returns the response once the data has been written to all replicas.
- Receives an ACK from a quorum before writing or deleting state.

For get requests, Dapr ensures the store returns the most up-to-date data consistently among replicas. The default is eventual consistency, unless specified otherwise in the request to the state API.

The following examples illustrate how to save, get, and delete state using strong consistency. The example is written in Python, but is applicable to any programming language.

### Saving state

```python
import requests
import json

store_name = "redis-store" # name of the state store as specified in state store component yaml file
dapr_state_url = "http://localhost:3500/v1.0/state/{}".format(store_name)
stateReq = '[{ "key": "k1", "value": "Some Data", "options": { "consistency": "strong" }}]'
response = requests.post(dapr_state_url, json=stateReq)
```

### Getting state

```python
import requests
import json

store_name = "redis-store" # name of the state store as specified in state store component yaml file
dapr_state_url = "http://localhost:3500/v1.0/state/{}".format(store_name)
response = requests.get(dapr_state_url + "/key1", headers={"consistency":"strong"})
print(response.headers['ETag'])
```

### Deleting state

```python
import requests
import json

store_name = "redis-store" # name of the state store as specified in state store component yaml file
dapr_state_url = "http://localhost:3500/v1.0/state/{}".format(store_name)
response = requests.delete(dapr_state_url + "/key1", headers={"consistency":"strong"})
```

If the `concurrency` option hasn't been specified, the default is last-write concurrency mode.

## First-write-wins and last-write-wins

Dapr allows developers to opt-in for two common concurrency patterns when working with data stores: 

- **First-write-wins**: useful in situations where you have multiple instances of an application, all writing to the same key concurrently.
- **Last-write-wins**: Default mode for Dapr.

Dapr uses version numbers to determine whether a specific key has been updated. You can:

1. Retain the version number when reading the data for a key.
1. Use the version number during updates such as writes and deletes. 

If the version information has changed since the version number was retrieved, an error is thrown, requiring you to perform another read to get the latest version information and state.

Dapr utilizes ETags to determine the state's version number. ETags are returned from state requests in an `ETag` header. Using ETags, your application knows that a resource has been updated since the last time they checked by erroring during an ETag mismatch.

The following example shows how to:

- Get an ETag.
- Use the ETag to save state.
- Delete the state.

The following example is written in Python, but is applicable to any programming language.

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

In the following example, you'll see how to retry a save state operation when the version has changed:

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
