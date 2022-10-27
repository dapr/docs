---
type: docs
title: "Workflow scenarios"
linkTitle: "Workflow scenarios"
weight: 4000
description: Review examples of implementing the workflow API in your project
---

See how Dapr's workflow API works in three real-world scenarios. 

## Example 1: Bank transaction

In this example, the workflow is implemented as a JavaScript generator function. 

The `"bank1"` and `"bank2"` parameters are microservice apps that use Dapr, each of which expose `"withdraw"` and `"deposit"` APIs. 

The Dapr APIs available to the workflow come from the context parameter object and return a "task", which effectively the same as a promise. Calling yield on the task causes the workflow to:

- Durably checkpoint its progress
- Wait until Dapr responds with the output of the service method. 

The value of the task is the service invocation result. If any service method call fails with an error, the error is surfaced as a raised JavaScript error that can be caught using normal try/catch syntax. This code can also be debugged using a Node.js debugger.


```js
import { DaprWorkflowClient, DaprWorkflowContext, HttpMethod } from "dapr-client"; 

const daprHost = process.env.DAPR_HOST || "127.0.0.1"; // Dapr sidecar host 

const daprPort = process.env.DAPR_WF_PORT || "50001";  // Dapr sidecar port for workflow 

const workflowClient = new DaprWorkflowClient(daprHost, daprPort); 

// Funds transfer workflow which receives a context object from Dapr and an input 
workflowClient.addWorkflow('transfer-funds-workflow', function*(context: DaprWorkflowContext, op: any) { 
    // use built-in methods for generating psuedo-random data in a workflow-safe way 
    const transactionId = context.createV5uuid(); 

    // try to withdraw funds from the source account. 
    const success = yield context.invoker.invoke("bank1", "withdraw", HttpMethod.POST, { 
        srcAccount: op.srcAccount, 
        amount: op.amount, 
        transactionId 
    }); 

    if (!success.success) { 
        return "Insufficient funds"; 
    } 

    try { 
        // attempt to deposit into the dest account, which is part of a separate microservice app 
        yield context.invoker.invoke("bank2", "deposit", HttpMethod.POST, {
            destAccount: op.destAccount, 
            amount: op.amount, 
            transactionId 
        }); 
        return "success"; 
    } catch { 
        // compensate for failures by returning the funds to the original account 
        yield context.invoker.invoke("bank1", "deposit", HttpMethod.POST, { 
            destAccount: op.srcAccount, 
            amount: op.amount, 
            transactionId 
        }); 
        return "failure"; 
    } 
}); 

// Call start() to start processing workflow events 
workflowClient.start(); 
```

{{% alert title="Note" color="primary" %}}
The details around how code is written will vary depending on the language. For example, a C# SDK would allow developers to use async/await instead of yield. Regardless, the core capabilities will be the same across all languages.
{{% /alert %}}

## Example 2: Phone verification

This example demonstrates building an SMS phone verification workflow. The workflow:

- Receives some user’s phone number
- Creates a challenge code
- Delivers the challenge code to the user’s SMS number
- Waits for the user to respond with the correct challenge code

The important takeaway in this example is that the end-to-end workflow can be represented as a single, easy-to-understand function. Rather than relying on actors to hold state explicitly, state (such as the challenge code) can simply be stored in local variables, drastically reducing the overall code complexity and making the solution easily unit-testable.

```js
import { DaprWorkflowClient, DaprWorkflowContext, HttpMethod } from "dapr-client"; 

const daprHost = process.env.DAPR_HOST || "127.0.0.1"; // Dapr sidecar host 
const daprPort = process.env.DAPR_WF_PORT || "50001";  // Dapr sidecar port for workflow 
const workflowClient = new DaprWorkflowClient(daprHost, daprPort); 

// Phone number verification workflow which receives a context object from Dapr and an input 
workflowClient.addWorkflow('phone-verification', function*(context: DaprWorkflowContext, phoneNumber: string) { 

    // Create a challenge code and send a notification to the user's phone 
    const challengeCode = yield context.invoker.invoke("authService", "createSmsChallenge", HttpMethod.POST, { 
        phoneNumber 
    }); 

    // Schedule a durable timer for some future date (e.g. 5 minutes or perhaps even 24 hours from now) 
    const expirationTimer = context.createTimer(challengeCode.expiration); 

    // The user gets three tries to respond with the right challenge code 
    let authenticated = false; 

    for (let i = 0; i <= 3; i++) { 
        // subscribe to the event representing the user challenge response 
        const responseTask = context.pubsub.subscribeOnce("my-pubsub-component", "sms-challenge-topic"); 

        // block the workflow until either the timeout expires or we get a response event 
        const winner = yield context.whenAny([expirationTimer, responseTask]); 

        if (winner === expirationTimer) { 
            break; // timeout expired 
        } 

        // we get a pubsub event with the user's SMS challenge response 
        if (responseTask.result.data.challengeNumber === challengeCode.number) { 
            authenticated = true; // challenge verified! 
            expirationTimer.cancel(); 
            break; 
        } 
    } 

    // the return value is available as part of the workflow status. Alternatively, we could send a notification. 
    return authenticated; 
}); 

// Call listen() to start processing workflow events 
workflowClient.listen(); 
```

## Example 3: Declarative workflow for monitoring patient vitals

The following is an example of a very simple SLWF workflow definition that:

- Listens on three different event types
- Invokes a function depending on which event was received

```json
{ 
    "id": "monitorPatientVitalsWorkflow", 
    "version": "1.0", 
    "name": "Monitor Patient Vitals Workflow", 
    "states": [ 
      { 
        "name": "Monitor Vitals", 
        "type": "event", 
        "onEvents": [ 
          { 
            "eventRefs": [ 
              "High Body Temp Event", 
              "High Blood Pressure Event" 
            ], 
            "actions": [{"functionRef": "Invoke Dispatch Nurse Function"}] 
          }, 
          { 
            "eventRefs": ["High Respiration Rate Event"], 
            "actions": [{"functionRef": "Invoke Dispatch Pulmonologist Function"}] 
          } 
        ], 
        "end": true 
      } 
    ], 
    "functions": "file://my/services/asyncapipatientservicedefs.json", 
    "events": "file://my/events/patientcloudeventsdefs.yml" 
} 
```

The functions defined in this workflow map to Dapr service invocation calls. Similarly, the events map to incoming Dapr pub/sub events. 

Behind the scenes, the runtime (which is built using the Dapr SDK APIs) handles the communication with the Dapr sidecar, which, in turn, manages the checkpointing of state and recovery semantics for the workflows.

## Next steps

- [Learn how to implement the workflow API in your own project]({{< ref howto-workflow.md >}})