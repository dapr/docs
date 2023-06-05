---
type: docs
title: "Quickstart: Cryptography"
linkTitle: Cryptography
weight: 79
description: Get started with the Dapr Cryptography building block
---

{{% alert title="Note" color="primary" %}}
The cryptography building block is currently in **alpha**. 
{{% /alert %}}

Let's take a look at the Dapr [cryptography building block](todo). In this Quickstart, you'll create an application that encrypts and decrypts data using the Dapr cryptography APIs (high-level). You'll:

- Encrypt and then decrypt a short string, reading the result in-memory, in a Go byte slice.
- Encrypt and then decrypt a large file, storing the encrypted and decrypted data to files using streams.

<img src="/images/workflow-quickstart-overview.png" width=800 style="padding-bottom:15px;">

{{% alert title="Note" color="primary" %}}
This example uses the Dapr SDK. Using the Dapr SDK, which leverages gRPC internally, is **strongly** recommended when using cryptographic APIs (to encrypt and decrypt messages).
{{% /alert %}}

Currently, you can experience the cryptography API using the Go SDK.

{{< tabs "Go" >}}

 <!-- Go -->
{{% codetab %}}

> This quickstart includes one Go application called `crypto-quickstart`.

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

This sample requires a private RSA key and a 256-bit symmetric (AES) key. Generate the keys using OpenSSL:

```bash
mkdir -p keys
# Generate a private RSA key, 4096-bit keys
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -out keys/rsa-private-key.pem
# Generate a 256-bit key for AES
openssl rand 32 -out keys/symmetric-key-256
```

Run the Go service app with Dapr:

```bash
dapr run --app-id crypto-quickstart --resources-path ../../../components/ -- go run .
```

**Expected output**

```

```

### What happened?


{{% /codetab %}}


{{< /tabs >}}

## Watch the demo

Watch this [demo video of the cryptography API from the Dapr Community Call #83](https://youtu.be/PRWYX4lb2Sg?t=1148):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/PRWYX4lb2Sg?start=1148" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Tell us what you think!

We're continuously working to improve our Quickstart examples and value your feedback. Did you find this Quickstart helpful? Do you have suggestions for improvement?

Join the discussion in our [discord channel](https://discord.com/channels/778680217417809931/953427615916638238).

## Next steps

- Walk through [more examples of encrypting and decrypting using the cryptography API](todo)
- Learn more about [cryptography as a Dapr building block](todo)

{{< button text="Explore Dapr tutorials  >>" page="getting-started/tutorials/_index.md" >}}
