import * as OneSignal from 'onesignal-node'
import * as ServerConfig from '../../common/utils/config'

const appId = String(ServerConfig.variables.services.onesignal.appId)
const apiKey = String(ServerConfig.variables.services.onesignal.apiKey)

// With default options
const client = new OneSignal.Client(appId, apiKey)

export function sendNotification(
  title: string,
  message: string,
  target_user_ids: string[],
) {
  client.createNotification({
    headings: { en: title },
    contents: { en: message },
    include_external_user_ids: target_user_ids,  
    small_icon: '@mipmap/ic_launcher',
  })
}
