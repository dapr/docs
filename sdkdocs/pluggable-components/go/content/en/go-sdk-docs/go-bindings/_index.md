---
type: docs
title: "Implementing a Go input/output binding component"
linkTitle: "Bindings"
weight: 1000
description: How to create an input/output binding with the Dapr pluggable components Go SDK
no_list: true
is_preview: true
---

Creating a binding component requires just a few basic steps.

## Import bindings packages

Create the file `components/inputbinding.go` and add `import` statements for the state store related packages.

```go
package components

import (
	"context"
	"github.com/dapr/components-contrib/bindings"
)
```

## Input bindings: Implement the `InputBinding` interface

Create a type that implements the `InputBinding` interface.

```go
type MyInputBindingComponent struct {
}

func (component *MyInputBindingComponent) Init(meta bindings.Metadata) error {
	// Called to initialize the component with its configured metadata...
}

func (component *MyInputBindingComponent) Read(ctx context.Context, handler bindings.Handler) error {
	// Until canceled, check the underlying store for messages and deliver them to the Dapr runtime...
}
```

Calls to the `Read()` method are expected to set up a long-lived mechanism for retrieving messages but immediately return `nil` (or an error, if that mechanism could not be set up). The mechanism should end when canceled (for example, via the `ctx.Done() or ctx.Err() != nil`). As messages are read from the underlying store of the component, they are delivered to the Dapr runtime via the `handler` callback, which does not return until the application (served by the Dapr runtime) acknowledges processing of the message.

```go
func (b *MyInputBindingComponent) Read(ctx context.Context, handler bindings.Handler) error {
	go func() {
		for {
			err := ctx.Err()

			if err != nil {
				return
			}
	
			messages := // Poll for messages...

            for _, message := range messages {
                handler(ctx, &bindings.ReadResponse{
                    // Set the message content...
                })
            }

			select {
				case <-ctx.Done():
				case <-time.After(5 * time.Second):
			} 
		}
	}()

	return nil
}
```

## Output bindings: Implement the `OutputBinding` interface

Create a type that implements the `OutputBinding` interface.

```go
type MyOutputBindingComponent struct {
}

func (component *MyOutputBindingComponent) Init(meta bindings.Metadata) error {
	// Called to initialize the component with its configured metadata...
}

func (component *MyOutputBindingComponent) Invoke(ctx context.Context, req *bindings.InvokeRequest) (*bindings.InvokeResponse, error) {
	// Called to invoke a specific operation...
}

func (component *MyOutputBindingComponent) Operations() []bindings.OperationKind {
	// Called to list the operations that can be invoked.
}
```

## Input and output binding components

A component can be _both_ an input _and_ output binding. Simply implement both interfaces and register the component as both binding types.

## Register binding component

In the main application file (for example, `main.go`), register the binding component with the application.

```go
package main

import (
	"example/components"
	dapr "github.com/dapr-sandbox/components-go-sdk"
	"github.com/dapr-sandbox/components-go-sdk/bindings/v1"
)

func main() {
	// Register an import binding...
	dapr.Register("my-inputbinding", dapr.WithInputBinding(func() bindings.InputBinding {
		return &components.MyInputBindingComponent{}
	}))

	// Register an output binding...
	dapr.Register("my-outputbinding", dapr.WithOutputBinding(func() bindings.OutputBinding {
		return &components.MyOutputBindingComponent{}
	}))

	dapr.MustRun()
}
```

## Next steps
- [Advanced techniques with the pluggable components Go SDK]({{% ref go-advanced %}})
- Learn more about implementing:
  - [State]({{% ref go-state-store %}})
  - [Pub/sub]({{% ref go-pub-sub %}})
