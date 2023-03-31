---
type: docs
title: "Quickstart: Actors"
linkTitle: "Actors"
weight: 75
description: "Get started with Dapr's Actors building block"
---

Let's take a look at Dapr's [Actors building block]({{< ref actors >}}). In this Quickstart, you will run a `SmartDevice.Service` microservice and a simple console client to demonstrate the stateful object patterns in Dapr Actors.  
1. Using a `SmartDevice.Service` microservice, you can host:
   - Two `SmartDectectorActor` smoke alarm objects
   - A `ControllerActor` object that commands and controls the smart devices  
1. Using a `SmartDevice.Client` console app, the client app interacts with each actor, or the controller, to perform actions in aggregate. 
1. The `SmartDevice.Interfaces` contains the shared interfaces and data types used by both the service and client apps.

<img src="/images/bindings-quickstart/bindings-quickstart.png" width=800 style="padding-bottom:15px;">

Select your preferred language-specific Dapr SDK before proceeding with the Quickstart.

{{< tabs ".NET" >}}
 <!-- .NET -->
{{% codetab %}}

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [.NET SDK or .NET 6 SDK installed](https://dotnet.microsoft.com/download).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 1: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/bindings).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Run the service app

In a new terminal window, navigate to the `actors/csharp/sdk/service` directory and restore dependencies:

```bash
cd actors/csharp/sdk/service
dotnet build
```

Run the `SmartDevice.Service`, which will start service itself and the Dapr sidecar:

```bash
dapr run --app-id actorservice --app-port 5001 --dapr-http-port 3500 --components-path ../../../resources -- dotnet run --urls=http://localhost:5001/
```

Expected output:

```bash
== APP == info: Microsoft.AspNetCore.Hosting.Diagnostics[1]
== APP ==       Request starting HTTP/1.1 GET http://127.0.0.1:5001/healthz - -
== APP == info: Microsoft.AspNetCore.Routing.EndpointMiddleware[0]
== APP ==       Executing endpoint 'Dapr Actors Health Check'
== APP == info: Microsoft.AspNetCore.Routing.EndpointMiddleware[1]
== APP ==       Executed endpoint 'Dapr Actors Health Check'
== APP == info: Microsoft.AspNetCore.Hosting.Diagnostics[2]
== APP ==       Request finished HTTP/1.1 GET http://127.0.0.1:5001/healthz - - - 200 - text/plain 5.2599ms
```

### Step 3: Run the client app

In a new terminal instance, navigate to the `actors/csharp/sdk/client` directory and install the dependencies:

```bash
cd ./actors/csharp/sdk/client
dotnet build
```

Run the `SmartDevice.Client` app:

```bash
dapr run --app-id actorclient -- dotnet run
```

Expected output:

```bash
== APP == Startup up...
== APP == Calling SetDataAsync on SmokeDetectorActor:1...
== APP == Got response: Success
== APP == Calling GetDataAsync on SmokeDetectorActor:1...
== APP == Device 1 state: Location: First Floor, Status: Ready
== APP == Calling SetDataAsync on SmokeDetectorActor:2...
== APP == Got response: Success
== APP == Calling GetDataAsync on SmokeDetectorActor:2...
== APP == Device 2 state: Location: Second Floor, Status: Ready
== APP == Registering the IDs of both Devices...
== APP == Registered devices: 1, 2
== APP == Detecting smoke on Device 1...
== APP == Device 1 state: Location: First Floor, Status: Alarm
== APP == Device 2 state: Location: Second Floor, Status: Alarm
```

### What happened

When you ran the client app:

1. A `SmartDetectorActor` is created with these properties: Id = 1, Location = "First Floor", Status = "Ready".
2. Another `SmartDetectorActor` is created with these properties: Id = 2, Location = "Second Floor", Status = "Ready".
3. The status of `SmartDetectorActor` 1 is read and printed to the console.
4. The status of `SmartDetectorActor` 2 is read and printed to the console.
5. The `DetectSmokeAsync` method of `SmartDetectorActor` 1 is called.
6. The `TriggerAlarmForAllDetectors` method of `ControllerActor` is called.
7. The `SoundAlarm` method of `SmartDetectorActor` 1 is called.
8. The `SoundAlarm` method of `SmartDetectorActor` 2 is called.
9. The status of `SmartDetectorActor` 1 is read and printed to the console.
10. The status of `SmartDetectorActor` 2 is read and printed to the console.

Looking at the code, `SmartDetectorActor` objects are created in the client application and initialized with object state with `ActorProxy.Create<ISmartDevice>(actorId, actorType)` and then `proxySmartDevice.SetDataAsync(data)`.  These objects are re-entrant and will hold on to the state as shown by `proxySmartDevice.GetDataAsync()`.

```csharp
        // Actor Ids and types
        var deviceId1 = "1";
        var deviceId2 = "2";
        var smokeDetectorActorType = "SmokeDetectorActor";
        var controllerActorType = "ControllerActor";
        Console.WriteLine("Startup up...");
        // An ActorId uniquely identifies an actor instance
        var deviceActorId1 = new ActorId(deviceId1);
        // Create the local proxy by using the same interface that the service implements.
        // You need to provide the type and id so the actor can be located. 
        // If the actor matching this id does not exist, it will be created
        var proxySmartDevice1 = ActorProxy.Create<ISmartDevice>(deviceActorId1, smokeDetectorActorType);
        // Create a new instance of the data class that will be stored in the actor
        var deviceData1 = new SmartDeviceData(){
            Location = "First Floor",
            Status = "Ready",
        };
        // Now you can use the actor interface to call the actor's methods.
        Console.WriteLine($"Calling SetDataAsync on {smokeDetectorActorType}:{deviceActorId1}...");
        var setDataResponse1 = await proxySmartDevice1.SetDataAsync(deviceData1);
        Console.WriteLine($"Got response: {setDataResponse1}");
```

The `ControllerActor` object is used to keep track of the devices and trigger the alarm for all of them.

```csharp
        var controllerActorId = new ActorId("controller");
        var proxyController = ActorProxy.Create<IController>(controllerActorId, controllerActorType);
        Console.WriteLine($"Registering the IDs of both Devices...");
        await proxyController.RegisterDeviceIdsAsync(new string[]{deviceId1, deviceId2});
        var deviceIds = await proxyController.ListRegisteredDeviceIdsAsync();
        Console.WriteLine($"Registered devices: {string.Join(", " , deviceIds)}");
```

Additionally look at:

- `SmartDevice.Service/SmartDetectorActor.cs` which contains the implementation of the the smart device actor actions
- `SmartDevice.Service/ControllerActor.cs` which contains the implementation of the controller actor that manages all devices
- `SmartDevice.Interfaces/ISmartDevice` which contains the required actions and shared data types for each SmartDetectorActor
- `SmartDevice.Interfaces/IController` which contains the actions a controller can perform across all devices


{{% /codetab %}}

{{< /tabs >}}

## Tell us what you think!

We're continuously working to improve our Quickstart examples and value your feedback. Did you find this Quickstart helpful? Do you have suggestions for improvement?

Join the discussion in our [discord channel](https://discord.com/channels/778680217417809931/953427615916638238).

## Next steps

Learn more about [the Actor building block]({{< ref actors >}})

{{< button text="Explore Dapr tutorials  >>" page="getting-started/tutorials/_index.md" >}}
