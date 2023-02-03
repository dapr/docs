---
type: docs
title: "Metadata API reference"
linkTitle: "Metadata API"
description: "Detailed documentation on the Metadata API"
weight: 1100
---

Dapr has a metadata API that returns information about the sidecar allowing runtime discoverability. The metadata endpoint returns a list of the components loaded, the activated actors (if present) and attributes with information attached.

## Components
Each loaded component provides its name, type and version and also information about supported features in the form of component capabilities. 
These features are available for the [state store]({{< ref supported-state-stores.md >}}) and [binding]({{< ref supported-bindings.md >}}) component types. The table below shows the component type and the list of capabilities for a given version. This list might grow in future and only represents the capabilities of the loaded components.

Component type | Capabilities
---------------| ------------
State Store    | ETAG, TRANSACTION, ACTOR, QUERY_API
Binding        | INPUT_BINDING, OUTPUT_BINDING

## Attributes

The metadata API allows you to store additional attribute information in the format of key-value pairs. These are ephemeral in-memory and are not persisted if a sidecar is reloaded. This information should be added at the time of a sidecar creation, for example, after the application has started. 

## Get the Dapr sidecar information

Gets the Dapr sidecar information provided by the Metadata Endpoint.

### Usecase:
The Get Metadata API can be used for discovering different capabilities supported by loaded components. It can help operators in determining which components to provision, for required capabilities.

### HTTP Request

```
GET http://localhost:<daprPort>/v1.0/metadata
```

### URL Parameters

Parameter | Description
--------- | -----------
daprPort  | The Dapr port.

### HTTP Response Codes

Code | Description
---- | -----------
200  | Metadata information returned
500  | Dapr could not return the metadata information

### HTTP Response Body

**Metadata API Response Object**

Name                   | Type                                                                  | Description
----                   | ----                                                                  | -----------
id                     | string                                                                | Application ID
actors                 | [Metadata API Response Registered Actor](#metadataapiresponseactor)[] | A json encoded array of registered actors metadata.
extended.attributeName | string                                                                | List of custom attributes as key-value pairs, where key is the attribute name.
components             | [Metadata API Response Component](#metadataapiresponsecomponent)[]    | A json encoded array of loaded components metadata.

<a id="metadataapiresponseactor"></a>**Metadata API Response Registered Actor**

Name  | Type    | Description
----  | ----    | -----------
type  | string  | The registered actor type.
count | integer | Number of actors running.

<a id="metadataapiresponsecomponent"></a>**Metadata API Response Component**

Name    | Type   | Description
----    | ----   | -----------
name    | string | Name of the component.
type    | string | Component type.
version | string | Component version.
capabilities | array | Supported capabilities for this component type and version. 

### Examples

Note: This example is based on the Actor sample provided in the [Dapr SDK for Python](https://github.com/dapr/python-sdk/tree/master/examples/demo_actor).

```shell
curl http://localhost:3500/v1.0/metadata
```

```json
{
    "id":"demo-actor",
    "actors":[
        {
            "type":"DemoActor",
            "count":1
        }
    ],
    "extended": {
        "cliPID":"1031040",
        "appCommand":"uvicorn --port 3000 demo_actor_service:app"
    },
    "components":[
        {
            "name":"pubsub",
            "type":"pubsub.redis",
            "version":"v1",
            "capabilities": [""]
        },
        {
            "name":"statestore",
            "type":"state.redis",
            "version":"v1",
            "capabilities": ["ETAG", "TRANSACTION", "ACTOR", "QUERY_API"]
        }
    ]
}
```

## Add a custom label to the Dapr sidecar information

Adds a custom label to the Dapr sidecar information stored by the Metadata endpoint.

### Usecase:
The metadata endpoint is, for example, used by the Dapr CLI when running dapr in self hosted mode to store the PID of the process hosting the sidecar and store the command used to run the application.  Applications can also add attributes as keys after startup.

### HTTP Request

```
PUT http://localhost:<daprPort>/v1.0/metadata/attributeName
```

### URL Parameters

Parameter      | Description
---------      | -----------
daprPort       | The Dapr port.
attributeName  | Custom attribute name. This is they key name in the key-value pair.

### HTTP Request Body

In the request you need to pass the custom attribute value as RAW data:

```json
{
  "Content-Type": "text/plain"
}
```

Within the body of the request place the custom attribute value you want to store:

```
attributeValue
```

### HTTP Response Codes

Code | Description
---- | -----------
204  | Custom attribute added to the metadata information

### Examples

Note: This example is based on the Actor sample provided in the [Dapr SDK for Python](https://github.com/dapr/python-sdk/tree/master/examples/demo_actor).

Add a custom attribute to the metadata endpoint:

```shell
curl -X PUT -H "Content-Type: text/plain" --data "myDemoAttributeValue" http://localhost:3500/v1.0/metadata/myDemoAttribute
```

Get the metadata information to confirm your custom attribute was added:

```json
{
    "id":"demo-actor",
    "actors":[
        {
            "type":"DemoActor",
            "count":1
        }
    ],
    "extended": {
        "myDemoAttribute": "myDemoAttributeValue",
        "cliPID":"1031040",
        "appCommand":"uvicorn --port 3000 demo_actor_service:app"
    },
    "components":[
        {
            "name":"pubsub",
            "type":"pubsub.redis",
            "version":"v1",
            "capabilities": [""]
        },
        {
            "name":"statestore",
            "type":"state.redis",
            "version":"v1",
            "capabilities": ["ETAG", "TRANSACTION", "ACTOR", "QUERY_API"]
        }
    ]
}
```



