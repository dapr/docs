---
type: docs
title: "How-to guide template"
linkTitle: "How-to template"
weight: 30
description: Suggested template and guidance for creating a how-to guide
---

## Contributing a new how-to guide

How-to guides provide step-by-step practical guidance to readers who wish to:

- Enable a feature
- Integrate a technology
- Use Dapr in a specific scenario

How-to guides can be considered "next-level", self-guided docs compared to quickstarts. How-to scenarios will take longer and can be more easily applied to the reader's individual project or environment.

When naming your how-to document, include the sub-directory name in the file name. If you need to create a new sub-directory, make sure it's descriptive and includes the relevant component or concept name. For example, _pubsub-namespaces_.

{{% alert title="Note" color="primary" %}}
This template is only a suggestion. Feel free to change based on your document's purpose.
{{% /alert %}}

Learn more about [contributing to the Dapr docs]({{< ref contributing-docs.md >}}), like [front-matter]({{< ref "contributing-docs.md#front-matter" >}}) and [shortcodes]({{< ref "contributing-docs.md#shortcodes" >}}).

### Template

```md
---
type: #Required; docs
title: #Required; "How to: Brief, clear title"
linkTitle: #Required; "How to: Shorter than regular title, to show in table of contents"
weight: #Required; Use the correct weight based on hierarchy
description: #Required; One-sentence description of what to expect in the article
---

<!--
Remove all the comments in this template before opening a PR.
-->

<!-- 
H1: The title in the Hugo front-matter serves as the article's markdown H1. 
-->

<!-- Introductory paragraph  
Required. Light intro that briefly describes what the how-to will cover and any default Dapr characteristics. Link off to the appropriate concept or overview docs to provide context. -->

<!-- 
Include a diagram or image, if possible. 
-->

<!--
If applicable, link to the related quickstart in a shortcode note or alert with text like:

 If you haven't already, [try out the <topic> quickstart](link) for a quick walk-through on how to use <topic>.

-->

<!-- 
Make sure the how-to includes examples for multiple programming languages, OS, or deployment targets, if applicable. 
-->

## <Action or task>

<!-- 
Unlike quickstarts, do not use "Step 1", "Step 2", etc.  
-->

## <Action or task>

<!-- 
Each H2 step should start with a verb/action word.
-->

<!--
Include code snippets where possible. 
-->

## Next steps

<!--
Link to related pages and examples. For example, the building block overview, the related tutorial, API reference, etc.
-->

```