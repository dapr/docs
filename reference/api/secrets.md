# Secrets

Dapr offers developers a consistent way to extract application secrets, without needing to know the specifics of the secret store being used.
Secret stores are components in Dapr, and allow users to write new secret stores implementations that can be used both to hold secrets for Dapr components as well as serving the application with a dedicated API.

Examples for secret stores include `Kubernetes`, `Hashicorp Vault`, `Azure KeyVault` to name a few.

## Get secret

This endpoint lets you get the key-identified value of secret for a given secret store.

### HTTP Request

```http
GET http://localhost:<daprPort>/v1.0/secrets/<secret-store-name>/<key>
```

#### URL Parameters

Parameter | Description
--------- | -----------
daprPort | the Dapr port
secret-store-name | the name of the secret store to get the secret from
key | the key identifying the name of the secret to get

#### Query Parameters

Some secret stores have **optional** metadata properties. metadata is populated using query parameters:

```http
GET http://localhost:<daprPort>/v1.0/secrets/<secret-store-name>/<key>?metadata.version_id=15
```

##### GCP Secret Manager

Query Parameter | Description
--------- | -----------
metadata.version_id | version for the given secret key

##### AWS Secrets Manager

Query Parameter | Description
--------- | -----------
metadata.version_id | version for the given secret key
metadata.version_stage | version stage for the given secret key

#### Request Body

JSON-encoded value

### HTTP Response

#### Response Codes

Code | Description
---- | -----------
200  | OK
204  | Secret not found
400  | Secret store is missing or misconfigured
500  | Failed to get secret

### Example

```shell
curl http://localhost:3500/v1.0/secrets/vault/db-secret \
  -H "Content-Type: application/json"
```
