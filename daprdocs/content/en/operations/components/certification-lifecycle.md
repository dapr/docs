---
type: docs
title: "Certification lifecycle"
linkTitle: "Certification lifecycle"
weight: 200
description: "The component certification lifecycle from submission to production ready"
---

## Overview

Dapr uses a modular design where functionality is delivered as a component. Each component has an interface definition.  All of the components are pluggable so that in ideal scenarios, you can swap out one component with the same interface for another. Each component that is used in production, needs to maintain a certain set of technical requirements that ensure the functional compatibility and robustness of the component.

In general a component needs to be:
- compliant with the defined Dapr interfaces
- functionally correct and robust
- well documented and maintained

To make sure a component conforms to the standards set by Dapr, there are a set of tests run against a component in a Dapr maintainers managed environment. Once the tests pass consistently, the maturity level can be determined for a component.

## Certification levels

The levels are as follows:
- [Alpha](#alpha)
- [Beta](#beta)
- [Stable](#stable)

### Alpha

- The component implements the required interface and works as described in the specification
- The component has documentation
- The component might be buggy or might expose bugs on integration
- The component may not pass all conformance tests
- The component may not have conformance tests
- Recommended for only non-business-critical uses because of potential for incompatible changes in subsequent releases

All components start at the Alpha stage.

### Beta

- The component must pass all the component conformance tests defined to satisfy the component specification
- The component conformance tests have been run in a Dapr maintainers managed environment
- The component contains a record of the conformance test result reviewed and approved by Dapr maintainers with specific components-contrib version
- Recommended for only non-business-critical uses because of potential for incompatible changes in subsequent releases

### Stable

- The component must have component [certification tests](#certification-tests) validating functionality and resiliency
- The component is maintained by Dapr maintainers and supported by the community
- The component is well documented and tested
- A maintainer will address component security, core functionality and test issues according to the Dapr support policy and issue a patch release that includes the patched stable component

### Previous Generally Available (GA) components

Any component that was previously certified as GA is allowed into Stable even if the new requirements are not met.

## Conformance tests

Each component in the [components-contrib](https://github.com/dapr/components-contrib) repository needs to adhere to a set of interfaces defined by Dapr. Conformance tests are tests that are run on these component definitions with their associated backing services such that the component is tested to be conformant with the Dapr interface specifications and behavior.

The conformance tests are defined for the following building blocks:

- State store
- Secret store
- Bindings
- Pub/Sub

To understand more about them see the readme [here](https://github.com/dapr/components-contrib/blob/master/tests/conformance/README.md).

### Test requirements

- The tests should validate the functional behavior and robustness of component based on the component specification
- All the details needed to reproduce the tests are added as part of the component conformance test documentation

## Certification tests

Each stable component in the [components-contrib](https://github.com/dapr/components-contrib) repository must have a certification test plan and automated certification tests validating all features supported by the component via Dapr.

Test plan for stable components should include the following scenarios:

- Client reconnection: in case the client library cannot connect to the service for a moment, Dapr sidecar should not require a restart once the service is back online.
- Authentication options: validate the component can authenticate with all the supported options.
- Validate resource provisioning: validate if the component automatically provisions resources on initialization, if applicable.
- All scenarios relevant to the corresponding building block and component.

The test plan must be approved by a Dapr maintainer and be published in a `README.md` file along with the component code.

### Test requirements

- The tests should validate the functional behavior and robustness of the component based on the component specification, reflecting the scenarios from the test plan
- The tests must run successfully as part of the continuous integration of the [components-contrib](https://github.com/dapr/components-contrib) repository


## Component certification process

In order for a component to be certified, tests are run in an environment maintained by the Dapr project.

### New component certification: Alpha->Beta

For a new component requiring a certification change from Alpha to Beta, a request for component certification follows these steps:
- Requestor creates an issue in the [components-contrib](https://github.com/dapr/components-contrib) repository for certification of the component with the current and the new certification levels
- Requestor submits a PR to integrate the component with the defined conformance test suite, if not already included
    - The user details the environment setup in the issue created, so a Dapr maintainer can setup the service in a managed environment
    - After the environment setup is complete, Dapr maintainers review the PR and if approved merges that PR
- Requestor submits a PR in the [docs](https://github.com/dapr/docs) repository, updating the component's certification level

### New component certification: Beta->Stable

For a new component requiring a certification change from Beta to Stable, a request for component certification follows these steps:
- Requestor creates an issue in the [components-contrib](https://github.com/dapr/components-contrib) repository for certification of the component with the current and the new certification levels
- Requestor submits a PR for the test plan as a `README.md` file in the component's source code directory
    - The requestor details the test environment requirements in the created PR, including any manual steps or credentials needed
    - A Dapr maintainer reviews the test plan, provides feedback or approves it, and eventually merges the PR
- Requestor submits a PR for the automated certification tests, including scripts to provision resources when applicable
- After the test environment setup is completed and credentials provisioned, Dapr maintainers review the PR and, if approved, merges the PR
- Requestor submits a PR in the [docs](https://github.com/dapr/docs) repository, updating the component's certification level
