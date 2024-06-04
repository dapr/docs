param name string
param location string = resourceGroup().location
param tags object = {}
param sku string = 'Standard'

@allowed([ 'None', 'SystemAssigned', 'UserAssigned' ])
param identityType string

@description('User assigned identity name')
param identityId string


resource frontend 'Microsoft.Web/staticSites@2022-09-01' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: sku
    tier: sku
  }

  properties: {
    allowConfigFileUpdates: true
    enterpriseGradeCdnStatus: 'Disabled'
  }

  identity: {
    type: identityType
    userAssignedIdentities: { '${identityId}': {} }
  }
}

output name string = frontend.name
