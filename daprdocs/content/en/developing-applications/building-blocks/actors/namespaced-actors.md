---
type: docs
title: "Namespaced actors"
linkTitle: "Namespaced actors"
weight: 40
description: "Learn about the multi-tenant placement service in actors"
---

Namespaced actors use the multi-tenant placement service. For example, sidecars belonging to "Tenant A" don't receive placement information meant for "Tenant B". 

<!-- need diagram --> 

In order for multiple tenants to have actor types and/or IDs with the same name, every namespace should have its own state store. Otherwise, apps in different namespaces with the same actor type and/or ID may overwrite each other's data in the state store.

## Example

In the following example...

<!-- need example? ok to use from placement API? --> 

## Migrating data to a new namespace

If you're moving to a new namespace and starting to use a new state store, make sure you migrate your data.

## Backwards compatibilty

Namespaced actors are backwards compatible, allowing you to block newer sidecar versions from seeing the actor types within older sidecar versions.

Depending on whether mTLS is enabled, the namespace is either:
- Verified through Spiffe ID (mTLS enabled), or
- Accepted as-is (mTLS not enabled)

### With mTLS enabled

Let's say you've enabled mTLS. As soon as the placement server is updated, the sidecars in namespace X (A, B, and C) can see each other’s actor types, and no others. The same is true for sidecars D, E, and F in namespace Y.

<img src="/images/namespaced-actors-with-mtls.png" width=900>

### Without mTLS enabled

If you haven't enabled mTLS, sidecars A and B won't have information about the actor types hosted on sidecar C. In namespace Y, sidecar D won't have information about the actor types hosted on sidecars E and F.

Sidecars C, E, and F, however, can see each other’s actor-types. 

<img src="/images/namespaced-actors-without-mtls.png" width=900>

For older sidecars that don't use mTLS, the placement service uses a special “empty” namespace. When these sidecars connect to a new placement service, they only get the actor types hosted on other old sidecars in the empty namespace that are not on mTLS.

<img src="/images/empty-namespace.png" width=900>

{{% alert title="Important" color="warning" %}}
If you’re not using mTLS, make sure you have a uniform version per namespace. Either upgrade all sidecars in a namespace or none.
{{% /alert %}}

## Next steps
- [Learn more about the Dapr placement service]({{< ref placement.md >}})
- [Placement API reference guide]({{< ref placement_api.md >}})