---
type: docs
title: "Certification lifecycle"
linkTitle: "Certification lifecycle"
weight: 200
description: "The certification lifecycle of the different components available in Dapr"
---

## Overview

Dapr uses a modular design where functionality is delivered as a component. Each component has an interface definition.  All of the components are pluggable so that in ideal scenarios, you can swap out one component with the same interface for another. Each component that is used in production, needs to matain a certain set of technical requirements that ensure the functional compatibility and robustness of the component.

In general a component needs to be: 
- compliant with the defined Dapr interfaces 
- functionally correct and robust
- well documented and maintained

To make sure a component conforms to the standards set by Dapr, there are a set of tests run against a component in a Dapr maintainers managed environment. Once the tests pass consistently for a certain number of runs, the maturity level can be determined for a component. 

## Certification levels 

The proposed levels are as follows:
- [Alpha](#alpha)
- [Beta](#beta)
- [General availability (GA)](#general-availability-ga)

### Alpha

- Component implements the required interface and works as described in the specification
- Component has documentation
- Component might be buggy or might expose bugs on integration
- Component may not pass all conformance tests
- Component may not have conformance tests
- Not recommended for use in production

All components generally start at the Alpha stage.

### Beta

- Component must pass all the component conformance tests defined to satisfy the component specification
- The component conformance tests have been run in a Dapr maintainers managed environment
- Component contains a record of the conformance test result reviewed and approved by Dapr maintainers with specific components-contrib version
- Not recommended for use in production

### General Availability (GA)

- Has at least two different users in production
- A GA component has a defined maintainer in the Dapr community or the Dapr maintainers
- Component is well documented, tested and maintained across multiple versions of components-contrib repo

## Conformance tests 

Each component in the [components-contrib](https://github.com/dapr/components-contrib) repository needs to adhere to a set of interfaces defined by Dapr. Conformance tests are tests that are run on these component definitions with their associated backing services such that the component is tested to be conformant with the Dapr interface specifications. 

The conformance tests are defined for the following building blocks: 

- State store
- Secret store
- Bindings 
- Pub/Sub

To know more about them please see the readme [here](https://github.com/dapr/components-contrib/blob/master/tests/conformance/README.md).

### Test requirements

- The tests should validate the functional behavior and robustness of component based on the component specification
- All the details needed to reproduce the tests will be added as part of the component conformance test documentation

## Component certification process

### New component certification

For a new component a request for component certification follows these steps:
- This applies for either certifying a component as Beta from Alpha or GA from Beta stages
- An issue is created with a request for certification of the component with the current and the new certification levels
- The component owner/maintainer submits a PR for integrating the component to run with the defined conformance test suite
- The component owner/maintainer details the environment setup in the issue created, so that a Dapr maintainer can setup the service in a managed environment
- After the environment setup is complete, Dapr matainers review the PR and if approved merges that PR
- Dapr maintainers review functional correctness with the test being run in a Dapr team maintained environment
- Dapr maintainers update component status document categorized by Dapr Runtime version, this will be done as part of the release process in the following release of Dapr runtime

### Existing GA certified component

For an existing GA certified component:
- If there only internal method (not interface methods) signature changes but the behavior has not changed eg: adding logging, then there is no need to re-certify the component
- The component need to be recertified in these scenarios:
  - if there are dependency changes, eg: version of redis client used
  - if the component needs to be certified with a new version of backing service
- For recertification the tests are run for the component with the new versions of the client and/or the backing service and results verified
- The new component certification process is followed in these scenarios:
  - if the behavior of the component is changing
  - if there are breaking changes in terms of function signature/interface changes

For a component to be certified tests will be run in a Dapr team maintained environment.