---
type: docs
title: "Tutorial: Dapr.Actors.Next by example"
linkTitle: "Tutorial"
weight: 160000
description: "A six-part, example-driven tour of what changed in the modernized Dapr Actors implementation, with the testing for each"
---

This tutorial walks through six worked examples, one improvement at a time, and treats the test for each as a first-class part rather than an afterthought. The cleaner authoring is worth seeing, but for several of these the headline is that you can now write the test at all.

The runnable code lives in the solution under `/examples/Actor.Next/`, one folder per part, each with its actor code and its xUnit v3 tests. You can clone and run them, then come back here for the what and the why. Each part below links to its example folder. It's recommended that you install your local Dapr instance using `dapr init` so you get the sample state store and PubSub components created and to make sure you're on the latest v1.18 runtime version. 

{{% alert title="Package references" color="primary" %}}
All projects within the Dapr .NET SDK repository are referenced using relative paths. Meta-packages like `Dapr.Actors.Next` are comprised of all their individual projects (e.g. `Dapr.Actors.Next.Streams`, `Dapr.Actors.Next.Testing`, etc.) and are combined only an artifact of the build pipeline. As such, the individual projects in the examples below refernce each of these individual projects within the repository. These packages are not intended to be published to NuGet and only for local SDK experimentation and development. When using this package in your own projects, whether host or test projects, it is intended that you install `Dapr.Actors.Next` from NuGet. When cloning this repository, they'll build and run using these local references, but there are no corresponding packages for each in NuGet - only `Dapr.Actors.Next`.
{{% /alert %}}

{{% alert title="Temporarily placed in `feature-actors-next` branch" color="primary" %}}
The `Dapr.Actors.Next` package has been released as a preview and is subject to change. It has not yet been merged into the `master` branch of the [Dapr .NET SDK repository](https://github.com/dapr/dotnet-sdk), but if you'd like to clone the branch to contribute or experiment with the examples, you can find it [here](https://github.com/dapr/dotnet-sdk/tree/feature-actors-next). This is expected to be released as stable alongside the v1.19 release of the Dapr runtime at this point it will be merged into master and easily accessible.
{{% /alert %}}

## Tutorial content

The first three parts build on one shopping-cart scenario so the story is continuous; the last three stand on their own. Read top to bottom and the authoring gets a little more ambitious each time, while the testing is the consistent payoff: it needs less infrastructure and reaches further at every step.

- [Part 1: The cart, the modern baseline]({{< ref dotnet-actorsnext-tutorial-cart.md >}}). The actor you already know, with the ceremony removed. The reminder test that used to need a sidecar now needs nothing.
- [Part 2: Evolving the cart's state]({{< ref dotnet-actorsnext-tutorial-migration.md >}}). A breaking state change becomes a build error and a unit-testable migration, with no database.
- [Part 3: The cart that reacts]({{< ref dotnet-actorsnext-tutorial-pubsub.md >}}). Dynamic pub/sub in one attribute. An event-driven flow proven without a broker.
- [Part 4: The auction]({{< ref dotnet-actorsnext-tutorial-auction.md >}}). A state machine, and the previously untestable timer-versus-message race written as a deterministic unit test.
- [Part 5: Runtime-defined state machines]({{< ref dotnet-actorsnext-tutorial-interpreted.md >}}). State machines supplied as data at runtime, verified before they go live, and driven dynamically.
- [Part 6: Composing interpreted actors with workflows]({{< ref dotnet-actorsnext-tutorial-approvals.md >}}). Runtime-defined approval machines that hand off to a settlement workflow, with retry and compensation, tested without a sidecar.

The single idea underneath the whole set: the old SDK could run actors, and the new one lets you prove they are correct. The tests are where that stops being a slogan.

## Prerequisites

- The .NET 8, 9, or 10 SDK (though all the examples use .NET 10 since 8 and 9 will reach end of life towards the end of 2026).
- The `Dapr.Actors.Next` package (or the solution's project references) and, for the test projects, `Dapr.Actors.Next.Testing`.
  - If you're building against this solution directly, you can use the referenced packages the examples use, but otherwise use the combined package on NuGet.
- At least v1.18 of the Dapr runtime as it's required for the `Dapr.Actors.Next` implementation. Every unit test in this tutorial runs with no sidecar, no state store, and no Docker (testing using the built-in test functionality), but in a real-world environment you'd be expected to supplement with your own integration and E2E testing against the Dapr runtime and components.

If you are new to the SDK, skim the [overview]({{< ref _index.md >}}) first; each part links to the relevant concept page for reference detail.

## Next steps

- [Part 1: The cart, the modern baseline]({{< ref dotnet-actorsnext-tutorial-cart.md >}})
