---
type: docs
title: "Secrets API reference"
linkTitle: "Secrets API"
description: "Detailed documentation on the secrets API"
weight: 700
---

## Get Secret

This endpoint lets you get the value of a secret for a given secret store.

### HTTP Request

```
GET http://localhost:<daprPort>/v1.0/secrets/<secret-store-name>/<name>
```

#### URL Parameters

Parameter | Description
--------- | -----------
daprPort | the Dapr port
secret-store-name | the name of the secret store to get the secret from
name | the name of the secret to get

> Note, all URL parameters are case-sensitive.

#### Query Parameters

Some secret stores have **optional** metadata properties. metadata is populated using query parameters:

```
GET http://localhost:<daprPort>/v1.0/secrets/<secret-store-name>/<name>?metadata.version_id=15
```

##### GCP Secret Manager
The following optional meta can be provided to the GCP Secret Manager component

Query Parameter | Description
--------- | -----------
metadata.version_id | version for the given secret key

##### AWS Secret Manager
The following optional meta can be provided to the AWS Secret Manager component

Query Parameter | Description
--------- | -----------
metadata.version_id | version for the given secret key
metadata.version_stage | version stage for the given secret key

### HTTP Response

#### Response Body

If a secret store has support for multiple keys in a secret, a JSON payload is returned with the key names as fields and their respective values.

In case of a secret store that only has name/value semantics, a JSON payload is returned with the name of the secret as the field and the value of the secret as the value.

##### Response with multiple keys in a secret (eg. Kubernetes): 

```shell
curl http://localhost:3500/v1.0/secrets/kubernetes/db-secret
```

```json
{
  "key1": "value1",
  "key2": "value2"
}
```

##### Response with no keys in a secret:

```shell
curl http://localhost:3500/v1.0/secrets/vault/db-secret
```

```json
{
  "db-secret": "value1"
}
```

#### Response Codes

Code | Description
---- | -----------
200  | OK
204  | Secret not found
400  | Secret store is missing or misconfigured
500  | Failed to get secret

### Examples

```shell
curl http://localhost:3500/v1.0/secrets/vault/db-secret \
```

```shell
curl http://localhost:3500/v1.0/secrets/vault/db-secret?metadata.version_id=15&metadata.version_stage=AAA \
```
