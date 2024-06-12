---
type: docs
title: "Namespaced actors"
linkTitle: "Namespaced actors"
weight: 40
description: "Learn about the multi-tenant placement service in actors"
---

Namespaced actors use the multi-tenant placement service. With this service, in a scenario where each tenant has its own namespace, sidecars belonging to a tenant named "Tenant A" won't receive placement information for "Tenant B". 

<img src="/images/multi-tenancy-overview.png" width=900>

In order for multiple tenants to have actor types and/or IDs with the same name, every namespace should have its own state store. Otherwise, apps in different namespaces with the same actor type and/or ID may overwrite each other's data in the state store.

## Example

In the following example...

<!-- need example? ok to use from placement API? --> 

## Migrating data to a new namespace

If you're moving to a new namespace and starting to use a new state store, make sure you migrate your data.

## Backwards compatibilty

Namespaced actors are backwards compatible for deployments that use mTLS, because the sidecar's namespace is inferred from the Spiffe ID, allowing for multi-tenancy out-of-the-box.

<img src="/images/namespaced-actors-with-mtls.png" width=900>

### Without mTLS enabled

If you haven't enabled mTLS, sidecars A and B won't have information about the actor types hosted on sidecar C. In namespace Y, sidecar D won't have information about the actor types hosted on sidecars E and F.

Sidecars C, E, and F, however, can see each other’s actor-types. 

<img src="/images/namespaced-actors-without-mtls.png" width=900>

For pre-v1.14 sidecars that don't use mTLS, the placement service uses a special “empty” namespace. When these sidecars connect to a new placement service, they only get the actor types hosted on other pre-v1.14 sidecars in the empty namespace that are not on mTLS.

<img src="/images/empty-namespace.png" width=900>

{{% alert title="Important" color="warning" %}}
If you’re not using mTLS, make sure you have a uniform version per namespace. Either upgrade all sidecars in a namespace or none.
{{% /alert %}}

## Next steps
- [Learn more about the Dapr placement service]({{< ref placement.md >}})
- [Placement API reference guide]({{< ref placement_api.md >}})