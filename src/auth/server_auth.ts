/* eslint-disable no-invalid-this */
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
import Realm from 'realm';
import assert from 'assert';
import {REALM_APP_ID as ID} from '../common/utils/config';

class Auth {
  public app: Realm.App = new Realm.App({id: `${ID}`});
  public authUser!: Realm.User;

  /** 
  * WIP
  */
  public getAccessToken() {
    return this.authUser.accessToken;
  }

  /** 
   * WIP
  */
  public refreshToken() {
    return this.authUser.refreshToken;
  }
  /** 
   * WIP
  */
  // public hasAccessToken() {
  //   if (!this.authUser) {
  //     return false;
  //   }
  //   this.authUser.refreshToken;
  //   return this.authUser != null;
  // }

  /**
  * Logs in a user onto the Realm App via and APIKey.
  * To log in with an API key, create an API Key credential with a server
  * or user API key and pass it to App.logIn()
  * @param {string} apiKey The API key.
  * @return {int} The sum of the two numbers.
  */
  public loginApiKey = async (apiKey: string, returnToken?:boolean) => {
    // Create an API Key credential
    const credentials = Realm.Credentials.serverApiKey(apiKey);

    try {
      // Authenticate the user
      const user: Realm.User = await this.app.logIn(credentials);

      // `App.currentUser` updates to match the logged in user
      assert(user.id === this.app.currentUser!.id);
      this.authUser = user;

      if (returnToken)
        return this.authUser.accessToken;

      return 'AUTH_SUCCESS';
    } catch (err) {
      return 'AUTH_FAILED';
    }
  }

}

export default Auth;
