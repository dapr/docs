---
type: docs
title: "How to: Use the cryptography APIs"
linkTitle: "How to: Use cryptography"
weight: 2000
description: "Learn how to encrypt and decrypt files"
---

Now that you've read about [Cryptography as a Dapr building block]({{< ref cryptography-overview.md >}}), let's walk through using the [high-level cryptography APIs]({{< ref cryptography_api.md >}}) with the Dapr SDKs. 

{{% alert title="Note" color="primary" %}}
Dapr Cryptography is currently in alpha.
{{% /alert %}}

## Encrypt

To read and encrypt a file, add the `Encrypt` gRPC API to your project.

{{< tabs "Go" >}}

{{% codetab %}}

<!--go-->

```go
out, err := sdkClient.Encrypt(context.Background(), rf, dapr.EncryptOptions{
	// These are the 3 required parameters
	ComponentName: "mycryptocomponent",
	KeyName:        "mykey",
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

## Decrypt

To decrypt a file, add the `Decrypt` gRPC API to your project.

{{< tabs "Go" >}}

{{% codetab %}}

<!--go-->

```go
out, err := sdkClient.Decrypt(context.Background(), rf, dapr.EncryptOptions{
	// Only required option is the component name
	ComponentName: "mycryptocomponent",
})
```

{{% /codetab %}}

{{< /tabs >}}

## Next steps
- [Cryptography API reference]({{< ref cryptography_api.md >}})
- [Cryptography component specs]({{< ref supported-cryptography >}})