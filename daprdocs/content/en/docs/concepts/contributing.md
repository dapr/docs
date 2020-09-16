---
title: "Contributing to Dapr"
linkTitle: "Contributing"
weight: 100
description: >
  How to contribute to the Dapr project.
---

# Contributing to Dapr documentation

High quality documentation is a core tenant of the Dapr project. Some contribution guidelines are below.

## Style and tone

- Use sentence-casing for headers.
- When referring to product names and technologies use capitalization (e.g. Kubernetes, Helm, Visual Studio Code, Azure Key Vault and of course Dapr).
- Check the spelling and grammar in your articles.
- Use a casual and friendly voice—like tone as if you're talking to another person one-on-one.
- Use simple sentences. Easy-to-read sentences mean the reader can quickly use the guidance you share.
- Use “you” rather than “users” or “developers” conveying friendliness.
- Avoid the word “will”; write in present tense and not future where possible. E.g. Avoid “Next we will open the file and build”. Just say “Now open the file and build”
- Avoid the word “we”. We is generally not meaningful. We who?
- Avoid the word “please”. This is not a letter asking for any help, this is technical documentation.
- Assume a new developer audience. Some obvious steps can seem hard. E.g. Now set an environment variable DAPR to a value X. It is better to give the reader the explicit command to do this, rather than having them figure this out.
- Where possible give the reader links to next document/article for next steps or related topics (this can be relevant "how-to", samples for reference or concepts).

# Contributing to `Concepts`

- Ensure the reader can understand why they should care about this feature. What problems does it help them solve?
- Ensure the doc references the spec for examples of using the API.
- Ensure the spec is consistent with concept in terms of names, parameters and terminology. Update both the concept and the spec as needed.
- Avoid just repeating the spec. The idea is to give the reader more information and background on the capability so that they can try this out. Hence provide more information and implementation details where possible.
- Provide a link to the spec in the [Reference](/reference) section.
- Where possible reference a practical [How-To](/howto) doc.

# Contributing to `How-Tos`

See [this template](./howto-template.md) for `How To` articles.

- `How To` articles are meant to provide step-by-step practical guidance on to readers who wish to enable a feature, integrate a technology or use Dapr in a specific scenario.
- Location - `How To` articles should all be under the [howto](../howto) directory in a relevant sub directories - make sure to see if the article you are contributed should be included in an existing sub directory.
- Sub directory naming - the directory name should be descriptive and if referring to specific component or concept should begin with the relevant name. Example *pubsub-namespaces*.
- When adding a new article make sure to add a link in the main [How To README.md](../howto/README.md) as well as other articles or samples that may be relevant.
- Do not assume the reader is using a specific environment unless the article itself is specific to an environment. This include OS (Windows/Linux/MacOS), deployment target (Kubernetes, IoT etc.) or programming language. If instructions vary between operating systems, provide guidance for all.
- How to articles should include the following sub sections:
    - **Pre-requesties**
    - **\<Steps\>** times X as needed
    - **Cleanup**
    - **Related links**
- Include code/sample/config snippets that can be easily copied and pasted.
