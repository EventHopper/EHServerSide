import { sendNotification } from '../../services/onesignal';
import * as UserModel from '../../models/users/users.model';

export class NotificationHandler {

  public static async sendFriendRequestNotification(from_user_id:string, to_user_id:string)  {
    const doc = await UserModel.getUserData(undefined,undefined,from_user_id);
    const user_alias = String(doc.username);
    sendNotification(`@${user_alias} has sent you a friend request`,  'Open app to respond', [to_user_id]);
  }
  
  public static async acceptFriendRequestNotification(from_user_id:string, to_user_id:string) {
    const doc = await UserModel.getUserData(undefined,undefined, from_user_id);
    const user_alias = String(doc.username);
    sendNotification(`@${user_alias} has accepted your friend request`,  'You may now invite each other to events!', [to_user_id]);
  }
  
  
}