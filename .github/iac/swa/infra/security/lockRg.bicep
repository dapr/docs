resource createRgLock 'Microsoft.Authorization/locks@2016-09-01' = {
  name: 'rgLock'
  properties: {
    level: 'do-not-delete'
    notes: 'Resource group and its resources should not be deleted because it contains live OSS website.'
  }
}
