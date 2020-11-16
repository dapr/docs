---
type: docs
title: "Docs contributions"
linkTitle: "Docs"
weight: 2000
description: >
  Guidelines for contributing to the Dapr Docs
---

This guide contains information about contributions to the [Dapr docs repository](https://github.com/dapr/docs). Please review the guidelines below before making a contribution to the Dapr docs. This guide assumes you have already reviewed the [general guidance]({{< ref contributing-overview>}}) which applies to any Dapr project contributions. 

Dapr docs are published to [docs.dapr.io](https://docs.dapr.io). Therefore, any contribution must ensure docs can be compiled and published correctly.

## Prerequisites 
The Dapr docs are built using [Hugo](https://gohugo.io/) with the [Docsy](https://docsy.dev) theme. To verify docs are built correctly before submitting a contribution, you should setup your local environment to build and display the docs locally.

Fork the [docs repository](https://github.com/dapr/docs) to work on any changes

Follow the instructions in the repository [README.md](https://github.com/dapr/docs/blob/master/README.md#environment-setup) to install Hugo locally and build the docs website.

## Style and tone
These conventions should be followed throughout all Dapr documentation to ensure a consistent experience across all docs.

- **Casing** - Use upper case only at the start of a sentence or for proper nouns including names of technologies (Dapr, Redis, Kubernetes etc.).
- **Headers and titles** - Headers and titles must be descriptive and clear, use sentence casing i.e. use the above casing guidance for headers and titles too 
- **Use simple sentences** - Easy-to-read sentences mean the reader can quickly use the guidance you share.
- **Avoid the first person** - Use 2nd person "you", "your" instead of "I", "we", "our".
- **Assume a new developer audience** - Some obvious steps can seem hard. E.g. Now set an environment variable Dapr to a value X. It is better to give the reader the explicit command to do this, rather than having them figure this out.

## Contributing a new docs page
- Make sure the documentation you are writing is in the correct place in the hierarchy. 
- Avoid creating new sections where possible, there is a good chance a proper place in the docs hierarchy already exists.
- Make sure to include a complete [Hugo front-matter](front-matter).

### Contributing a new concept doc
- Ensure the reader can understand why they should care about this feature. What problems does it help them solve?
- Ensure the doc references the spec for examples of using the API.
- Ensure the spec is consistent with concept in terms of names, parameters and terminology. Update both the concept and the spec as needed.
- Avoid just repeating the spec. The idea is to give the reader more information and background on the capability so that they can try this out. Hence provide more information and implementation details where possible.
- Provide a link to the spec in the [Reference]({{<ref reference >}}) section.
- Where possible reference a practical How-To doc.

### Contributing a new How-To guide

- `How To` articles are meant to provide step-by-step practical guidance on to readers who wish to enable a feature, integrate a technology or use Dapr in a specific scenario.
- Sub directory naming - the directory name should be descriptive and if referring to specific component or concept should begin with the relevant name. Example *pubsub-namespaces*.
- Do not assume the reader is using a specific environment unless the article itself is specific to an environment. This include OS (Windows/Linux/MacOS), deployment target (Kubernetes, IoT etc.) or programming language. If instructions vary between operating systems, provide guidance for all.
- Include code/sample/config snippets that can be easily copied and pasted.
- At the end of the article, provide the reader with related links and next steps (this can be other relevant "how-to", samples for reference or related concepts).

## Requirements for docs.dapr.io
Any contribution must ensure not to break the website build. The way Hugo builds the website requires following the below guidance.

### Files and folder names
File and folder names should be globally unique.
    - `\service-invocation`
    - `service-invocation-overview.md`

### Front-matter
[Front-matter](https://www.docsy.dev/docs/adding-content/content/#page-frontmatter) is what takes regular markdown files and upgrades them into Hugo compatible docs for rendering into the nav bars and ToCs.

Every page needs a section at the top of the document like this:
```yaml
---
type: docs
title: "TITLE FOR THE PAGE"
linkTitle: "SHORT TITLE FOR THE NAV BAR"
weight: (number)
description: "1+ SENTENCES DESCRIBING THE ARTICLE"
---
```

#### Example
```yaml
---
type: docs
title: "Service invocation overview"
linkTitle: "Overview"
weight: 10
description: "A quick overview of Dapr service invocation and how to use it to invoke services within your application"
---
```

> Weight determines the order of the pages in the left sidebar, with 0 being the top-most.

Front-matter should be completed with all fields including type, title, linkTitle, weight, and description.
- `title` should be 1 sentence, no period at the end
- `linkTitle` should be 1-3 words, with the exception of How-to at the front.
- `description` should be 1-2 sentences on what the reader will learn, accomplish, or do in this doc.

As per the [styling conventions](#styling-conventions), titles should only capitalize the first word and proper nouns, with the exception of "How-To:"
    - "Getting started with Dapr service invocation"
    - "How-To: Setup a local Redis instance"

### Referencing other pages
Hugo `ref` and `relref` [shortcodes](https://gohugo.io/content-management/cross-references/) are used to reference other pages and sections. It also allows the build to break if a page is incorrectly renamed or removed.

This shortcode, written inline with the rest of the markdown page, will link to the _index.md of the section/folder name:
```md
{{</* ref "folder" */>}}
```

This shortcode will link to a specific page:
```md
{{</* ref "page.md" */>}}
```

> Note that all pages and folders need to have globally unique names in order for the ref shortcode to work properly.

### Images
The markdown spec used by Docsy and Hugo does not give an option to resize images using markdown notation. Instead, raw HMTL is used.

Begin by placing images under `/daprdocs/static/images` with the naming convention of `[page-name]-[image-name].[png|jpg|svg]`.

Then link to the image using:
```md
<img src="/images/[image-filename]" width=1000 alt="Description of image">
```

>Don't forget to set the alt attribute to keep the docs readable for our visually impaired users.

#### Example

This HTML will display the `dapr-overview.png` image on the `overview.md` page:
```md
<img src="/images/overview-dapr-overview.png" width=1000 alt="Overview diagram of Dapr and its building blocks">
```

### Tabbed content
Tabs are made possible through [Hugo shortcodes](https://gohugo.io/content-management/shortcodes/). 

The overall format is:
```
{{</* tabs [Tab1] [Tab2]>}}

{{% codetab %}}
[Content for Tab1]
{{% /codetab %}}

{{% codetab %}}
[Content for Tab2]
{{% /codetab %}}

{{< /tabs */>}}
```

All content you author will be rendered to Markdown, so you can include images, code blocks, YouTube videos, and more.

#### Example
````
{{</* tabs Windows Linux MacOS>}}

{{% codetab %}}
```powershell
powershell -Command "iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1 | iex"
```
{{% /codetab %}}

{{% codetab %}}
```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash
```
{{% /codetab %}}

{{% codetab %}}
```bash
brew install dapr/tap/dapr-cli
```
{{% /codetab %}}

{{< /tabs */>}}
````

This example will render to this:

{{< tabs Windows Linux MacOS>}}

{{% codetab %}}
```powershell
powershell -Command "iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1 | iex"
```
{{% /codetab %}}

{{% codetab %}}
```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash
```
{{% /codetab %}}

{{% codetab %}}
```bash
brew install dapr/tap/dapr-cli
```
{{% /codetab %}}

{{< /tabs >}}

### YouTube videos
Hugo can automatically embed YouTube videos using a shortcode:
```
{{</* youtube [VIDEO ID] */>}}
```

#### Example

Given the video https://youtu.be/dQw4w9WgXcQ

The shortcode would be:
```
{{</* youtube dQw4w9WgXcQ */>}}
```

### References
- [Docsy authoring guide](https://www.docsy.dev/docs/adding-content/)
