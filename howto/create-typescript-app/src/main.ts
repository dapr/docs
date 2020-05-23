import { dapr_grpc as services } from 'dapr-client'
import grpc from 'grpc'

import { DaprGrpcHelper } from './dapr-grpc-helper'

const PORT = process.env.DAPR_GRPC_PORT || 50001
const client = new services.DaprClient(`localhost:${PORT}`, grpc.credentials.createInsecure())
const helper = new DaprGrpcHelper(client)

async function publishDemoEvent () {
  await helper.publishEvent('mytopic', 'some text')
  console.log('Published event!')
}

async function storeReadDeleteState () {
  const key = 'mykey'
  const storeName = 'statestore'
  await helper.saveState(key, storeName, 'Some text!')
  console.log('Saved state!')

  const stateValue = await helper.getState(key, storeName)
  console.log(`Got state "${stateValue}"`)

  await helper.deleteState(key, storeName)
  console.log('Deleted state!')
}

(async () => {
  await publishDemoEvent()
  await storeReadDeleteState()
})().catch(err => {
  console.error('Unhandled exception', err)
})
