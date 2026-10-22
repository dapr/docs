---
type: docs
title: "How to: Encrypt and decrypt data with the Dapr JavaScript SDK"
linkTitle: "How to: Encrypt and decrypt data"
weight: 54050
description: Configure a cryptography component and encrypt and decrypt messages and files using the Dapr JavaScript SDK
---

Use `DaprClient.crypto` to encrypt and decrypt data without passing cryptographic keys to your application. This guide uses a local key for development, then shows how to work with buffers and files.

## Prerequisites

- [Dapr CLI]({{% ref install-dapr-cli.md %}})
- An initialized [Dapr environment]({{% ref install-dapr-selfhost.md %}}) with a runtime that supports the alpha Cryptography API
- [Node.js](https://nodejs.org/) 18 or later; a supported LTS release is recommended
- The [`@dapr/dapr`](https://www.npmjs.com/package/@dapr/dapr) package, **version 3.19.0 or later**
- A configured [cryptography component]({{% ref supported-cryptography %}}) and a key compatible with the selected key-wrapping algorithm

In your application directory, initialize an npm project if you do not already have one, then install the SDK:

```sh
npm init -y
npm install @dapr/dapr@3.19.0
```

The examples use JavaScript ES modules and run as `.mjs` files without a TypeScript compiler. The same APIs are available in TypeScript.

## Configure a local cryptography component

Create a `keys` directory and generate a random 256-bit symmetric key:

```sh
node -e "const fs = require('node:fs'); fs.mkdirSync('keys', { recursive: true }); fs.writeFileSync(require('node:path').join('keys', 'symmetric256'), require('node:crypto').randomBytes(32));"
```

Run this command only for initial setup. Rerunning it replaces the key, preventing you from decrypting data encrypted with the previous key unless you retained a copy.

Create a separate `components` directory and save the following as `components\crypto.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: crypto-local
spec:
  type: crypto.dapr.localstorage
  version: v1
  metadata:
    - name: path
      value: '.\keys'
```

The path is resolved from the sidecar's working directory. Run the commands below from your application directory; for other deployments, set the path to a directory accessible to the sidecar.

The component name, `crypto-local`, is the `componentName` used by the client. The key name, `symmetric256`, is the file name in the key directory. This example pairs a 256-bit symmetric key with `A256KW` key wrapping.

{{% alert title="Local development only" color="warning" %}}
The local storage component gives the sidecar access to raw key material. Restrict access to the key directory and never commit keys to source control. For production, consider a supported key vault component and provision keys using that provider's tools. See the [local storage component reference]({{% ref "reference/components-reference/supported-cryptography/local-storage.md" %}}) for supported key formats.
{{% /alert %}}

## Encrypt and decrypt a message

Save the following as `app.mjs`:

```javascript
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

const client = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: "3500",
  communicationProtocol: CommunicationProtocolEnum.HTTP,
});

try {
  const plaintext = Buffer.from("A message to encrypt", "utf8");
  const ciphertext = await client.crypto.encrypt(plaintext, {
    componentName: "crypto-local",
    keyName: "symmetric256",
    keyWrapAlgorithm: "A256KW",
  });

  const decrypted = await client.crypto.decrypt(ciphertext, {
    componentName: "crypto-local",
  });

  if (!decrypted.equals(plaintext)) {
    throw new Error("Decrypted bytes do not match the original message");
  }
  console.log("Message round-trip succeeded");
} finally {
  await client.stop();
}
```

Start the application with a sidecar that loads the component:

```sh
dapr run --app-id crypto-example --dapr-http-port 3500 --dapr-grpc-port 50001 --resources-path .\components -- node app.mjs
```

Passing data and options returns a `Promise<Buffer>` for both encryption and decryption. Encryption also accepts a string, encoded as UTF-8. Decryption uses the key reference embedded in the encrypted document by default, so this example does not need to supply `keyName` again.

To run the same example over gRPC, change `communicationProtocol` to `CommunicationProtocolEnum.GRPC` and `daprPort` to `"50001"`.

## Encrypt and decrypt files with streams

For files, pass only the options object to obtain a Node.js `Duplex`. Write plaintext into an encryption stream and read ciphertext from it; a decryption stream accepts ciphertext and emits plaintext.

Create a nonempty `plaintext.txt` in your application directory and save this example as `files.mjs`. It uses gRPC, the recommended protocol for large payloads and production streaming:

```javascript
import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

const client = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: "50001",
  communicationProtocol: CommunicationProtocolEnum.GRPC,
});

try {
  await pipeline(
    createReadStream("plaintext.txt"),
    await client.crypto.encrypt({
      componentName: "crypto-local",
      keyName: "symmetric256",
      keyWrapAlgorithm: "A256KW",
    }),
    createWriteStream("ciphertext.out"),
  );

  await pipeline(
    createReadStream("ciphertext.out"),
    await client.crypto.decrypt({ componentName: "crypto-local" }),
    createWriteStream("plaintext.out"),
  );

  console.log("Encrypted ciphertext.out and decrypted plaintext.out");
} finally {
  await client.stop();
}
```

Run it with the same component and ports:

```sh
dapr run --app-id crypto-files-example --dapr-http-port 3500 --dapr-grpc-port 50001 --resources-path .\components -- node files.mjs
```

Await each pipeline so failures propagate and encryption finishes before decryption starts. Use new streams for each operation. Do not combine encryption and decryption in one pipeline on runtimes affected by the [concurrent cryptography limitation]({{% ref js-cryptography-client-usage.md %}}#concurrent-operations).

The stream overloads also work over HTTP, but the runtime buffers HTTP output until the entire input has arrived. A stream-shaped API does not remove that runtime memory cost.

## Next steps

Read the [client usage guidance]({{% ref js-cryptography-client-usage.md %}}) for choosing ciphers, controlling embedded key references, preserving binary ciphertext, and handling errors. See the [cryptography quickstart]({{% ref cryptography-quickstart %}}) for additional examples.
