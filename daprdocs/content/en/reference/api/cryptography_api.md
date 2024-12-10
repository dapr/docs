---
type: docs
title: "Cryptography API reference"
linkTitle: "Cryptography API"
description: "Detailed documentation on the cryptography API"
weight: 1300
---

Dapr provides cross-platform and cross-language support for encryption and decryption support via the 
cryptography building block. Besides the [language specific SDKs]({{<ref sdks>}}), a developer can invoke these capabilities using
the HTTP API endpoints below.

> The HTTP APIs are intended for development and testing only. For production scenarios, the use of the SDKs is strongly
> recommended as they implement the gRPC APIs providing higher performance and capability than the HTTP APIs.

## Encrypt Payload

This endpoint lets you encrypt a value provided as a byte array using a specified key and crypto component.

### HTTP Request

```
PUT http://localhost:<daprPort>/v1.0-alpha1/crypto/<crypto-store-name>/encrypt
```

#### URL Parameters
 | Parameter         | Description                                                 |
|-------------------|-------------------------------------------------------------|
| daprPort          | The Dapr port                                               |
| crypto-store-name | The name of the crypto store to get the encryption key from |

> Note, all URL parameters are case-sensitive.

#### Headers
Additional encryption parameters are configured by setting headers with the appropriate
values. The following table details the required and optional headers to set with every
encryption request.

| Header Key                    | Description                                                                                                                                                                                         | Allowed Values                                                                    | Required                                                 |
|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|----------------------------------------------------------|
| dapr-key-name                 | The name of the key to use for the encryption operation                                                                                                                                             |                                                                                   | Yes                                                      |
| dapr-key-wrap-algorithm       | The key wrap algorithm to use                                                                                                                                                                       | `A256KW`, `A128CBC`, `A192CBC`, `RSA-OAEP-256`                                    | Yes                                                      |
| dapr-omit-decryption-key-name | If true, omits the decryption key name from header `dapr-decryption-key-name` from the output. If false, includes the specified decryption key name specified in header `dapr-decryption-key-name`. | The following values will be accepted as true: `y`, `yes`, `true`, `t`, `on`, `1` | No                                                       |
| dapr-decryption-key-name      | If `dapr-omit-decryption-key-name` is true, this contains the name of the intended decryption key to include in the output.                                                                         |                                                                                   | Required only if `dapr-omit-decryption-key-name` is true |
| dapr-data-encryption-cipher   | The cipher to use for the encryption operation                                                                                                                                                      | `aes-gcm` or `chacha20-poly1305`                                                  | No                                                       |

### HTTP Response

#### Response Body
The response to an encryption request will have its content type header set to `application/octet-stream` as it
returns an array of bytes with the encrypted payload.

#### Response Codes
| Code | Description                                                             |
|------|-------------------------------------------------------------------------|
| 200  | OK                                                                      |
| 400  | Crypto provider not found                                               |
| 500  | Request formatted correctly, error in dapr code or underlying component |

### Examples
```shell
curl http://localhost:3500/v1.0-alpha1/crypto/myAzureKeyVault/encrypt \
    -X PUT \
    -H "dapr-key-name: myCryptoKey" \
    -H "dapr-key-wrap-algorithm: aes-gcm" \ 
    -H "Content-Type: application/octet-string" \ 
    --data-binary "\x68\x65\x6c\x6c\x6f\x20\x77\x6f\x72\x6c\x64"
```

> The above command sends an array of UTF-8 encoded bytes representing "hello world" and would return
> a stream of 8-bit values in the response similar to the following containing the encrypted payload:

```bash
gAAAAABhZfZ0Ywz4dQX8y9J0Zl5v7w6Z7xq4jV3cW9o2l4pQ0YD1LdR0Zk7zIYi4n2Ll7t6f0Z4X7r8x9o6a8GyL0X1m9Q0Z0A==
```

## Decrypt Payload

This endpoint lets you decrypt a value provided as a byte array using a specified key and crypto component.

#### HTTP Request

```
PUT curl http://localhost:3500/v1.0-alpha1/crypto/<crypto-store-name>/decrypt
```

#### URL Parameters

| Parameter         | Description                                                 |
|-------------------|-------------------------------------------------------------|
| daprPort          | The Dapr port                                               |
| crypto-store-name | The name of the crypto store to get the decryption key from |

> Note all parameters are case-sensitive.

#### Headers
Additional decryption parameters are configured by setting headers with the appropriate values. The following table
details the required and optional headers to set with every decryption request.

| Header Key    | Description                                              | Required |
|---------------|----------------------------------------------------------|----------|
| dapr-key-name | The name of the key to use for the decryption operation. | Yes      |

### HTTP Response

#### Response Body
The response to a decryption request will have its content type header to set `application/octet-stream` as it 
returns an array of bytes representing the decrypted payload.

#### Response Codes
| Code | Description                                                             |
|------|-------------------------------------------------------------------------|
| 200  | OK                                                                      |
| 400  | Crypto provider not found                                               |
| 500  | Request formatted correctly, error in dapr code or underlying component |

### Examples
```bash
curl http://localhost:3500/v1.0-alpha1/crypto/myAzureKeyVault/decrypt \
    -X PUT
    -H "dapr-key-name: myCryptoKey"\
    -H "Content-Type: application/octet-stream" \
    --data-binary "gAAAAABhZfZ0Ywz4dQX8y9J0Zl5v7w6Z7xq4jV3cW9o2l4pQ0YD1LdR0Zk7zIYi4n2Ll7t6f0Z4X7r8x9o6a8GyL0X1m9Q0Z0A=="
```

> The above command sends a base-64 encoded string of the encrypted message payload and would return a response with
> the content type header set to `application/octet-stream` returning the response body `hello world`.

```bash
hello world
```