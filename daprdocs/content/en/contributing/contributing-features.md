---
type: docs
title: "Contribution of new features"
linkTitle: "New features"
weight: 1000
description: >
  General guidance for contributing with new features
---

While using Dapr, you might have ideas of new features, building blocks or APIs that can benefit the community. This document provides the guidelines on how to get your feature proposal from ideation to delivery.

## Look at the issue backlog

The first step is to look for previously open and closed issues that might relate to your idea, this will avoid duplication and keep discussion for a given feature in an unique thread.

## Create a proposal issue

Create an issue in the [Dapr repository](https://github.com/dapr/dapr) or in the appropriate repository, if proposal is specific. At this point the community and maintainers will comment on the issue to answer the following questions:

1. Is it a duplicate?
2. Is the proposal relevant to Dapr?
3. What is the priority compared to other deliverables?
4. What is the proper scope to be delivered?

> Example: [Configuration API](https://github.com/dapr/dapr/issues/2941)

## Design proposal

Maintainers will now assign the issue to a contributor or maintainer to propose a design. This design is done via a new issue, referencing the proposal issue above. At this point, maintainers and the community will comment on different aspects of the design, seeking concensus. The final decision on the design belongs to maintainers of the runtime repository unless the issue is not relevant to the runtime.

> Example: [Configuration API design](https://github.com/dapr/dapr/issues/2988)

## Implementation in runtime

The next step is to implement the feature in the runtime, if applicable. New features should be behind a preview feature flag or as an alpha API. There might be exceptions to this for features that are considered small and harmless at the maintainers' discretion. The new feature must also be covered in a new end-to-end test before it can migrate out of alpha into the fully supported API.

New features might also require changes in the [Components-contrib repository](https://github.com/dapr/dapr). There might be a path to add the new feature to existing components, including stable components.

## Implementation in SDKs

The feature now must be implemented in all SDKs, with examples and integration testing. The timing to which a feature is available on each SDKs might vary.

## Documentation

[Documentation](https://github.com/dapr/docs) on how to use the new feature must be available even when in preview or alpha API. The SDK documentation must also be updated in the docs website. In addition, the new feature might also be included in [Quickstarts](https://github.com/dapr/quickstarts).


## Celebrate

Now the new feature is fully delivered and supported in Dapr!