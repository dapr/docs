---
type: docs
title: "Metadata API reference"
linkTitle: "Metadata API"
description: "Detailed documentation on the Metadata API"
weight: 1100
---

Dapr has a metadata API that returns information about the sidecar allowing runtime discoverability. The metadata endpoint returns the following information.
- Runtime version
- List of the loaded resources (`components`, `subscriptions` and `HttpEndpoints`)
- Registered actor types
- Features enabled
- Application connection details
- Custom, ephemeral attributes with information.

## Metadata API

### Components
Each loaded component provides its name, type and version and also information about supported features in the form of component capabilities. 
These features are available for the [state store]({{< ref supported-state-stores.md >}}) and [binding]({{< ref supported-bindings.md >}}) component types. The table below shows the component type and the list of capabilities for a given version. This list might grow in future and only represents the capabilities of the loaded components.

Component type | Capabilities
---------------| ------------
State Store    | ETAG, TRANSACTION, ACTOR, QUERY_API
Binding        | INPUT_BINDING, OUTPUT_BINDING

### HTTPEndpoints
Each loaded `HttpEndpoint` provides a name to easily identify the Dapr resource associated with the runtime.

### Subscriptions
The metadata API returns a list of pub/sub subscriptions that the app has registered with the Dapr runtime. This includes the pub/sub name, topic, routes, dead letter topic, and the metadata associated with the subscription.

### Enabled features
A list of features enabled via Configuration spec (including build-time overrides).

### App connection details
The metadata API returns information related to Dapr's connection to the app. This includes the app port, protocol, host, max concurrency, along with health check details.

### Attributes

The metadata API allows you to store additional attribute information in the format of key-value pairs. These are ephemeral in-memory and are not persisted if a sidecar is reloaded. This information should be added at the time of a sidecar creation (for example, after the application has started).

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
runtimeVersion         | string                                                                | Version of the Dapr runtime
enabledFeatures        | string[]                                                              | List of features enabled by Dapr Configuration, see https://docs.dapr.io/operations/configuration/preview-features/
actors                 | [Metadata API Response Registered Actor](#metadataapiresponseactor)[] | A json encoded array of registered actors metadata.
extended.attributeName | string                                                                | List of custom attributes as key-value pairs, where key is the attribute name.
components             | [Metadata API Response Component](#metadataapiresponsecomponent)[]    | A json encoded array of loaded components metadata.
httpEndpoints          | [Metadata API Response HttpEndpoint](#metadataapiresponsehttpendpoint)[] | A json encoded array of loaded HttpEndpoints metadata.
subscriptions          | [Metadata API Response Subscription](#metadataapiresponsesubscription)[] | A json encoded array of pub/sub subscriptions metadata.
appConnectionProperties| [Metadata API Response AppConnectionProperties](#metadataapiresponseappconnectionproperties) | A json encoded object of app connection properties.

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

<a id="metadataapiresponsehttpendpoint"></a>**Metadata API Response HttpEndpoint**

Name    | Type   | Description
----    | ----   | -----------
name    | string | Name of the HttpEndpoint.

<a id="metadataapiresponsesubscription"></a>**Metadata API Response Subscription**

Name            | Type   | Description
----            | ----   | -----------
pubsubname      | string | Name of the pub/sub.
topic           | string | Topic name.
metadata        | object | Metadata associated with the subscription.
rules           | [Metadata API Response Subscription Rules](#metadataapiresponsesubscriptionrules)[] | List of rules associated with the subscription.
deadLetterTopic | string | Dead letter topic name.

<a id="metadataapiresponsesubscriptionrules"></a>**Metadata API Response Subscription Rules**

Name    | Type   | Description
----    | ----   | -----------
match   | string | CEL expression to match the message, see https://docs.dapr.io/developing-applications/building-blocks/pubsub/howto-route-messages/#common-expression-language-cel
path    | string | Path to route the message if the match expression is true.

<a id="metadataapiresponseappconnectionproperties"></a>**Metadata API Response AppConnectionProperties**

Name          | Type   | Description
----          | ----   | -----------
port          | integer| Port on which the app is listening.
protocol      | string | Protocol used by the app.
channelAddress| string | Host address on which the app is listening.
maxConcurrency| integer| Maximum number of concurrent requests the app can handle.
health        | [Metadata API Response AppConnectionProperties Health](#metadataapiresponseappconnectionpropertieshealth) | Health check details of the app.

<a id="metadataapiresponseappconnectionpropertieshealth"></a>**Metadata API Response AppConnectionProperties Health**

Name            | Type   | Description
----            | ----   | -----------
healthCheckPath | string | Health check path, applicable for HTTP protocol.
healthProbeInterval | string | Time between each health probe, in go duration format.
healthProbeTimeout | string | Timeout for each health probe, in go duration format.
healthThreshold | integer | Max number of failed health probes before the app is considered unhealthy.


### Examples

```shell
curl http://localhost:3500/v1.0/metadata
```

```json
{
  "id": "myApp",
  "runtimeVersion": "1.12.0",
  "enabledFeatures": [
    "ServiceInvocationStreaming"
  ],
  "actors": [
    {
      "type": "DemoActor"
    }
  ],
  "components": [
    {
      "name": "pubsub",
      "type": "pubsub.redis",
      "version": "v1"
    },
    {
      "name": "statestore",
      "type": "state.redis",
      "version": "v1",
      "capabilities": [
        "ETAG",
        "TRANSACTIONAL",
        "ACTOR"
      ]
    }
  ],
  "httpEndpoints": [
    {
      "name": "my-backend-api"
    }
  ],
  "subscriptions": [
    {
      "pubsubname": "pubsub",
      "topic": "orders",
      "deadLetterTopic": "",
      "metadata": {
        "ttlInSeconds": "30"
      },
      "rules": [
          {
              "match": "%!s(<nil>)",
              "path": "orders"
          }
      ]
    }
  ],
  "extended": {
    "appCommand": "uvicorn --port 3000 demo_actor_service:app",
    "appPID": "98121",
    "cliPID": "98114",
    "daprRuntimeVersion": "1.12.0"
  },
  "appConnectionProperties": {
    "port": 3000,
    "protocol": "http",
    "channelAddress": "127.0.0.1",
    "health": {
      "healthProbeInterval": "5s",
      "healthProbeTimeout": "500ms",
      "healthThreshold": 3
    }
  }
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

Add a custom attribute to the metadata endpoint:

```shell
curl -X PUT -H "Content-Type: text/plain" --data "myDemoAttributeValue" http://localhost:3500/v1.0/metadata/myDemoAttribute
```

Get the metadata information to confirm your custom attribute was added:

```json
{
  "id": "myApp",
  "runtimeVersion": "1.12.0",
  "enabledFeatures": [
    "ServiceInvocationStreaming"
  ],
  "actors": [
    {
      "type": "DemoActor"
    }
  ],
  "components": [
    {
      "name": "pubsub",
      "type": "pubsub.redis",
      "version": "v1"
    },
    {
      "name": "statestore",
      "type": "state.redis",
      "version": "v1",
      "capabilities": [
        "ETAG",
        "TRANSACTIONAL",
        "ACTOR"
      ]
    }
  ],
  "httpEndpoints": [
    {
      "name": "my-backend-api"
    }
  ],
  "subscriptions": [
    {
      "pubsubname": "pubsub",
      "topic": "orders",
      "deadLetterTopic": "",
      "metadata": {
        "ttlInSeconds": "30"
      },
      "rules": [
          {
              "match": "%!s(<nil>)",
              "path": "orders"
          }
      ]
    }
  ],
  "extended": {
    "myDemoAttribute": "myDemoAttributeValue",
    "appCommand": "uvicorn --port 3000 demo_actor_service:app",
    "appPID": "98121",
    "cliPID": "98114",
    "daprRuntimeVersion": "1.12.0"
  },
  "appConnectionProperties": {
    "port": 3000,
    "protocol": "http",
    "channelAddress": "127.0.0.1",
    "health": {
      "healthProbeInterval": "5s",
      "healthProbeTimeout": "500ms",
      "healthThreshold": 3
    }
  }
}
```



