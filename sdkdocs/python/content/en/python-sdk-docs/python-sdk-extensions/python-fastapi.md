---
type: docs
title: "Dapr Python SDK integration with FastAPI"
linkTitle: "FastAPI"
weight: 200000
description: How to create Dapr Python virtual actors and pubsub with the FastAPI extension
---

The Dapr Python SDK provides integration with FastAPI using the `dapr-ext-fastapi` extension.

## Installation

You can download and install the Dapr FastAPI extension with:

{{< tabpane text=true >}}

{{% tab header="Stable" %}}
```bash
pip install dapr-ext-fastapi
```
{{% /tab %}}

{{% tab header="Development" %}}
{{% alert title="Note" color="warning" %}}
The development package will contain features and behavior that will be compatible with the pre-release version of the Dapr runtime. Make sure to uninstall any stable versions of the Python SDK extension before installing the `dapr-dev` package.
{{% /alert %}}

```bash
pip install dapr-ext-fastapi-dev
```
{{% /tab %}}

{{< /tabpane >}}

## Example

### Subscribing to events of different types

```python
import uvicorn
from fastapi import Body, FastAPI
from dapr.ext.fastapi import DaprApp
from pydantic import BaseModel

class RawEventModel(BaseModel):
    body: str

class User(BaseModel):
    id: int
    name: str

class CloudEventModel(BaseModel):
    data: User
    datacontenttype: str
    id: str
    pubsubname: str
    source: str
    specversion: str
    topic: str
    traceid: str
    traceparent: str
    tracestate: str
    type: str    
    
    
app = FastAPI()
dapr_app = DaprApp(app)

# Allow handling event with any structure (Easiest, but least robust)
# dapr publish --publish-app-id sample --topic any_topic --pubsub pubsub --data '{"id":"7", "desc": "good", "size":"small"}'
@dapr_app.subscribe(pubsub='pubsub', topic='any_topic')
def any_event_handler(event_data = Body()):
    print(event_data)    

# For robustness choose one of the below based on if publisher is using CloudEvents

# Handle events sent with CloudEvents
# dapr publish --publish-app-id sample --topic cloud_topic --pubsub pubsub --data '{"id":"7", "name":"Bob Jones"}'
@dapr_app.subscribe(pubsub='pubsub', topic='cloud_topic')
def cloud_event_handler(event_data: CloudEventModel):
    print(event_data)   

# Handle raw events sent without CloudEvents
# curl -X "POST" http://localhost:3500/v1.0/publish/pubsub/raw_topic?metadata.rawPayload=true -H "Content-Type: application/json" -d '{"body": "345"}'
@dapr_app.subscribe(pubsub='pubsub', topic='raw_topic')
def raw_event_handler(event_data: RawEventModel):
    print(event_data)    

 

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=30212)
```

### Creating an actor

```python
from fastapi import FastAPI
from dapr.ext.fastapi import DaprActor
from demo_actor import DemoActor

app = FastAPI(title=f'{DemoActor.__name__}Service')

# Add Dapr Actor Extension
actor = DaprActor(app)

@app.on_event("startup")
async def startup_event():
    # Register DemoActor
    await actor.register_actor(DemoActor)

@app.get("/GetMyData")
def get_my_data():
    return "{'message': 'myData'}"
```
