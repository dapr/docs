targetScope = 'subscription'
 
@minLength(1)
@maxLength(64)
@description('Name of the the environment which is used to generate a short unique hash used in all resources.')
param environmentName string
 
@minLength(1)
@description('Primary location for all resources')
@allowed([ 'eastus', 'eastus2', 'westus', 'westus2'])
param location string
 
param resourceGroupName string = ''

param staticWebsiteName string = ''
 
@description('Id of the user or app to assign application roles')
param principalId string = ''

param identityResourceGroupName string = 'dapr-identities'

var abbrs = loadJsonContent('abbreviations.json')
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))
var tags = { 'azd-env-name': environmentName }
 
// Organize resources in a resource group
resource resourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: !empty(resourceGroupName) ? resourceGroupName : '${abbrs.resourcesResourceGroups}${environmentName}'
  location: location
  tags: tags
}

resource identityResourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' existing = {
  name: identityResourceGroupName
}

// load existing user assigned identity
resource  userAssignedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = {
  name: 'dapr-docs-swa-useridentity'
  scope: identityResourceGroup
}

// Create the Static Web App
module staticwebsite 'core/host/staticwebsite.bicep' = {
  scope: resourceGroup
  name: 'website'
  params: {
    name: !empty(staticWebsiteName) ? staticWebsiteName : '${abbrs.webStaticSites}${resourceToken}'
    location: location
    sku: 'Standard'
    identityType: 'UserAssigned'
    identityId: userAssignedIdentity.id
  }
  
}

output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
output AZURE_RESOURCE_GROUP string = resourceGroup.name
 
output AZURE_STATICWEBSITE_NAME string = staticwebsite.outputs.name
output IDENTITY_RESOURCE_ID string = userAssignedIdentity.id
output IDENTITY_RESOURCE_GROUP string = identityResourceGroup.name
