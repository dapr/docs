import type { dapr_grpc as services } from 'dapr-client' // eslint-disable-line no-unused-vars
import { dapr_pb as messages } from 'dapr-client'
import { promisify, TextDecoder } from 'util'
import { Any } from 'google-protobuf/google/protobuf/any_pb'

export class DaprGrpcHelper {
  private client: services.DaprClient
  private promPublishEvent: (request: messages.PublishEventEnvelope) => any
  private promSaveState: (request: messages.SaveStateEnvelope) => any
  private promGetState: (request: messages.GetStateEnvelope) => any
  private promDeleteState: (request: messages.DeleteStateEnvelope) => any

  constructor (client: services.DaprClient) {
    this.client = client

    this.promPublishEvent = promisify(client.publishEvent).bind(client)
    this.promSaveState = promisify(client.saveState).bind(client)
    this.promGetState = promisify(client.getState).bind(client)
    this.promDeleteState = promisify(client.deleteState).bind(client)
  }

  async publishEvent (topic: string, value: string) {
    const event = new messages.PublishEventEnvelope()
    event.setTopic(topic)
    const data = new Any()
    data.setValue(Buffer.from(value))
    event.setData(data)
    return await this.promPublishEvent(event)
  }

  async saveState (key: string, storeName: string, value: string) {
    const state = new messages.SaveStateEnvelope()
    state.setStoreName(storeName)
    const req = new messages.StateRequest()
    req.setKey(key)
    const valuePb = new Any()
    valuePb.setValue(Buffer.from(value))
    req.setValue(valuePb)
    state.addRequests(req)
    return this.promSaveState(state)
  }

  async getState (key: string, storeName: string) : Promise<string|undefined> {
    const get = new messages.GetStateEnvelope()
    get.setStoreName(storeName)
    get.setKey(key)
    const response: messages.GetStateResponseEnvelope = await this.promGetState(get)
    const rawValue = response.getData()?.getValue()
    const decoder = new TextDecoder('utf8')

    if (rawValue === undefined) {
      return undefined
    }

    if (typeof rawValue === 'string') {
      return rawValue
    }

    return decoder.decode(rawValue)
  }

  async deleteState (key: string, storeName: string) {
    const del = new messages.DeleteStateEnvelope()
    del.setStoreName(storeName)
    del.setKey(key)
    return this.promDeleteState(del)
  }
}
