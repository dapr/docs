# Dapr API reference

This documentation contains the API reference for the Dapr runtime.

Dapr is an open source runtime that provides a set of building blocks for building scalable distributed apps.
Building blocks include pub-sub, state management, bindings, messaging and invocation, actor runtime capabilities, and more.

Dapr aims to provide an open, community driven approach to solving real world problems at scale.

These building blocks are provided in a platform agnostic and language agnostic way over common protocols such as HTTP 1.1/2.0 and gRPC.

### Goals

The goal of the Dapr API reference is to provide a clear understanding of the Dapr runtime API surface and help evolve it for the benefit of developers everywhere.

Any changes/proposals to the Dapr API should adhere to the following:

* Must be platform agnostic
* Must be programming language agnostic
* Must be backward compatible

## Table of Contents

  1. [Service Invocation](service_invocation.md)
  2. [Bindings](bindings.md)
  3. [Pub Sub/Broadcast](pubsub.md)
  4. [State Management](state.md)
  5. [Actors](actors.md)
