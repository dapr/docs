---
type: docs
title: "How To: Retrieve a secret"
linkTitle: "How To: Retrieve a secret"
weight: 2000
description: "Use the secret store building block to securely retrieve a secret"
---

This article provides guidance on using Dapr's secrets API in your code to leverage the [secrets store building block]({{<ref secrets-overview>}}). The secrets API allows you to easily retrieve secrets in your application code from a configured secret store. 

## Prerequisites

Before retrieving secrets in your application's code, you must have a secret store component configured. See guidance on [how to configure a secret store]({{<ref secret-stores-overview>}}) and review [supported secret stores]({{< ref supported-secret-stores >}}) to see specific details required for different secret store solutions.

## Calling the secrets API

Once you have a secret store set up, you can call Dapr to get the secrets for a given key for a specific secret store.

For a full API reference, go [here]({{< ref secrets_api.md >}}).

Here are a few examples in different programming languages:

{{< tabs "Go" "Javascript" "Python" "Rust" "C#" >}}

{{% codetab %}}
```Go
import (
  "fmt"
  "net/http"
)

func main() {
  url := "http://localhost:3500/v1.0/secrets/kubernetes/my-secret"

  res, err := http.Get(url)
  if err != nil {
    panic(err)  
  }
  defer res.Body.Close()

  body, _ := ioutil.ReadAll(res.Body)
  fmt.Println(string(body))
}
```

{{% /codetab %}}

{{% codetab %}}

```javascript
require('isomorphic-fetch');
const secretsUrl = `http://localhost:3500/v1.0/secrets`;

fetch(`${secretsUrl}/kubernetes/my-secret`)
        .then((response) => {
            if (!response.ok) {
                throw "Could not get secret";
            }
            return response.text();
        }).then((secret) => {
            console.log(secret);
        });
```

{{% /codetab %}}

{{% codetab %}}

```python
import requests as req

resp = req.get("http://localhost:3500/v1.0/secrets/kubernetes/my-secret")
print(resp.text)
```

{{% /codetab %}}


{{% codetab %}}

```rust
#![deny(warnings)]
use std::{thread};

#[tokio::main]
async fn main() -> Result<(), reqwest::Error> {
    let res = reqwest::get("http://localhost:3500/v1.0/secrets/kubernetes/my-secret").await?;
    let body = res.text().await?;
    println!("Secret:{}", body);

    thread::park();

    Ok(())
}
```

{{% /codetab %}}

{{% codetab %}}

```csharp
var client = new HttpClient();
var response = await client.GetAsync("http://localhost:3500/v1.0/secrets/kubernetes/my-secret");
response.EnsureSuccessStatusCode();

string secret = await response.Content.ReadAsStringAsync();
Console.WriteLine(secret);
```
{{% /codetab %}}

{{< /tabs >}}