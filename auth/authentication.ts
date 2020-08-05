/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
import Realm from 'realm';
import assert from 'assert';
import {REALM_APP_ID as ID} from '../common/utils/config';

class Auth {
   private app:Realm.App = new Realm.App({id: `${ID}`});
   public authUser:Realm.User;

   constructor() {
     this.authUser = new Realm.User();
   }
   /**
 * Logs in a user onto the Realm App via and APIKey.
 * To log in with an API key, create an API Key credential with a server
 * or user API key and pass it to App.logIn()
 * @param {string} apiKey The API key.
 * @return {int} The sum of the two numbers.
 */
   public async loginApiKey(apiKey: string) {
     // Create an API Key credential
     console.log('hi');
     const credentials = Realm.Credentials.serverApiKey(apiKey);

     try {
       // Authenticate the user
       const user: Realm.User = await this.app.logIn(credentials);

       // `App.currentUser` updates to match the logged in user
       assert(user.id === this.app.currentUser!.id);
       this.authUser = user;
       return this.authUser;
     } catch (err) {
       console.error('Failed to log in', err);
       return null;
     }
   }
}

export default Auth;
