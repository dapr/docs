---
type: docs
title: "Quickstart: Cryptography"
linkTitle: Cryptography
weight: 79
description: Get started with the Dapr Cryptography building block
---

{{% alert title="Alpha" color="warning" %}}
The cryptography building block is currently in **alpha**. 
{{% /alert %}}

Let's take a look at the Dapr [cryptography building block]({{< ref cryptography >}}). In this Quickstart, you'll create an application that encrypts and decrypts data using the Dapr cryptography APIs. You'll:

- Encrypt and then decrypt a short string (using an RSA key), reading the result in-memory, in a Go byte slice.
- Encrypt and then decrypt a large file (using an AES key), storing the encrypted and decrypted data to files using streams.

<img src="/images/crypto-quickstart.png" width=800 style="padding-bottom:15px;">

{{% alert title="Note" color="primary" %}}
This example uses the Dapr SDK, which leverages gRPC and is **strongly** recommended when using cryptographic APIs to encrypt and decrypt messages.
{{% /alert %}}

Currently, you can experience the cryptography API using the Go SDK.

{{< tabs "JavaScript" "Go" >}}

 <!-- JavaScript -->
{{% codetab %}}

> This quickstart includes a JavaScript application called `crypto-quickstart`.

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Latest Node.js installed](https://nodejs.org/download/).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->
- [OpenSSL](https://www.openssl.org/source/) available on your system

### Step 1: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/cryptography)

```bash
git clone https://github.com/dapr/quickstarts.git
```

In the terminal, from the root directory, navigate to the cryptography sample.

```bash
cd cryptography/javascript/sdk
```

Navigate into the folder with the source code:

```bash
cd ./crypto-quickstart
```

Install the dependencies:

```bash
npm install
```

### Step 2: Run the application with Dapr

The application code defines two required keys:

- Private RSA key 
- A 256-bit symmetric (AES) key

Generate two keys, an RSA key and and AES key using OpenSSL and write these to two files:

```bash
mkdir -p keys
# Generate a private RSA key, 4096-bit keys
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -out keys/rsa-private-key.pem
# Generate a 256-bit key for AES
openssl rand -out keys/symmetric-key-256 32
```

Run the Go service app with Dapr:

```bash
dapr run --app-id crypto-quickstart --resources-path ../../../components/ -- npm start
```

**Expected output**

```
== APP == 2023-10-25T14:30:50.435Z INFO [GRPCClient, GRPCClient] Opening connection to 127.0.0.1:58173
== APP == == Encrypting message using buffers
== APP == Encrypted the message, got 856 bytes
== APP == == Decrypting message using buffers
== APP == Decrypted the message, got 24 bytes
== APP == The secret is "passw0rd"
== APP == == Encrypting message using streams
== APP == Encrypting federico-di-dio-photography-Q4g0Q-eVVEg-unsplash.jpg to encrypted.out
== APP == Encrypted the message to encrypted.out
== APP == == Decrypting message using streams
== APP == Decrypting encrypted.out to decrypted.out.jpg
== APP == Decrypted the message to decrypted.out.jpg
```

### What happened?

#### `local-storage.yaml`

Earlier, you created a directory inside `crypto-quickstarts` called `keys`. In [the `local-storage` component YAML](https://github.com/dapr/quickstarts/tree/master/cryptography/components/local-storage.yaml), the `path` metadata maps to the newly created `keys` directory.

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: localstorage
spec:
  type: crypto.dapr.localstorage
  version: v1
  metadata:
    - name: path
      # Path is relative to the folder where the example is located
      value: ./keys
```

#### `index.mjs`

[The application file](https://github.com/dapr/quickstarts/blob/master/cryptography/javascript/sdk/crypto-quickstart/index.mjs) encrypts and decrypts messages and files using the RSA and AES keys that you generated. The application creates a new Dapr SDK client:

```javascript
async function start() {
  const client = new DaprClient({
    daprHost,
    daprPort,
    communicationProtocol: CommunicationProtocolEnum.GRPC,
  });

  // Encrypt and decrypt a message from a buffer
  await encryptDecryptBuffer(client);

  // Encrypt and decrypt a message using streams
  await encryptDecryptStream(client);
}
```

##### Encrypting and decrypting a string using the RSA key

Once the client is created, the application encrypts a message:

```javascript
async function encryptDecryptBuffer(client) {
  // Message to encrypt
  const plaintext = `The secret is "passw0rd"`

  // First, encrypt the message
  console.log("== Encrypting message using buffers");

  const encrypted = await client.crypto.encrypt(plaintext, {
    componentName: "localstorage",
    keyName: "rsa-private-key.pem",
    keyWrapAlgorithm: "RSA",
  });

  console.log("Encrypted the message, got", encrypted.length, "bytes");
```

The application then decrypts the message:

```javascript
  // Decrypt the message
  console.log("== Decrypting message using buffers");
  const decrypted = await client.crypto.decrypt(encrypted, {
    componentName: "localstorage",
  });

  console.log("Decrypted the message, got", decrypted.length, "bytes");
  console.log(decrypted.toString("utf8"));

  // ...
}
``` 

##### Encrypt and decrpyt a large file using the AES key

Next, the application encrypts a large image file:

```javascript
async function encryptDecryptStream(client) {
  // First, encrypt the message
  console.log("== Encrypting message using streams");
  console.log("Encrypting", testFileName, "to encrypted.out");

  await pipeline(
    createReadStream(testFileName),
    await client.crypto.encrypt({
      componentName: "localstorage",
      keyName: "symmetric-key-256",
      keyWrapAlgorithm: "A256KW",
    }),
    createWriteStream("encrypted.out"),
  );

  console.log("Encrypted the message to encrypted.out");
```

The application then decrypts the large image file:

```javascript
  // Decrypt the message
  console.log("== Decrypting message using streams");
  console.log("Decrypting encrypted.out to decrypted.out.jpg");
  await pipeline(
    createReadStream("encrypted.out"),
    await client.crypto.decrypt({
      componentName: "localstorage",
    }),
    createWriteStream("decrypted.out.jpg"),
  );

  console.log("Decrypted the message to decrypted.out.jpg");
}
```

{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}

> This quickstart includes a Go application called `crypto-quickstart`.

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Latest version of Go](https://go.dev/dl/).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->
- [OpenSSL](https://www.openssl.org/source/) available on your system

### Step 1: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/cryptography)

```bash
git clone https://github.com/dapr/quickstarts.git
```

In the terminal, from the root directory, navigate to the cryptography sample.

```bash
cd cryptography/go/sdk
```

### Step 2: Run the application with Dapr

Navigate into the folder with the source code:

```bash
cd ./crypto-quickstart
```

The application code defines two required keys:

- Private RSA key 
- A 256-bit symmetric (AES) key

Generate two keys, an RSA key and and AES key using OpenSSL and write these to two files:

```bash
mkdir -p keys
# Generate a private RSA key, 4096-bit keys
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -out keys/rsa-private-key.pem
# Generate a 256-bit key for AES
openssl rand -out keys/symmetric-key-256 32
```

Run the Go service app with Dapr:

```bash
dapr run --app-id crypto-quickstart --resources-path ../../../components/ -- go run .
```

**Expected output**

```
== APP == dapr client initializing for: 127.0.0.1:52407
== APP == Encrypted the message, got 856 bytes
== APP == Decrypted the message, got 24 bytes
== APP == The secret is "passw0rd"
== APP == Wrote decrypted data to encrypted.out
== APP == Wrote decrypted data to decrypted.out.jpg
```

### What happened?

#### `local-storage.yaml`

Earlier, you created a directory inside `crypto-quickstarts` called `keys`. In [the `local-storage` component YAML](https://github.com/dapr/quickstarts/tree/master/cryptography/components/local-storage.yaml), the `path` metadata maps to the newly created `keys` directory.

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: localstorage
spec:
  type: crypto.dapr.localstorage
  version: v1
  metadata:
    - name: path
      # Path is relative to the folder where the example is located
      value: ./keys
```

#### `app.go`

[The application file](https://github.com/dapr/quickstarts/tree/master/cryptography/go/sdk/crypto-quickstart/app.go) encrypts and decrypts messages and files using the RSA and AES keys that you generated. The application creates a new Dapr SDK client:

```go
func main() {
	// Create a new Dapr SDK client
	client, err := dapr.NewClient()
    
    //...

	// Step 1: encrypt a string using the RSA key, then decrypt it and show the output in the terminal
	encryptDecryptString(client)

	// Step 2: encrypt a large file and then decrypt it, using the AES key
	encryptDecryptFile(client)
}
```

##### Encrypting and decrypting a string using the RSA key

Once the client is created, the application encrypts a message:

```go
func encryptDecryptString(client dapr.Client) {
    // ...

	// Encrypt the message
	encStream, err := client.Encrypt(context.Background(),
		strings.NewReader(message),
		dapr.EncryptOptions{
			ComponentName: CryptoComponentName,
			// Name of the key to use
			// Since this is a RSA key, we specify that as key wrapping algorithm
			KeyName:          RSAKeyName,
			KeyWrapAlgorithm: "RSA",
		},
	)

    // ...

	// The method returns a readable stream, which we read in full in memory
	encBytes, err := io.ReadAll(encStream)
    // ...

	fmt.Printf("Encrypted the message, got %d bytes\n", len(encBytes))
```

The application then decrypts the message:

```go
	// Now, decrypt the encrypted data
	decStream, err := client.Decrypt(context.Background(),
		bytes.NewReader(encBytes),
		dapr.DecryptOptions{
			// We just need to pass the name of the component
			ComponentName: CryptoComponentName,
			// Passing the name of the key is optional
			KeyName: RSAKeyName,
		},
	)

    // ...

	// The method returns a readable stream, which we read in full in memory
	decBytes, err := io.ReadAll(decStream)

    // ...

	// Print the message on the console
	fmt.Printf("Decrypted the message, got %d bytes\n", len(decBytes))
	fmt.Println(string(decBytes))
}
``` 

##### Encrypt and decrpyt a large file using the AES key

Next, the application encrypts a large image file:

```go
func encryptDecryptFile(client dapr.Client) {
	const fileName = "liuguangxi-66ouBTTs_x0-unsplash.jpg"

	// Get a readable stream to the input file
	plaintextF, err := os.Open(fileName)

    // ...

	defer plaintextF.Close()

	// Encrypt the file
	encStream, err := client.Encrypt(context.Background(),
		plaintextF,
		dapr.EncryptOptions{
			ComponentName: CryptoComponentName,
			// Name of the key to use
			// Since this is a symmetric key, we specify AES as key wrapping algorithm
			KeyName:          SymmetricKeyName,
			KeyWrapAlgorithm: "AES",
		},
	)

    // ...

	// Write the encrypted data to a file "encrypted.out"
	encryptedF, err := os.Create("encrypted.out")

    // ...

	encryptedF.Close()

	fmt.Println("Wrote decrypted data to encrypted.out")
```

The application then decrypts the large image file:

```go
	// Now, decrypt the encrypted data
	// First, open the file "encrypted.out" again, this time for reading
	encryptedF, err = os.Open("encrypted.out")

    // ...

	defer encryptedF.Close()

	// Now, decrypt the encrypted data
	decStream, err := client.Decrypt(context.Background(),
		encryptedF,
		dapr.DecryptOptions{
			// We just need to pass the name of the component
			ComponentName: CryptoComponentName,
			// Passing the name of the key is optional
			KeyName: SymmetricKeyName,
		},
	)

    // ...

	// Write the decrypted data to a file "decrypted.out.jpg"
	decryptedF, err := os.Create("decrypted.out.jpg")

    // ...

	decryptedF.Close()

	fmt.Println("Wrote decrypted data to decrypted.out.jpg")
}
```

{{% /codetab %}}


{{< /tabs >}}

## Watch the demo

Watch this [demo video of the cryptography API from the Dapr Community Call #83](https://youtu.be/PRWYX4lb2Sg?t=1148):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/PRWYX4lb2Sg?start=1148" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Tell us what you think!

We're continuously working to improve our Quickstart examples and value your feedback. Did you find this Quickstart helpful? Do you have suggestions for improvement?

Join the discussion in our [discord channel](https://discord.com/channels/778680217417809931/953427615916638238).

## Next steps

- Walk through [more examples of encrypting and decrypting using the cryptography API]({{< ref howto-cryptography.md >}})
- Learn more about [cryptography as a Dapr building block]({{< ref cryptography-overview.md >}})

{{< button text="Explore Dapr tutorials  >>" page="getting-started/tutorials/_index.md" >}}
