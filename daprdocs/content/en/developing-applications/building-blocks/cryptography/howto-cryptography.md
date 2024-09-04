---
type: docs
title: "How to: Use the cryptography APIs"
linkTitle: "How to: Use cryptography"
weight: 2000
description: "Learn how to encrypt and decrypt files"
---

Now that you've read about [Cryptography as a Dapr building block]({{< ref cryptography-overview.md >}}), let's walk through using the cryptography APIs with the SDKs.

{{% alert title="Note" color="primary" %}}
Dapr cryptography is currently in alpha.

{{% /alert %}}

## Encrypt

{{< tabs "Python" "JavaScript" ".NET" "Go" >}}

{{% codetab %}}

<!--Python-->

Using the Dapr SDK in your project, with the gRPC APIs, you can encrypt a stream of data, such as a file or a string:

```python
# When passing data (a buffer or string), `encrypt` returns a Buffer with the encrypted message
def encrypt_decrypt_string(dapr: DaprClient):
    message = 'The secret is "passw0rd"'

    # Encrypt the message
    resp = dapr.encrypt(
        data=message.encode(),
        options=EncryptOptions(
            # Name of the cryptography component (required)
            component_name=CRYPTO_COMPONENT_NAME,
            # Key stored in the cryptography component (required)
            key_name=RSA_KEY_NAME,
            # Algorithm used for wrapping the key, which must be supported by the key named above.
            # Options include: "RSA", "AES"
            key_wrap_algorithm='RSA',
        ),
    )

    # The method returns a readable stream, which we read in full in memory
    encrypt_bytes = resp.read()
    print(f'Encrypted the message, got {len(encrypt_bytes)} bytes')
```

{{% /codetab %}}

{{% codetab %}}

<!--JavaScript-->

Using the Dapr SDK in your project, with the gRPC APIs, you can encrypt data in a buffer or a string:

```js
// When passing data (a buffer or string), `encrypt` returns a Buffer with the encrypted message
const ciphertext = await client.crypto.encrypt(plaintext, {
    // Name of the Dapr component (required)
    componentName: "mycryptocomponent",
    // Name of the key stored in the component (required)
    keyName: "mykey",
    // Algorithm used for wrapping the key, which must be supported by the key named above.
    // Options include: "RSA", "AES"
    keyWrapAlgorithm: "RSA",
});
```

The APIs can also be used with streams, to encrypt data more efficiently when it comes from a stream. The example below encrypts a file, writing to another file, using streams:

```js
// `encrypt` can be used as a Duplex stream
await pipeline(
    fs.createReadStream("plaintext.txt"),
    await client.crypto.encrypt({
        // Name of the Dapr component (required)
        componentName: "mycryptocomponent",
        // Name of the key stored in the component (required)
        keyName: "mykey",
        // Algorithm used for wrapping the key, which must be supported by the key named above.
        // Options include: "RSA", "AES"
        keyWrapAlgorithm: "RSA",
    }),
    fs.createWriteStream("ciphertext.out"),
);
```

{{% /codetab %}}

{{% codetab %}}

<!-- .NET -->
Using the Dapr SDK in your project, with the gRPC APIs, you can encrypt data in a string or a byte array:

```csharp
using var client = new DaprClientBuilder().Build();

const string componentName = "azurekeyvault"; //Change this to match your cryptography component
const string keyName = "myKey"; //Change this to match the name of the key in your cryptographic store

const string plainText = "This is the value we're going to encrypt today";

//Encode the string to a UTF-8 byte array and encrypt it
var plainTextBytes = Encoding.UTF8.GetBytes(plainText);
var encryptedBytesResult = await client.EncryptAsync(componentName, plaintextBytes, keyName, new EncryptionOptions(KeyWrapAlgorithm.Rsa));
```

{{% /codetab %}}

{{% codetab %}}

<!--go-->

Using the Dapr SDK in your project, you can encrypt a stream of data, such as a file.

```go
out, err := sdkClient.Encrypt(context.Background(), rf, dapr.EncryptOptions{
	// Name of the Dapr component (required)
	ComponentName: "mycryptocomponent",
	// Name of the key stored in the component (required)
	KeyName:       "mykey",
	// Algorithm used for wrapping the key, which must be supported by the key named above.
	// Options include: "RSA", "AES"
	Algorithm:     "RSA",
})
```

The following example puts the `Encrypt` API in context, with code that reads the file, encrypts it, then stores the result in another file.

```go
// Input file, clear-text
rf, err := os.Open("input")
if err != nil {
	panic(err)
}
defer rf.Close()

// Output file, encrypted
wf, err := os.Create("output.enc")
if err != nil {
	panic(err)
}
defer wf.Close()

// Encrypt the data using Dapr
out, err := sdkClient.Encrypt(context.Background(), rf, dapr.EncryptOptions{
	// These are the 3 required parameters
	ComponentName: "mycryptocomponent",
	KeyName:       "mykey",
	Algorithm:     "RSA",
})
if err != nil {
	panic(err)
}

// Read the stream and copy it to the out file
n, err := io.Copy(wf, out)
if err != nil {
	panic(err)
}
fmt.Println("Written", n, "bytes")
```

The following example uses the `Encrypt` API to encrypt a string.

```go
// Input string
rf := strings.NewReader("Amor, ch’a nullo amato amar perdona, mi prese del costui piacer sì forte, che, come vedi, ancor non m’abbandona")

// Encrypt the data using Dapr
enc, err := sdkClient.Encrypt(context.Background(), rf, dapr.EncryptOptions{
	ComponentName: "mycryptocomponent",
	KeyName:       "mykey",
	Algorithm:     "RSA",
})
if err != nil {
	panic(err)
}

// Read the encrypted data into a byte slice
enc, err := io.ReadAll(enc)
if err != nil {
	panic(err)
}
```

{{% /codetab %}}

{{< /tabs >}}


## Decrypt

{{< tabs "Python" "JavaScript" ".NET" "Go" >}}

{{% codetab %}}

<!--python-->

To decrypt a stream of data, use `decrypt`.

```python
def encrypt_decrypt_string(dapr: DaprClient):
    message = 'The secret is "passw0rd"'

    # ...

    # Decrypt the encrypted data
    resp = dapr.decrypt(
        data=encrypt_bytes,
        options=DecryptOptions(
            # Name of the cryptography component (required)
            component_name=CRYPTO_COMPONENT_NAME,
            # Key stored in the cryptography component (required)
            key_name=RSA_KEY_NAME,
        ),
    )

    # The method returns a readable stream, which we read in full in memory
    decrypt_bytes = resp.read()
    print(f'Decrypted the message, got {len(decrypt_bytes)} bytes')

    print(decrypt_bytes.decode())
    assert message == decrypt_bytes.decode()
```

{{% /codetab %}}

{{% codetab %}}

<!--JavaScript-->

Using the Dapr SDK, you can decrypt data in a buffer or using streams.

```js
// When passing data as a buffer, `decrypt` returns a Buffer with the decrypted message
const plaintext = await client.crypto.decrypt(ciphertext, {
    // Only required option is the component name
    componentName: "mycryptocomponent",
});

// `decrypt` can also be used as a Duplex stream
await pipeline(
    fs.createReadStream("ciphertext.out"),
    await client.crypto.decrypt({
        // Only required option is the component name
        componentName: "mycryptocomponent",
    }),
    fs.createWriteStream("plaintext.out"),
);
```

{{% /codetab %}}

{{% codetab %}}

<!-- .NET -->
To decrypt a string, use the 'DecryptAsync' gRPC API in your project.

In the following example, we'll take a byte array (such as from the example above) and decrypt it to a UTF-8 encoded string.

```csharp
public async Task<string> DecryptBytesAsync(byte[] encryptedBytes)
{
  using var client = new DaprClientBuilder().Build();

  const string componentName = "azurekeyvault"; //Change this to match your cryptography component
  const string keyName = "myKey"; //Change this to match the name of the key in your cryptographic store

  var decryptedBytes = await client.DecryptAsync(componentName, encryptedBytes, keyName);
  var decryptedString = Encoding.UTF8.GetString(decryptedBytes.ToArray());
  return decryptedString;
}
```

{{% /codetab %}}

{{% codetab %}}

<!--go-->

To decrypt a file, use the `Decrypt` gRPC API to your project.

In the following example, `out` is a stream that can be written to file or read in memory, as in the examples above.

```go
out, err := sdkClient.Decrypt(context.Background(), rf, dapr.EncryptOptions{
	// Only required option is the component name
	ComponentName: "mycryptocomponent",
})
```

{{% /codetab %}}

{{< /tabs >}}

## Next steps
[Cryptography component specs]({{< ref supported-cryptography >}})