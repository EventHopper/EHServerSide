/* eslint-disable no-invalid-this */
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
import Realm from 'realm';
import assert from 'assert';
import {REALM_APP_ID as ID} from '../common/utils/config';

class Auth {
<<<<<<< HEAD
   public app:Realm.App = new Realm.App({id: `${ID}`});
   public authUser!: Realm.User;


   public getInstance():Realm.App {
     return this.app;
   }

   public getAccessToken() {
     //  let realm = new Realm({schema: []});
     //  realm.write
     return this.authUser.accessToken;
   }

   public refreshToken() {
     return this.authUser.refreshToken;
   }

   public hasAccessToken() {
     if (!this.authUser) {
       return false;
     }
     this.authUser.refreshToken;
     return this.authUser != null;
   }

   /**
   * Logs in a user onto the Realm App via and APIKey.
   * To log in with an API key, create an API Key credential with a server
   * or user API key and pass it to App.logIn()
   * @param {string} apiKey The API key.
   * @return {int} The sum of the two numbers.
   */
   public loginApiKey = async (apiKey: string) => {
     // Create an API Key credential
     const credentials = Realm.Credentials.serverApiKey(apiKey);

     try {
       // Authenticate the user
       const user: Realm.User = await this.app.logIn(credentials);

       // `App.currentUser` updates to match the logged in user
       assert(user.id === this.app.currentUser!.id);
       this.authUser = user;
       return 'AUTH_SUCCESS';
     } catch (err) {
       return 'AUTH_FAILED';
     }
   }
=======
  private app: Realm.App = new Realm.App({id: `${ID}`});
  public authUser!: Realm.User;


  public getAccessToken() {
    return this.authUser.accessToken;
  }

  public refreshToken() {
    return this.authUser.refreshToken;
  }

  public hasAccessToken() {
    if (!this.authUser) {
      return false;
    }
    this.authUser.refreshToken;
    return this.authUser != null;
  }

  /**
  * Logs in a user onto the Realm App via and APIKey.
  * To log in with an API key, create an API Key credential with a server
  * or user API key and pass it to App.logIn()
  * @param {string} apiKey The API key.
  * @return {int} The sum of the two numbers.
  */
  public loginApiKey = async (apiKey: string) => {
    // Create an API Key credential
    const credentials = Realm.Credentials.serverApiKey(apiKey);

    try {
      // Authenticate the user
      const user: Realm.User = await this.app.logIn(credentials);

      // `App.currentUser` updates to match the logged in user
      assert(user.id === this.app.currentUser!.id);
      this.authUser = user;
      return 'AUTH_SUCCESS';
    } catch (err) {
      return 'AUTH_FAILED';
    }
  }
>>>>>>> batchema/typescript
}

export default Auth;
