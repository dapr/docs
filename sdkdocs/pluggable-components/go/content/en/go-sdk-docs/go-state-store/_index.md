---
type: docs
title: "Implementing a Go state store component"
linkTitle: "State Store"
weight: 1000
description: How to create a state store with the Dapr pluggable components Go SDK
no_list: true
is_preview: true
---

Creating a state store component requires just a few basic steps.

## Import state store packages

Create the file `components/statestore.go` and add `import` statements for the state store related packages.

```go
package components

import (
	"context"
	"github.com/dapr/components-contrib/state"
)
```

## Implement the `Store` interface

Create a type that implements the `Store` interface.

```go
type MyStateStore struct {
}

func (store *MyStateStore) Init(metadata state.Metadata) error {
	// Called to initialize the component with its configured metadata...
}

func (store *MyStateStore) GetComponentMetadata() map[string]string {
    // Not used with pluggable components...
	return map[string]string{}
}

func (store *MyStateStore) Features() []state.Feature {
	// Return a list of features supported by the state store...
}

func (store *MyStateStore) Delete(ctx context.Context, req *state.DeleteRequest) error {
	// Delete the requested key from the state store...
}

func (store *MyStateStore) Get(ctx context.Context, req *state.GetRequest) (*state.GetResponse, error) {
	// Get the requested key value from the state store, else return an empty response...
}

func (store *MyStateStore) Set(ctx context.Context, req *state.SetRequest) error {
	// Set the requested key to the specified value in the state store...
}

func (store *MyStateStore) BulkGet(ctx context.Context, req []state.GetRequest) (bool, []state.BulkGetResponse, error) {
	// Get the requested key values from the state store...
}

func (store *MyStateStore) BulkDelete(ctx context.Context, req []state.DeleteRequest) error {
	// Delete the requested keys from the state store...
}

func (store *MyStateStore) BulkSet(ctx context.Context, req []state.SetRequest) error {
	// Set the requested keys to their specified values in the state store...
}
```

## Register state store component

In the main application file (for example, `main.go`), register the state store with an application service.

```go
package main

import (
	"example/components"
	dapr "github.com/dapr-sandbox/components-go-sdk"
	"github.com/dapr-sandbox/components-go-sdk/state/v1"
)

func main() {
	dapr.Register("<socket name>", dapr.WithStateStore(func() state.Store {
		return &components.MyStateStoreComponent{}
	}))

	dapr.MustRun()
}
```

## Bulk state stores

While state stores are required to support the [bulk operations]({{% ref "state-management-overview.md#bulk-read-operations" %}}), their implementations sequentially delegate to the individual operation methods.

## Transactional state stores

State stores that intend to support transactions should implement the optional `TransactionalStore` interface. Its `Multi()` method receives a request with a sequence of `delete` and/or `set` operations to be performed within a transaction. The state store should iterate over the sequence and apply each operation.

```go
func (store *MyStateStoreComponent) Multi(ctx context.Context, request *state.TransactionalStateRequest) error {
    // Start transaction...

    for _, operation := range request.Operations {
		switch operation.Operation {
		case state.Delete:
			deleteRequest := operation.Request.(state.DeleteRequest)
			// Process delete request...
		case state.Upsert:
			setRequest := operation.Request.(state.SetRequest)
			// Process set request...
		}
	}

    // End (or rollback) transaction...

	return nil
}
```

## Queryable state stores

State stores that intend to support queries should implement the optional `Querier` interface. Its `Query()` method is passed details about the query, such as the filter(s), result limits, pagination, and sort order(s) of the results. The state store uses those details to generate a set of values to return as part of its response.

```go
func (store *MyStateStoreComponent) Query(ctx context.Context, req *state.QueryRequest) (*state.QueryResponse, error) {
	// Generate and return results...
}
```

## ETag and other semantic error handling

The Dapr runtime has additional handling of certain error conditions resulting from some state store operations. State stores can indicate such conditions by returning specific errors from its operation logic:

| Error | Applicable Operations | Description
|---|---|---|
| `NewETagError(state.ETagInvalid, ...)` | Delete, Set, Bulk Delete, Bulk Set | When an ETag is invalid |
| `NewETagError(state.ETagMismatch, ...)`| Delete, Set, Bulk Delete, Bulk Set | When an ETag does not match an expected value |
| `NewBulkDeleteRowMismatchError(...)` | Bulk Delete | When the number of affected rows does not match the expected rows |

## Next steps
- [Advanced techniques with the pluggable components Go SDK]({{% ref go-advanced %}})
- Learn more about implementing:
  - [Bindings]({{% ref go-bindings %}})
  - [Pub/sub]({{% ref go-pub-sub %}})
