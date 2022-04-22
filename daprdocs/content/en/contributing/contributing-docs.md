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

## Branch guidance
The Dapr docs handles branching differently than most code repositories. Instead of having a `master` or `main` branch, every branch is labeled to match the major and minor version of a runtime release. For the full list visit the [Docs repo](https://github.com/dapr/docs#branch-guidance)

Overall, all updates should go into the docs branch for the latest release of Dapr. You can find this directly at [https://github.com/dapr/docs](https://github.com/dapr/docs), as the latest release will be the default branch. For any docs changes that are applicable to a release candidate or a pre-release version of the docs, make your changes into that particular branch.

For example, if you are fixing a typo, adding notes, or clarifying a point, make your changes into the default Dapr branch. If you are documenting an upcoming change to a component or the runtime, make your changes to the pre-release branch. Branches can be found in the [Docs repo](https://github.com/dapr/docs#branch-guidance)

## Style and tone
These conventions should be followed throughout all Dapr documentation to ensure a consistent experience across all docs.

- **Casing** - Use upper case only at the start of a sentence or for proper nouns including names of technologies (Dapr, Redis, Kubernetes etc.).
- **Headers and titles** - Headers and titles must be descriptive and clear, use sentence casing i.e. use the above casing guidance for headers and titles too
- **Use simple sentences** - Easy-to-read sentences mean the reader can quickly use the guidance you share.
- **Avoid the first person** - Use 2nd person "you", "your" instead of "I", "we", "our".
- **Assume a new developer audience** - Some obvious steps can seem hard. E.g. Now set an environment variable Dapr to a value X. It is better to give the reader the explicit command to do this, rather than having them figure this out.
- **Use present tense** - Avoid sentences like "this command will install redis", which implies the action is in the future. Instead use "This command installs redis" which is in the present tense.

## Diagrams and images
It is strongly encouraged to create diagrams and images where ever possible for documentation pages. All diagrams are kept in a Dapr Diagrams Deck, which has guidance on style and icons. The diagram images are saved as PNG files into the [images folder](/images). 
Diagrams should be;
- Saved as PNG files with a high resolution
- Named using the convention of a concept or building block so that they are grouped. For example `service-invocation-overview.png`. Also see Images guidance section below.
- Added to the correct section in the `Dapr-Diagrams.pptx` deck so that they can be amended and updated.

{{< button text="Download the Dapr Diagrams Deck" link="/presentations/Dapr-Diagrams.pptx.zip" >}}


## Contributing a new docs page
- Make sure the documentation you are writing is in the correct place in the hierarchy.
- Avoid creating new sections where possible, there is a good chance a proper place in the docs hierarchy already exists.
- Make sure to include a complete [Hugo front-matter](#front-matter).

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
> Note that all pages and folders need to have globally unique names in order for the ref shortcode to work properly. If there are duplicate names the build will break and an error will be thrown.

#### Referencing sections in other pages

To reference a specific section in another page, add `#section-short-name` to the end of your reference.

As a general rule, the section short name is the text of the section title, all lowercase, with spaces changed to "-". You can check the section short name by visiting the website page, clicking the link icon (🔗) next to the section, and see how the URL renders in the nav bar. The content after the "#" is your section shortname.

As an example, for this specific section the complete reference to the page and section would be:

```md
{{</* ref "contributing-docs.md#referencing-sections-in-other-pages" */>}}
```

## Shortcodes

The following are useful shortcodes for writing Dapr documentation

### Images
The markdown spec used by Docsy and Hugo does not give an option to resize images using markdown notation. Instead, raw HTML is used.

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

### Embedded code snippets

Use the `code-snippet` shortcode to reference code snippets from the `static/code` directory.

```
{{</* code-snippet file="myfile.py" lang="python" */>}}
```

{{% alert title="Warning" color="warning" %}}
All Dapr sample code should be self-contained in separate files, not in markdown. Use the techniques described here to highlight the parts of the sample code users should focus on.
{{% /alert %}}

Use the `lang` (default `txt`) parameter to configure the language used for syntax highlighting.

Use the `marker` parameter to limit the embedded snipped to a portion of the sample file. This is useful when you want to show just a portion of a larger file. The typical way to do this is surround the interesting code with comments, and then pass the comment text into `marker`.

The shortcode below and code sample:

```
{{</* code-snippet file="./contributing-1.py" lang="python" marker="#SAMPLE" */>}}
```

```python
import json
import time

from dapr.clients import DaprClient

#SAMPLE
with DaprClient() as d:
    req_data = {
        'id': 1,
        'message': 'hello world'
    }

    while True:
        # Create a typed message with content type and body
        resp = d.invoke_method(
            'invoke-receiver',
            'my-method',
            data=json.dumps(req_data),
        )

        # Print the response
        print(resp.content_type, flush=True)
        print(resp.text(), flush=True)

        time.sleep(2)
#SAMPLE
```

Will result in the following output:

{{< code-snippet file="contributing-1.py" lang="python" marker="#SAMPLE" >}}

Use the `replace-key-[token]` and `replace-value-[token]` parameters to limit the embedded snipped to a portion of the sample file. This is useful when you want abbreviate a portion of the code sample. Multiple replacements are supported with multiple values of `token`.

The shortcode below and code sample:

```
{{</* code-snippet file="./contributing-2.py" lang="python" replace-key-imports="#IMPORTS" replace-value-imports="# Import statements"  */>}}
```

```python
#IMPORTS
import json
import time
#IMPORTS

from dapr.clients import DaprClient

with DaprClient() as d:
    req_data = {
        'id': 1,
        'message': 'hello world'
    }

    while True:
        # Create a typed message with content type and body
        resp = d.invoke_method(
            'invoke-receiver',
            'my-method',
            data=json.dumps(req_data),
        )

        # Print the response
        print(resp.content_type, flush=True)
        print(resp.text(), flush=True)

        time.sleep(2)
```

Will result in the following output:

{{< code-snippet file="./contributing-2.py" lang="python" replace-key-imports="#IMPORTS" replace-value-imports="# Import statements"  >}}

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

### Buttons

To create a button in a webpage, use the `button` shortcode.

An optional "newtab" parameter will indicate if the page should open in a new tab. Options are "true" or "false". Default is "false", where the page will open in the same tab.

#### Link to an external page

```
{{</* button text="My Button" link="https://example.com" */>}}
```

{{< button text="My Button" link="https://example.com" >}}

#### Link to another docs page

You can also reference pages in your button as well:
```
{{</* button text="My Button" page="contributing" newtab="true" */>}}
```

{{< button text="My Button" page="contributing" newtab="true" >}}

#### Button colors

You can customize the colors using the Bootstrap colors:
```
{{</* button text="My Button" link="https://example.com" color="primary" */>}}
{{</* button text="My Button" link="https://example.com" color="secondary" */>}}
{{</* button text="My Button" link="https://example.com" color="success" */>}}
{{</* button text="My Button" link="https://example.com" color="danger" */>}}
{{</* button text="My Button" link="https://example.com" color="warning" */>}}
{{</* button text="My Button" link="https://example.com" color="info" */>}}
```

{{< button text="My Button" link="https://example.com" color="primary" >}}
{{< button text="My Button" link="https://example.com" color="secondary" >}}
{{< button text="My Button" link="https://example.com" color="success" >}}
{{< button text="My Button" link="https://example.com" color="danger" >}}
{{< button text="My Button" link="https://example.com" color="warning" >}}
{{< button text="My Button" link="https://example.com" color="info" >}}

### References
- [Docsy authoring guide](https://www.docsy.dev/docs/adding-content/)

## Translations

The Dapr Docs supports adding language translations into the docs using git submodules and Hugo's built in language support.

You can find an example PR of adding Chinese language support in [PR 1286](https://github.com/dapr/docs/pull/1286).

Steps to add a language:
- Open an issue in the Docs repo requesting to create a new language-specific docs repo
- Once created, create a git submodule within the docs repo:
   ```sh
   git submodule add <remote_url> translations/<language_code>
   ```
- Add a language entry within `daprdocs/config.toml`:
   ```toml
    [languages.<language_code>]
      title = "Dapr Docs"
      weight = 3
      contentDir = "content/<language_code>"
      languageName = "<language_name>"
   ```
- Create a mount within `daprdocs/config.toml`:
   ```toml
   [[module.mounts]]
     source = "../translations/docs-<language_code>/content/<language_code>"
     target = "content"
     lang = "<language_code>"
   ```
- Repeat above step as necessary for all other translation directories