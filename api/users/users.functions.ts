/* eslint-disable no-unused-vars */
/* eslint-disable require-jsdoc */
import Auth from '../../auth/server_auth';
import * as UserModel from '../../models/users/users.model';
import RealmFunctions from './users.realm.functions';

class UserFunctions {
  private _auth: Auth;

  constructor(auth: Auth) {
    this._auth = auth;
  }

  public makeFriendRequest(userID: string, targetID: string) {}

  public uploadPhoto() {}

  public updateProfile(data: any) {
    const user_id = data.user_id;
    const updates = {
      fullname: data.fullname,
      username: data.username,
      imageURL: data.imageURL,
      friends: [ String ]
    };
  }
}

export default UserFunctions;
