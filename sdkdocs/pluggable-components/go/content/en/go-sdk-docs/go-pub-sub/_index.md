---
type: docs
title: "Implementing a Go pub/sub component"
linkTitle: "Pub/sub"
weight: 1000
description: How to create a pub/sub component with the Dapr pluggable components Go SDK
no_list: true
is_preview: true
---

Creating a pub/sub component requires just a few basic steps.

## Import pub/sub packages

Create the file `components/pubsub.go` and add `import` statements for the pub/sub related packages.

```go
package components

import (
	"context"
	"github.com/dapr/components-contrib/pubsub"
)
```

## Implement the `PubSub` interface

Create a type that implements the `PubSub` interface.

```go
type MyPubSubComponent struct {
}

func (component *MyPubSubComponent) Init(metadata pubsub.Metadata) error {
	// Called to initialize the component with its configured metadata...
}

func (component *MyPubSubComponent) Close() error {
    // Not used with pluggable components...
	return nil
}

func (component *MyPubSubComponent) Features() []pubsub.Feature {
	// Return a list of features supported by the component...
}

func (component *MyPubSubComponent) Publish(req *pubsub.PublishRequest) error {
	// Send the message to the "topic"...
}

func (component *MyPubSubComponent) Subscribe(ctx context.Context, req pubsub.SubscribeRequest, handler pubsub.Handler) error {
	// Until canceled, check the topic for messages and deliver them to the Dapr runtime...
}
```

Calls to the `Subscribe()` method are expected to set up a long-lived mechanism for retrieving messages but immediately return `nil` (or an error, if that mechanism could not be set up). The mechanism should end when canceled (for example, via the `ctx.Done()` or `ctx.Err() != nil`). The "topic" from which messages should be pulled is passed via the `req` argument, while the delivery to the Dapr runtime is performed via the `handler` callback. The callback doesn't return until the application (served by the Dapr runtime) acknowledges processing of the message.

```go
func (component *MyPubSubComponent) Subscribe(ctx context.Context, req pubsub.SubscribeRequest, handler pubsub.Handler) error {
	go func() {
		for {
			err := ctx.Err()

			if err != nil {
				return
			}
	
			messages := // Poll for messages...

            for _, message := range messages {
                handler(ctx, &pubsub.NewMessage{
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

## Register pub/sub component

In the main application file (for example, `main.go`), register the pub/sub component with the application.

```go
package main

import (
	"example/components"
	dapr "github.com/dapr-sandbox/components-go-sdk"
	"github.com/dapr-sandbox/components-go-sdk/pubsub/v1"
)

func main() {
	dapr.Register("<socket name>", dapr.WithPubSub(func() pubsub.PubSub {
		return &components.MyPubSubComponent{}
	}))

	dapr.MustRun()
}
```

## Next steps
- [Advanced techniques with the pluggable components Go SDK]({{% ref go-advanced %}})
- Learn more about implementing:
  - [Bindings]({{% ref go-bindings %}})
  - [State]({{% ref go-state-store %}})
