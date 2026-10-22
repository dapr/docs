---
type: docs
title: "Cryptography client usage"
linkTitle: "Client usage"
weight: 54100
description: Configure and use JavaScript cryptography operations, encryption options, and streams
---

Cryptography is available through `DaprClient.crypto`. This page describes **`@dapr/dapr` version 3.19.0 or later**, which supports both HTTP and gRPC. Both transports use the alpha Cryptography API.

## Client lifetime and configuration

Reuse a long-lived `DaprClient` rather than creating one for each operation. Await outstanding operations and stream pipelines before calling `await client.stop()` during application shutdown.

HTTP is the default protocol and uses sidecar port `"3500"` by default. For gRPC, configure the protocol and its port explicitly:

```javascript
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

const client = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: "50001",
  communicationProtocol: CommunicationProtocolEnum.GRPC,
  daprApiToken: process.env.DAPR_API_TOKEN,
});
```

Use `CommunicationProtocolEnum.HTTP` and the sidecar's HTTP port for HTTP. Port options are strings. If you omit explicit host and port options, the SDK can resolve the selected protocol's endpoint from `DAPR_HTTP_ENDPOINT` or `DAPR_GRPC_ENDPOINT`. The API token defaults to `DAPR_API_TOKEN` when it is not supplied explicitly. See the [JavaScript client configuration]({{% ref js-client %}}#environment-variables) for more information.

## Choose an overload

The argument count selects whether an operation returns a stream or buffers its output:

| Method | Input | Result |
|--------|-------|--------|
| `encrypt(data, options)` | `Buffer`, `ArrayBuffer`, `ArrayBufferView`, or string | `Promise<Buffer>` containing ciphertext |
| `decrypt(data, options)` | `Buffer`, `ArrayBuffer`, or `ArrayBufferView` | `Promise<Buffer>` containing plaintext |
| `encrypt(options)` | Write plaintext to the returned stream | `Promise<Duplex>` emitting ciphertext |
| `decrypt(options)` | Write ciphertext to the returned stream | `Promise<Duplex>` emitting plaintext |

An `ArrayBufferView` includes typed arrays such as `Uint8Array` and `DataView`. The SDK uses the view's byte offset and byte length, not the entire backing buffer.

Encryption converts strings to UTF-8. Decryption expects binary input, not a string. To decrypt ciphertext stored as base64, decode it first:

```javascript
const decrypted = await client.crypto.decrypt(Buffer.from(savedBase64, "base64"), {
  componentName: "crypto-local",
});
```

This snippet assumes an existing `client` and a `savedBase64` string previously produced with `ciphertext.toString("base64")`. Keep ciphertext as bytes unless you deliberately encode it; converting arbitrary ciphertext with `.toString("utf8")` corrupts it. Convert decrypted bytes to UTF-8 only if the original plaintext was UTF-8 text.

## Encryption options

Pass the same encryption options with either overload:

| Option | Required | Behavior |
|--------|----------|----------|
| `componentName` | Yes | Name of the configured Dapr cryptography component, not its component type. |
| `keyName` | Yes | Key reference in the component's backing store, optionally including a version where the provider supports it. |
| `keyWrapAlgorithm` | Yes | Algorithm used to wrap the data-encryption key. Must be compatible with the referenced key and component. |
| `dataEncryptionCipher` | No | `"aes-gcm"` (default) or `"chacha20-poly1305"` for encrypting the payload. |
| `omitDecryptionKeyName` | No | Defaults to `false`. Set to `true` to omit the key reference from the encrypted document; decryption must then supply `keyName`. |
| `decryptionKeyName` | No | Alternate key reference to embed in the document. Defaults to the encryption key reference and is ignored when `omitDecryptionKeyName` is `true`. |

The SDK's `keyWrapAlgorithm` type accepts `"A256KW"`, `"A128CBC"`, `"A192CBC"`, `"A256CBC"`, `"RSA-OAEP-256"`, `"AES"`, and `"RSA"`. This list describes the SDK type, not a guarantee that every component, key, or runtime accepts every value. Choose a value supported by your provider; for example, the [setup guide]({{% ref js-cryptography-howto.md %}}) uses `A256KW` with a 256-bit symmetric key. The wrapping algorithm and payload cipher are separate settings.

TypeScript applications can import the request types from the package's type module:

```typescript
import type { DecryptRequest, EncryptRequest } from "@dapr/dapr/types/crypto/Requests";

const encryptOptions: EncryptRequest = {
  componentName: "crypto-local",
  keyName: "symmetric256",
  keyWrapAlgorithm: "A256KW",
  dataEncryptionCipher: "chacha20-poly1305",
};

const decryptOptions: DecryptRequest = {
  componentName: "crypto-local",
};
```

These request types are not exported from the package root in `3.19.0`.

## Decryption and key references

Decryption takes a required `componentName` and an optional `keyName`. The runtime reads the cipher and wrapped key information from the encrypted document; do not pass encryption options such as `keyWrapAlgorithm` to `decrypt`.

By default, the document contains the encryption key reference. An explicit decryption `keyName` overrides that embedded reference. The component must have access to the corresponding decryption key; overriding the name does not make an unrelated key valid.

To keep the key reference out of the document:

```javascript
const ciphertext = await client.crypto.encrypt("A message to encrypt", {
  componentName: "crypto-local",
  keyName: "symmetric256",
  keyWrapAlgorithm: "A256KW",
  omitDecryptionKeyName: true,
});

const plaintext = await client.crypto.decrypt(ciphertext, {
  componentName: "crypto-local",
  keyName: "symmetric256",
});
```

Run this snippet with an existing `client` inside an async function or an ES module. Without an explicit decryption `keyName`, this document cannot be decrypted.

Use `decryptionKeyName` instead when the recipient knows the same key under a different reference, such as an alias or a key in another configured component:

```javascript
const ciphertext = await client.crypto.encrypt("A message for a recipient", {
  componentName: "sender-crypto",
  keyName: "sender-key",
  keyWrapAlgorithm: "RSA",
  decryptionKeyName: "recipient-key",
});

const plaintext = await client.crypto.decrypt(ciphertext, {
  componentName: "recipient-crypto",
});
```

This example requires separately configured components and a matching RSA key pair: the sender must be able to wrap with the public key, and the recipient must be able to unwrap with the corresponding private key. `decryptionKeyName` only changes the embedded reference; it does not create, copy, or rotate keys.

## Streams and memory use

Calling `encrypt(options)` or `decrypt(options)` resolves to a `Duplex`, not the completed operation. Its writable side receives input; its readable side emits output. Consume the output while supplying input and end the writable side when input is complete. Prefer `await pipeline(source, cryptoStream, destination)` from `node:stream/promises` to propagate errors and close participating streams.

The [file example]({{% ref js-cryptography-howto.md %}}#encrypt-and-decrypt-files-with-streams) demonstrates this pattern. Stream in binary mode when handling ciphertext. Do not set a text encoding on a ciphertext source or treat encrypted output as text.

The data overloads accumulate the complete result in memory, even when gRPC streams internally. Use them only when input and output fit comfortably in memory.

- **HTTP:** The SDK supports both overloads and sends raw bytes, but Dapr buffers cryptography output until it has consumed the request. Do not wait for output before finishing input. Prefer gRPC for large payloads and production streaming.
- **gRPC:** Uses bidirectional streaming and splits writes into 2 KiB request chunks. The crypto API has no configurable `chunkSize`. The current stream implementation can queue input and output internally; do not assume that using streams guarantees bounded memory at arbitrary producer or consumer speeds.
- **Empty input:** HTTP supports empty plaintext with either overload. In the `3.19.0` gRPC implementation, options are sent with the first nonempty input chunk, so an empty input does not send an initial options frame. Use HTTP for empty plaintext rather than relying on gRPC empty-input behavior.

Ciphertext produced over HTTP can be decrypted over gRPC and vice versa, provided the component can access the correct key. The document uses Dapr's encryption format, not a bare AES or RSA ciphertext.

## Cancellation and errors

`EncryptRequest` and `DecryptRequest` have no `AbortSignal`, timeout, or cancellation-token option. Do not assume cancellation support from other building blocks applies to cryptography. Destroying an HTTP crypto `Duplex` aborts its underlying request; the gRPC crypto overloads do not expose an equivalent request-cancellation option. A timeout implemented by racing promises alone does not cancel the operation.

Await buffer operations and handle their rejected promises. For streams, errors can occur after the promise has returned the `Duplex`, so awaiting `client.crypto.encrypt(options)` alone is not sufficient. Await the pipeline and handle its rejection.

Missing components, missing or incompatible keys, unsupported algorithms, malformed ciphertext, and authentication failures during decryption cause operations to fail rather than returning an empty successful result. HTTP runtime errors are `Error` instances whose message contains JSON with `status`, `error`, and `error_msg`; network and stream errors can have different shapes. gRPC errors come from the Connect transport and should not be interpreted as HTTP status codes.

A failed or cancelled file pipeline may leave a partial output file. Remove or otherwise handle that file, and do not treat decrypted output as complete until the whole operation succeeds.

## Concurrent operations

Runtimes affected by [dapr/kit#170](https://github.com/dapr/kit/issues/170) can fail when decryption overlaps other cryptography operations. On affected sidecars, serialize decryption with all other cryptography work, including encryption, across callers sharing that sidecar. Serializing only within one function or one client does not protect against other callers.

In particular, finish encryption before starting decryption rather than chaining them in one pipeline or using `Promise.all` for round-trips. Check the issue and your runtime version before enabling overlapping operations.

## Related links

- [Cryptography how-to guide]({{% ref js-cryptography-howto.md %}})
- [Cryptography building block]({{% ref cryptography-overview %}})
- [Cryptography components]({{% ref supported-cryptography %}})
- [Cryptography API reference]({{% ref cryptography_api.md %}})
