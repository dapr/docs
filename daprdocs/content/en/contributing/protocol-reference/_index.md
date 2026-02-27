---
type: docs
title: "Protocol Reference"
linkTitle: "Protocol Reference"
weight: 100
description: >
  Low-level technical documentation of the Dapr runtime protocols and internal mechanics for each building block.
---

This section provides a deep dive into the internal workings of the Dapr runtime. It is intended for maintainers, 
contributors, and anyone interested in the low-level implementation details of Dapr's building blocks.

Unlike the user-facing API reference, these documents focus on:
- How the runtime processes requests.
- Internal state transitions.
- Interaction with component interfaces.
- Protocol-level details (gRPC and HTTP).

## Building Blocks

Select a building block to explore its internal protocol and mechanics:

- [Workflow]({{% ref workflow-protocol %}})
