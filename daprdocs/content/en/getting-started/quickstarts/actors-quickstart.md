---
type: docs
title: "Quickstart: Actors"
linkTitle: "Actors"
weight: 75
description: "Get started with Dapr's Actors building block"
---

Let's take a look at Dapr's [Actors building block]({{< ref actors >}}). In this Quickstart, you will run a smart device microservice and a simple console client to demonstrate the stateful object patterns in Dapr Actors.  

Currently, you can experience this actors quickstart using the .NET SDK.

{{< tabs ".NET" >}}

 <!-- .NET -->
{{% codetab %}}

As a quick overview of the .NET actors quickstart:

1. Using a `SmartDevice.Service` microservice, you host:
   - Two `SmartDectectorActor` smoke alarm objects
   - A `ControllerActor` object that commands and controls the smart devices  
1. Using a `SmartDevice.Client` console app, the client app interacts with each actor, or the controller, to perform actions in aggregate. 
1. The `SmartDevice.Interfaces` contains the shared interfaces and data types used by both the service and client apps.

<img src="/images/actors-quickstart/actors-quickstart.png" width=800 style="padding-bottom:15px;">

### Pre-requisites

For this example, you will need:

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [.NET SDK or .NET 6 SDK installed](https://dotnet.microsoft.com/download).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### Step 1: Set up the environment

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/actors).

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
dapr run --app-id actorservice --app-port 5001 --dapr-http-port 3500 --resources-path ../../../resources -- dotnet run --urls=http://localhost:5001/
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
== APP == Sleeping for 16 seconds before checking status again to see reminders fire and clear alarms
== APP == Device 1 state: Location: First Floor, Status: Ready
== APP == Device 2 state: Location: Second Floor, Status: Ready
```

### (Optional) Step 4: View in Zipkin

If you have Zipkin configured for Dapr locally on your machine, you can view the actor's interaction with the client in the Zipkin web UI (typically at `http://localhost:9411/zipkin/`).

<img src="/images/actors-quickstart/actor-client-interaction-zipkin.png" width=800 style="padding-bottom:15px;">


### What happened?

When you ran the client app, a few things happened:

1. Two `SmartDetectorActor` actors were [created in the client application](https://github.com/dapr/quickstarts/blob/master/actors/csharp/sdk/client/Program.cs) and initialized with object state with:
   - `ActorProxy.Create<ISmartDevice>(actorId, actorType)` 
   - `proxySmartDevice.SetDataAsync(data)`  
   
   These objects are re-entrant and hold the state, as shown by `proxySmartDevice.GetDataAsync()`.

   ```csharp
   // Actor Ids and types
   var deviceId1 = "1";
   var deviceId2 = "2";
   var smokeDetectorActorType = "SmokeDetectorActor";
   var controllerActorType = "ControllerActor";
   
   Console.WriteLine("Startup up...");
   
   // An ActorId uniquely identifies the first actor instance for the first device
   var deviceActorId1 = new ActorId(deviceId1);
   
   // Create a new instance of the data class that will be stored in the first actor
   var deviceData1 = new SmartDeviceData(){
       Location = "First Floor",
       Status = "Ready",
   };
   
   // Create the local proxy by using the same interface that the service implements.
   var proxySmartDevice1 = ActorProxy.Create<ISmartDevice>(deviceActorId1, smokeDetectorActorType);
   
   // Now you can use the actor interface to call the actor's methods.
   Console.WriteLine($"Calling SetDataAsync on {smokeDetectorActorType}:{deviceActorId1}...");
   var setDataResponse1 = await proxySmartDevice1.SetDataAsync(deviceData1);
   Console.WriteLine($"Got response: {setDataResponse1}");
   
   Console.WriteLine($"Calling GetDataAsync on {smokeDetectorActorType}:{deviceActorId1}...");
   var storedDeviceData1 = await proxySmartDevice1.GetDataAsync();
   Console.WriteLine($"Device 1 state: {storedDeviceData1}");
   
   // Create a second actor for second device
   var deviceActorId2 = new ActorId(deviceId2);
   
   // Create a new instance of the data class that will be stored in the first actor
   var deviceData2 = new SmartDeviceData(){
       Location = "Second Floor",
       Status = "Ready",
   };
   
   // Create the local proxy by using the same interface that the service implements.
   var proxySmartDevice2 = ActorProxy.Create<ISmartDevice>(deviceActorId2, smokeDetectorActorType);
   
   // Now you can use the actor interface to call the second actor's methods.
   Console.WriteLine($"Calling SetDataAsync on {smokeDetectorActorType}:{deviceActorId2}...");
   var setDataResponse2 = await proxySmartDevice2.SetDataAsync(deviceData2);
   Console.WriteLine($"Got response: {setDataResponse2}");
   
   Console.WriteLine($"Calling GetDataAsync on {smokeDetectorActorType}:{deviceActorId2}...");
   var storedDeviceData2 = await proxySmartDevice2.GetDataAsync();
   Console.WriteLine($"Device 2 state: {storedDeviceData2}");
   ```

1. The [`DetectSmokeAsync` method of `SmartDetectorActor 1` is called](https://github.com/dapr/quickstarts/blob/master/actors/csharp/sdk/service/SmokeDetectorActor.cs#L70).

   ```csharp
    public async Task DetectSmokeAsync()
    {
        var controllerActorId = new ActorId("controller");
        var controllerActorType = "ControllerActor";
        var controllerProxy = ProxyFactory.CreateActorProxy<IController>(controllerActorId, controllerActorType);
        await controllerProxy.TriggerAlarmForAllDetectors();
    }
   ```

1. The [`TriggerAlarmForAllDetectors` method of `ControllerActor` is called](https://github.com/dapr/quickstarts/blob/master/actors/csharp/sdk/service/ControllerActor.cs#L54). The `ControllerActor` internally triggers all alarms when smoke is detected 

    ```csharp 
    public async Task TriggerAlarmForAllDetectors()
    {
        var deviceIds =  await ListRegisteredDeviceIdsAsync();
        foreach (var deviceId in deviceIds)
        {
            var actorId = new ActorId(deviceId);
            var proxySmartDevice = ProxyFactory.CreateActorProxy<ISmartDevice>(actorId, "SmokeDetectorActor");
            await proxySmartDevice.SoundAlarm();
        }

        // Register a reminder to refresh and clear alarm state every 15 seconds
        await this.RegisterReminderAsync("AlarmRefreshReminder", null, TimeSpan.FromSeconds(15), TimeSpan.FromSeconds(15));
    }
    ```
    
    The console [prints a message indicating that smoke has been detected](https://github.com/dapr/quickstarts/blob/master/actors/csharp/sdk/client/Program.cs#L65).

    ```csharp
    // Smoke is detected on device 1 that triggers an alarm on all devices.
    Console.WriteLine($"Detecting smoke on Device 1...");
    proxySmartDevice1 = ActorProxy.Create<ISmartDevice>(deviceActorId1, smokeDetectorActorType);
    await proxySmartDevice1.DetectSmokeAsync();   
    ```

1. The [`SoundAlarm` methods](https://github.com/dapr/quickstarts/blob/master/actors/csharp/sdk/service/SmokeDetectorActor.cs#L78) of `SmartDetectorActor 1` and `2` are called.

   ```csharp
   storedDeviceData1 = await proxySmartDevice1.GetDataAsync();
   Console.WriteLine($"Device 1 state: {storedDeviceData1}");
   storedDeviceData2 = await proxySmartDevice2.GetDataAsync();
   Console.WriteLine($"Device 2 state: {storedDeviceData2}");
   ```

1. The `ControllerActor` also creates a durable reminder to call `ClearAlarm` after 15 seconds using `RegisterReminderAsync`.

   ```csharp
   // Register a reminder to refresh and clear alarm state every 15 seconds
   await this.RegisterReminderAsync("AlarmRefreshReminder", null, TimeSpan.FromSeconds(15), TimeSpan.FromSeconds(15));
   ```

For full context of the sample, take a look at the following code:

- [`SmartDetectorActor.cs`](https://github.com/dapr/quickstarts/blob/master/actors/csharp/sdk/service/SmokeDetectorActor.cs): Implements the smart device actors
- [`ControllerActor.cs`](https://github.com/dapr/quickstarts/blob/master/actors/csharp/sdk/service/ControllerActor.cs): Implements the controller actor that manages all devices
- [`ISmartDevice`](https://github.com/dapr/quickstarts/blob/master/actors/csharp/sdk/interfaces/ISmartDevice.cs): The method definitions and shared data types for each `SmartDetectorActor`
- [`IController`](https://github.com/dapr/quickstarts/blob/master/actors/csharp/sdk/interfaces/IController.cs): The method definitions and shared data types for the `ControllerActor`

{{% /codetab %}}


{{< /tabs >}}

## Tell us what you think!

We're continuously working to improve our Quickstart examples and value your feedback. Did you find this Quickstart helpful? Do you have suggestions for improvement?

Join the discussion in our [discord channel](https://discord.com/channels/778680217417809931/953427615916638238).

## Next steps

Learn more about [the Actor building block]({{< ref actors >}})

{{< button text="Explore Dapr tutorials  >>" page="getting-started/tutorials/_index.md" >}}
