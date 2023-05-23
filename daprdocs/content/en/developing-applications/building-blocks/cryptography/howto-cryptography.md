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

Using the Dapr gRPC APIs in your project, you can encrypt a stream of data, such as a file.

{{< tabs "Go" >}}

{{% codetab %}}

<!--go-->

```go
out, err := sdkClient.Encrypt(context.Background(), rf, dapr.EncryptOptions{
	// Name of the Dapr component (required)
	ComponentName: "mycryptocomponent",
	// Name of the key stored in the component (required)
	KeyName:        "mykey",
	// Algorithm used for wrapping the key, which must be supported by the key named above.
	// Options include: "RSA", "AES"
	Algorithm:     "RSA",
})
```

{{% /codetab %}}

{{< /tabs >}}

The following example puts the `Encrypt` API in context, with code that reads the file, encrypts it, then stores the result in another file.

{{< tabs "Go" >}}

{{% codetab %}}

<!--go-->

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
	KeyName:        "mykey",
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

{{% /codetab %}}

{{< /tabs >}}

The following example uses the `Ecrypt` API to encrypt a string.

{{< tabs "Go" >}}

{{% codetab %}}

<!--go-->

```go
// Input string
rf := strings.NewReader("Amor, ch’a nullo amato amar perdona, mi prese del costui piacer sì forte, che, come vedi, ancor non m’abbandona")

// Encrypt the data using Dapr
enc, err := sdkClient.Encrypt(context.Background(), rf, dapr.EncryptOptions{
	ComponentName: "mycryptocomponent",
	KeyName:        "mykey",
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

To decrypt a file, add the `Decrypt` gRPC API to your project.

{{< tabs "Go" >}}

{{% codetab %}}

<!--go-->

In the following example, `out` is a stream that can be written to file or read in memory,  as in the examples above.

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