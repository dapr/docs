---
type: docs
title: "Conceptual article template"
linkTitle: "Conceptual template"
weight: 10
description: Suggested template and guidance for creating a concept article
---


## Contributing a new conceptual or overview article

Conceptual (or overview) articles answer the questions:

- Why should you care about this feature?
- What problems does it help you solve?

While a component, API, or SDK spec may help readers understand how to use or work with these features, a conceptual article provides more depth and context. Link off to the spec article, but try not to simply repeat the spec.

When naming your conceptual article, make sure it is consistent with the spec in terms of names, parameters, and terminology. Make sure you update both as needed.

{{% alert title="Note" color="primary" %}}
This template is only a suggestion. Feel free to change based on your document's purpose.
{{% /alert %}}

Learn more about [contributing to the Dapr docs]({{< ref contributing-docs.md >}}), like [front-matter]({{< ref "contributing-docs.md#front-matter" >}}) and [shortcodes]({{< ref "contributing-docs.md#shortcodes" >}}).

### Template

```md
---
type: #Required; docs
title: #Required; Brief, clear title
linkTitle: #Required; Brief title
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
Required. Brief intro that describes the concepts that the article will cover. Link off to the appropriate reference, specs, or how-to guides to provide context. -->

<!-- 
Include a diagram or image, if possible. 
-->

## <Section 1 H2>

<!-- 
Add your content here.  
-->

## <Section 2 H2>

<!-- 
Each H2 step should start with a noun/descriptive word.
-->

## <Section 3 H2>

<!--
Add your content here.
-->

<!--
Include diagrams or images throughout, where applicable.
-->

## Try out <concept>

<!-- 
If applicable, include a section with links to the related quickstart, how-to guides, or tutorials. --> 

### Quickstarts and tutorials

Want to put the Dapr <topic> API to the test? Walk through the following quickstart and tutorials to see <topic> in action:

| Quickstart/tutorial | Description |
| ------------------- | ----------- |
| [<topic> quickstart](link) | Description of the quickstart. |
| [<topic> tutorial](link) | Description of the tutorial. |

### Start using <topic> directly in your app

Want to skip the quickstarts? Not a problem. You can try out the <topic> building block directly in your application. After [Dapr is installed](link), you can begin using the <topic> API, starting with [the <topic> how-to guide](link).


-->

## Next steps

<!--
Link to related pages and examples. For example, the related API spec, related building blocks, etc.
-->

```