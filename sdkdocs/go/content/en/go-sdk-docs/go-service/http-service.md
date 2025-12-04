---
type: docs
title: "Getting started with the Dapr HTTP Service SDK for Go"
linkTitle: "HTTP Service"
weight: 10000
description: How to get up and running with the Dapr HTTP Service SDK for Go
no_list: true
---

### Prerequisite
Start by importing Dapr Go service/http package:

```go
daprd "github.com/dapr/go-sdk/service/http"
```

### Creating and Starting Service
To create an HTTP Dapr service, first, create a Dapr callback instance with a specific address:

```go
s := daprd.NewService(":8080")
```

Or with address and an existing http.ServeMux in case you want to combine existing server implementations:

```go
mux := http.NewServeMux()
mux.HandleFunc("/", myOtherHandler)
s := daprd.NewServiceWithMux(":8080", mux)
```

Once you create a service instance, you can "attach" to that service any number of event, binding, and service invocation logic handlers as shown below. Onces the logic is defined, you are ready to start the service:

```go
if err := s.Start(); err != nil && err != http.ErrServerClosed {
	log.Fatalf("error: %v", err)
}
```

### Event Handling
To handle events from specific topic you need to add at least one topic event handler before starting the service:

```go
sub := &common.Subscription{
	PubsubName: "messages",
	Topic:      "topic1",
	Route:      "/events",
}
err := s.AddTopicEventHandler(sub, eventHandler)
if err != nil {
	log.Fatalf("error adding topic subscription: %v", err)
}
```

The handler method itself can be any method with the expected signature:

```go
func eventHandler(ctx context.Context, e *common.TopicEvent) (retry bool, err error) {
	log.Printf("event - PubsubName:%s, Topic:%s, ID:%s, Data: %v", e.PubsubName, e.Topic, e.ID, e.Data)
	// do something with the event
	return true, nil
}
```

Optionally, you can use [routing rules](https://docs.dapr.io/developing-applications/building-blocks/pubsub/howto-route-messages/) to send messages to different handlers based on the contents of the CloudEvent.

```go
sub := &common.Subscription{
	PubsubName: "messages",
	Topic:      "topic1",
	Route:      "/important",
	Match:      `event.type == "important"`,
	Priority:   1,
}
err := s.AddTopicEventHandler(sub, importantHandler)
if err != nil {
	log.Fatalf("error adding topic subscription: %v", err)
}
```

You can also create a custom type that implements the `TopicEventSubscriber` interface to handle your events:

```go
type EventHandler struct {
	// any data or references that your event handler needs.
}

func (h *EventHandler) Handle(ctx context.Context, e *common.TopicEvent) (retry bool, err error) {
    log.Printf("event - PubsubName:%s, Topic:%s, ID:%s, Data: %v", e.PubsubName, e.Topic, e.ID, e.Data)
    // do something with the event
    return true, nil
}
```

The `EventHandler` can then be added using the `AddTopicEventSubscriber` method:

```go
sub := &common.Subscription{
    PubsubName: "messages",
    Topic:      "topic1",
}
eventHandler := &EventHandler{
// initialize any fields
}
if err := s.AddTopicEventSubscriber(sub, eventHandler); err != nil {
    log.Fatalf("error adding topic subscription: %v", err)
}
```

### Service Invocation Handler
To handle service invocations you will need to add at least one service invocation handler before starting the service:

```go
if err := s.AddServiceInvocationHandler("/echo", echoHandler); err != nil {
	log.Fatalf("error adding invocation handler: %v", err)
}
```

The handler method itself can be any method with the expected signature:


```go
func echoHandler(ctx context.Context, in *common.InvocationEvent) (out *common.Content, err error) {
	log.Printf("echo - ContentType:%s, Verb:%s, QueryString:%s, %+v", in.ContentType, in.Verb, in.QueryString, string(in.Data))
	// do something with the invocation here 
	out = &common.Content{
		Data:        in.Data,
		ContentType: in.ContentType,
		DataTypeURL: in.DataTypeURL,
	}
	return
}
```

### Binding Invocation Handler

```go
if err := s.AddBindingInvocationHandler("/run", runHandler); err != nil {
	log.Fatalf("error adding binding handler: %v", err)
}
```

The handler method itself can be any method with the expected signature:

```go
func runHandler(ctx context.Context, in *common.BindingEvent) (out []byte, err error) {
	log.Printf("binding - Data:%v, Meta:%v", in.Data, in.Metadata)
	// do something with the invocation here 
	return nil, nil
}
```
## Related links
- [Go SDK Examples](https://github.com/dapr/go-sdk/tree/main/examples)
