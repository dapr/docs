# Setting up an Azure Event Hubs Binding

## Setting up the Event Hub
- Go to portal.azure.com
- In the search box at the top, type "Event Hubs", select "Event Hubs" from the drop down, and press enter.
- Press the `+ Add` button to create a namespace.  In the next window, fill in the boxes then press create.
- After your namespace is created, click on it.  Then in the middle, click on `+ Event Hub`.
- In the next window, give it a name.
- Change the "Capture" value to "On" which will expand additional options.
- For the "Azure Storage Container" box, enter your container name.  If you haven't created a container yet, create one through the first part of the instructions [here](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-portal#create-a-container)


## Creating a binding
Follow the instructions [here](https://github.com/dapr/docs/blob/master/reference/specs/bindings/eventhubs.md) to create a ymal.

To get the values to use:

To get the `connectionString`:
- Nagivate to the namespace you created.  In the left pane, select "Shared Access poliices"
- Click Add, give it a policy name
- When finished, click on the policy itself to show the "Connection string-primary key".  Copy this and use it as the value of `connectionString` in the yaml.

For `consumerGroup`, use "$Default" unless you specified it.

For the other 3 values, you can get them from the storage account/container you created.
