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
- [General availability (GA)](#general-availability-ga)

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

### General Availability (GA)

- Has at least two different users using the component in production
- A GA component has a maintainer in the Dapr community or the Dapr maintainers
- The component is well documented, tested and maintained across multiple versions of components-contrib repo

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

## Component certification process

### New component certification: Alpha->Beta or Beta->GA

For a new component a request for component certification follows these steps. This applies for either certifying a component going from Beta from Alpha or GA from Beta.
- An issue is created with a request for certification of the component with the current and the new certification levels
- A user of a component user submits a PR for integrating the component to run with the defined conformance test suite
- The user details the environment setup in the issue created, so that a Dapr maintainer can setup the service in a managed environment
- After the environment setup is complete, Dapr maintainers review the PR and if approved merges that PR
- Dapr maintainers review functional correctness with the test being run in a Dapr team maintained environment
- Dapr maintainers update the component status document categorized by Dapr Runtime version. This is done as part of the release process in the next release of Dapr runtime

### Existing GA certified component

For an existing GA certified component:
- If there only internal method (not interface methods) signature changes but the behavior has not changed (for example adding new logging), then there is no need to re-certify the component

- The component need to be recertified in these scenarios:
  - If the component has bug fixes or feature improvements
  - If there are dependency changes. For example a different or update version of Redis client is used
  - If the component needs to be certified with a new version of backing service it integrates with. For example Kafka broker version is updated
- For recertification the tests are run for the component with the new versions of the client and/or the backing service and results verified
- The new component certification process is followed in these scenarios:
  - If the behavior of the component is changing resulting in a version update of the component
  - If there are breaking changes in terms of function signature/interface changes

For a component to be certified tests are run in an environment maintaine by the Dapr team.
