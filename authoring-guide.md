# How to author Dapr Docs

This guide will walk through how to write and edit the markdown so that Hugo can correctly render it.

## Styling Conventions
These conventions should be followed throughout all Dapr documentation to ensure a consistent experience across all docs.

1. **Titles** should only capitalize the first word and proper nouns, with the exception of "How-to:"
    - "Getting started with Dapr service invocation"
    - "How-to: Setup a local Redis instance"
1. **File and folder names** should be globally unique.
    - `\service-invocation`
    - `service-invocation-overview.md`
1. **[Front-matter](#front-matter)** should be compelted with all fields including type, title, linkTitle, weight, and description.
    - `title` should be 1 sentence, no period at the end
    - `linkTitle` should be 1-3 words, with the exception of How-to at the front.
    - `description` should be 1-2 sentences on what the reader will learn, accomplish, or do in this doc.

## Front-matter
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

### Example
```yaml
---
type: docs
title: "Service invocation overview"
linkTitle: "Overview"
weight: 10
description: "A quick overview of Dapr service invocation and how to use it to invoke services within your application."
---
```

> Remember to follow the [styling conventions](#styling-conventions) from above.

> Weight determines the order of the pages in the left sidebar, with 0 being the top-most.

## Referencing other pages
Hugo `ref` and `relref` [shortcodes](https://gohugo.io/content-management/cross-references/) are used to reference other pages and sections. It also allows the build to break if a page is incorrectly renamed or removed.

This shortcode, written inline with the rest of the markdown page, will link to the _index.md of the section/folder name:
```
{{< ref "folder" >}}
```

This shortcode will link to a specific page:
```
{{< ref "page.md" >}}
```

> Note that all pages and folders need to have globally unique names in order for the ref shortcode to work properly.

## Images
The markdown spec used by Docsy and Hugo does not give an option to resize images using markdown notation. Instead, raw HMTL is used.

Begin by placing images under `/daprdocs/static/images` with the naming convention of `[page-name]-[image-name].[png|jpg|svg]`.

Then link to the image using:
```
<img src="/images/[image-filename]" width=1000 alt="Description of image">
```

>Don't forget to set the alt attribute to keep the docs readable for our visually impaired users.

### Example

This HTML will display the `dapr-overview.png` image on the `overview.md` page:
```
<img src="/images/overview-dapr-overview.png" width=1000 alt="Overview diagram of Dapr and its building blocks">
```

## Tabbed Content
Tabs are made possible through [Hugo shortcodes](https://gohugo.io/content-management/shortcodes/). 

The overall format is:
```
{{< tabs [Tab1] [Tab2]>}}

{{% codetab %}}
[Content for Tab1]
{{% /codetab %}}

{{% codetab %}}
[Content for Tab2]
{{% /codetab %}}

{{< /tabs >}}
```

All content you author will be rendered to Markdown, so you can include images, code blocks, YouTube videos, and more.

### Example
````
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
````

## YouTube Videos
Hugo can automatically embed YouTube videos using a shortcode:
```
{{< youtube [VIDEO ID] >}}
```

### Example

Given the video https://youtu.be/dQw4w9WgXcQ

The shortcode would be:
```
{{< youtube dQw4w9WgXcQ >}}
```

## References
- [Docsy authoring guide](https://www.docsy.dev/docs/adding-content/)