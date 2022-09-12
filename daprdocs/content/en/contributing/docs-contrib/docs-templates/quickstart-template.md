---
type: docs
title: "Quickstart guide template"
linkTitle: "Quickstart template"
weight: 20
description: Suggested template and guidance for creating a quickstart guide
---

## Contributing a new quickstart guide

Dapr quickstart guides consist of quick instructions that walk readers through a prepared quickstart, saved to the [dapr/quickstarts repo](https://github.com/dapr/quickstarts). These quickstarts package an entire feature or building block in one place, making it easy for the reader to experience how it works without compromising their own project.

The quickstart instructions should be succinct, direct, and clear. The sole purpose of a quickstart guide is to simply instruct a reader through the prepared quickstart. If you'd like to explain the concepts behind the quickstart, direct the reader to a concept article for more context.

{{% alert title="Note" color="primary" %}}
This template is only a suggestion. Feel free to change based on your document's purpose.
{{% /alert %}}

Learn more about [contributing to the Dapr docs]({{< ref contributing-docs.md >}}), like [front-matter]({{< ref "contributing-docs.md#front-matter" >}}) and [shortcodes]({{< ref "contributing-docs.md#shortcodes" >}}).

### Template

```md
---
type: #Required; docs
title: #Required; "Quickstart: Brief, clear title"
linkTitle: #Required; This will display in the docs table of contents
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
Required. Light intro that briefly describes what the quickstart will cover. Link off to the appropriate concept or overview docs to provide context. -->

<!-- 
Include a diagram or image, if possible. 
-->

<!-- 
Make sure the quickstart includes examples for multiple programming languages. 
-->

## Pre-requisites

<!--
Make sure the reader is prepared for a successful quickstart walk through by listing what they may need.
-->

## Step 1: Set up the environment

<!-- 
Link to the quickstart sample for the reader to clone. 
-->

## Step 2: <action or task>

<!-- 
Each H2 step should start with a verb/action word.
-->

<!--
Include code snippets where possible. 
-->

## Tell us what you think!

We're continuously working to improve our Quickstart examples and value your feedback. Did you find this quickstart helpful? Do you have suggestions for improvement?

Join the discussion in our [discord channel](https://discord.gg/22ZtJrNe).

<!-- Since Dapr is an open community of contributors, make sure to provide a link to the discord discussion to welcome feedback.
-->

## Next steps

<!--
Link to related pages and examples. For example, the building block overview, the HTTP version of an SDK quickstart sample, etc.
-->

<!--
Use the button shortcode to direct readers to more in-depth, related scenarios, like the Dapr tutorials.
-->

```