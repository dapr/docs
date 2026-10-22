---
type: docs
title: "How to: Retrieve secrets with the Dapr JavaScript SDK"
linkTitle: "How to: Retrieve secrets"
weight: 52050
description: Configure a secret store and retrieve individual and bulk secrets with the Dapr JavaScript SDK
---

This guide uses `DaprClient.secret` to retrieve a single secret and all accessible secrets from a local secret store. The examples use JavaScript ES modules; the same methods are available in TypeScript.

## Prerequisites

- [Dapr CLI]({{% ref install-dapr-cli.md %}})
- An initialized [Dapr environment]({{% ref install-dapr-selfhost.md %}})
- [Node.js](https://nodejs.org/) 18 or later
- The [`@dapr/dapr`](https://www.npmjs.com/package/@dapr/dapr) package, version 3.19.0 or later

In your application directory, initialize an npm project if needed and install the SDK:

```sh
npm init -y
npm install @dapr/dapr@3.19.0
```

The explicit version ensures that npm installs the 3.19.0 release used in this guide. You can substitute a later version.

## Configure a local secret store

Create a file named `secrets.json` in your application's working directory:

```json
{
  "api-key": "development-api-key",
  "database": {
    "username": "development-user",
    "password": "development-password"
  }
}
```

Create a `components` directory and save the following as `components\local-secret-store.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: local-secret-store
spec:
  type: secretstores.local.file
  version: v1
  metadata:
    - name: secretsFile
      value: secrets.json
    - name: multiValued
      value: "true"
```

The component's `metadata.name`, `local-secret-store`, is the store name passed to the SDK. The `secretsFile` path is relative to the directory where you run `dapr run`, not the component file. Setting `multiValued` to `"true"` lets the `database` secret contain both `username` and `password`.

{{% alert title="Development only" color="warning" %}}
The local file component reads plaintext secrets without authentication. Use only dummy values for this example, do not commit real secrets, and configure a production [secret store]({{% ref supported-secret-stores %}}) for deployed applications.
{{% /alert %}}

See the [local file secret store reference]({{% ref file-secret-store.md %}}) for flattening and multi-valued secret behavior.

## Retrieve individual and bulk secrets

Save the following as `app.mjs`. Using `.mjs` lets Node.js run the ES module without changing your project's package configuration.

```javascript
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

const client = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: "3500",
  communicationProtocol: CommunicationProtocolEnum.HTTP,
});

const storeName = "local-secret-store";

try {
  const apiKey = await client.secret.get(storeName, "api-key");
  if (typeof apiKey["api-key"] !== "string") {
    throw new Error("The required api-key secret was not returned");
  }

  const database = await client.secret.get(storeName, "database");
  if (
    typeof database.username !== "string" ||
    typeof database.password !== "string"
  ) {
    throw new Error("The required database credentials were not returned");
  }

  const secrets = await client.secret.getBulk(storeName);
  if (
    typeof secrets.database?.username !== "string" ||
    typeof secrets.database?.password !== "string"
  ) {
    throw new Error("Bulk retrieval did not return the database credentials");
  }

  console.log("Retrieved the required secrets without logging their values");
} finally {
  await client.stop();
}
```

Start the application and its sidecar from the directory containing `secrets.json`:

```sh
dapr run --app-id secrets-example --dapr-http-port 3500 --dapr-grpc-port 50001 --resources-path .\components -- node app.mjs
```

This is a client-only application; it does not need a `DaprServer`, an application port, or an inbound secrets handler.

### Single-secret responses

`get(storeName, key)` returns the secret's key-value data directly. For a name/value secret, the only key is the secret name itself; for a multi-valued secret, the keys are its fields and the secret name is not included. With the sample data, `get(storeName, "api-key")` returns:

```json
{
  "api-key": "development-api-key"
}
```

Over HTTP, `get(storeName, "database")` returns both values:

```json
{
  "username": "development-user",
  "password": "development-password"
}
```

### Bulk responses

`getBulk(storeName)` returns an object keyed by secret name, with a nested object containing each secret's data:

```json
{
  "api-key": {
    "api-key": "development-api-key"
  },
  "database": {
    "username": "development-user",
    "password": "development-password"
  }
}
```

Bulk retrieval is not an array or a paginated iterator. It loads the full response into memory. Use it only when the application needs all accessible secrets and the component supports bulk retrieval.

## Use gRPC

Configure `CommunicationProtocolEnum.GRPC` and the sidecar's gRPC port, `"50001"`, instead of HTTP and `"3500"`. The same `get` and `getBulk` methods are available.

{{% alert title="Multi-valued single-secret limitation" color="warning" %}}
In SDK 3.19.0, gRPC `get` returns only the first entry from the runtime's secret data map. It never returns both database fields in this example, so changing only the protocol causes the database validation to fail. Keep HTTP for individual multi-valued secrets. gRPC `getBulk` preserves all nested values, but retrieves all accessible secrets rather than just one.
{{% /alert %}}

## Pass store-specific metadata over HTTP

The third argument to `get` is a query-string **string**, not a metadata object. Include the `metadata.` prefix on each parameter and omit the leading `?`. Use `URLSearchParams` to encode values.

For example, with an AWS Secrets Manager component named `aws-secrets`, retrieve a particular version:

```javascript
const metadata = new URLSearchParams({
  "metadata.version_id": "your-version-id",
}).toString();

const secret = await client.secret.get(
  "aws-secrets",
  "database-password",
  metadata,
);
```

This snippet assumes an existing HTTP `client` and a separately configured AWS component; it is not needed for the local file example. Supported metadata depends on the [secret store component]({{% ref supported-secret-stores %}}). For example, Kubernetes supports `metadata.namespace`, while some cloud stores support version selection.

The gRPC implementation ignores this argument in SDK 3.19.0. `getBulk` has no metadata argument with either protocol. See the [client usage guidance]({{% ref js-secrets-client-usage.md %}}) for the complete API surface and error behavior.
