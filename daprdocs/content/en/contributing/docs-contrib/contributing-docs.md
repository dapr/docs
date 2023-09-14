---
type: docs
title: "Contributors guide"
linkTitle: "Contributors guide"
weight: 10
description: Get started with contributing to the Dapr docs
---

In this guide, you'll learn how to contribute to the [Dapr docs repository](https://github.com/dapr/docs). Since Dapr docs are published to [docs.dapr.io](https://docs.dapr.io), you must make sure your contributions compile and publish correctly.

## Prerequisites

Before contributing to the Dapr docs: 

- Review the [guidance around general Dapr project contributions]({{< ref contributing-overview>}}).
- Install and set up your local environment with [Hugo](https://gohugo.io/) with the [Docsy](https://docsy.dev) theme. Follow the instructions in the repository [README.md](https://github.com/dapr/docs/blob/master/README.md#environment-setup).
- Fork and clone the [docs repository](https://github.com/dapr/docs).

## Branch guidance

The Dapr docs handles branching differently than most code repositories. Instead of a `main` branch, every branch is labeled to match the major and minor version of a runtime release. For the full list visit the [Docs repo](https://github.com/dapr/docs#branch-guidance)

Generally, all of your docs updates should point to [docs branch for the latest release of Dapr](https://github.com/dapr/docs). The latest release is the default branch [https://github.com/dapr/docs]. For example, if you are fixing a typo, adding notes, or clarifying a point, make your changes into the default Dapr branch.

For any docs changes applicable to a release candidate or a pre-release version of the docs, point your changes into that particular branch. For example, if you are documenting an upcoming change to a component or the runtime, make your changes to the pre-release branch.

## Style and tone

Style and tone conventions should be followed throughout all Dapr documentation for consistency across all docs:

| Style/Tone | Guidance |
| ---------- | -------- |
| Casing | Use upper case only: <br> <ul><li>At the start of a sentence or header</li><li>For proper nouns, including names of technologies (Dapr, Redis, Kubernetes etc.)</li></ul> |
| Headers and titles | Headers and titles must be brief, but descriptive and clear. |
| Use simple sentences | Write easy-to-read, scannable sentences. Tip: Skip the formal tone and write as if you were talking directly to the reader. |
| Avoid the first person | Instead of first person "I", "we", and "our", use second person "you" and "your". |
| Assume a "new developer" audience | Some seemingly obvious steps to an experienced developer might not be as obvious to a new developer. Give the reader more explicit, thorough instructions. |
| Use present tense | Avoid sentences like "this command _will_ install Redis". Instead, use "This command installs Redis". |

## Diagrams and images

Diagrams and images are invaluable visual aids for documentation pages. Diagrams are kept in a [Dapr Diagrams Deck](https://github.com/dapr/docs/tree/v1.11/daprdocs/static/presentations), which includes guidance on style and icons. 

As you create diagrams for your documentation:

- Save them as high-res PNG files into the [images folder](https://github.com/dapr/docs/tree/v1.11/daprdocs/static/images).
- Name your PNG files using the convention of a concept or building block so that they are grouped.
  - For example: `service-invocation-overview.png`. 
  - For more information on calling out images using shortcode, see the [Images guidance](#images) section below.
- Add the diagram to the correct section in the `Dapr-Diagrams.pptx` deck so that they can be amended and updated during routine refresh.

## Contributing a new docs page

If you're creating a new article, make sure you:

- Place the new document in the correct place in the hierarchy.
- Avoid creating new sections. Most likely, the proper place is already in the docs hierarchy.
- Include complete [Hugo front-matter](#front-matter).

Select the topic type below to view a suggested template to help you get started.

| Topic type | What is it? |
| ---------- | ----------- |
| [Concept]({{< ref "concept-template.md" >}}) | Answers the question, "What problems does this help me solve?" Avoid repeating the API or component spec; provide more details. |
| [Quickstart]({{< ref "quickstart-template.md" >}}) | Provides a "Five minutes to _wow_" experience. Walk the reader quickly through a feature or API and how it works in a controlled example. |
| [How-to]({{< ref "howto-template.md" >}}) | Provides a detailed, practical step-by-step through a Dapr feature or technology. Encourage the reader to try with their own scenario, rather than the controlled scenario provided in a quickstart. |

## Requirements for docs.dapr.io

Make sure your contribution doesn't break the website build. The way Hugo builds the website requires following the guidance below:

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

Hugo `ref` and `relref` [shortcodes](https://gohugo.io/content-management/cross-references/) are used to reference other pages and sections. These shortcodes also allow the build to break if a page is incorrectly renamed or removed.

For example, this shortcode, written inline with the rest of the markdown page, will link to the _index.md of the section/folder name:

```md
{{</* ref "folder" */>}}
```

While this shortcode will link to a specific page:

```md
{{</* ref "page.md" */>}}
```

All pages and folders need to have _globally unique names_ in order for the ref shortcode to work properly. If there are duplicate names, the build will break and an error will be thrown.

#### Referencing sections in other pages

To reference a specific section in another page, add `#section-short-name` to the end of your reference.

As a general rule, the section short name is the text of the section title, all lowercase, with spaces changed to "-". You can check the section short name by:

1. Visiting the website page.
1. Clicking the link icon (🔗) next to the section.
1. Seeing how the URL renders in the nav bar.
1. Copying the content after the "#" for your section shortname.

As an example, for this specific section, the complete reference to the page and section would be:

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

Don't forget to set the `alt` attribute to keep the docs readable and accessible.

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

All content you author will be rendered to markdown, so you can include images, code blocks, YouTube videos, and more.

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
All Dapr sample code should be self-contained in separate files, not in markdown. Use these techniques to highlight the parts of the sample code users should focus on.
{{% /alert %}}

Use the `lang` (default `txt`) parameter to configure the language used for syntax highlighting.

Use the `marker` parameter to limit the embedded snipped to a portion of the sample file. This is useful when you want to show just a portion of a larger file. Typically, you'd do this by:

1. Surrounding the interesting code with comments.
1. Passing the comment text into `marker`.

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

[Docsy authoring guide](https://www.docsy.dev/docs/adding-content/)

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

- Repeat above step as necessary for all other translation directories.

## Next steps

Get started by copying and working from one of [the Dapr doc templates]({{< ref docs-templates >}}).
