/* eslint-disable no-unused-vars */
/* eslint-disable no-invalid-this */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

import Auth from '../../auth/server_auth';
import assert from 'assert';
import Realm from 'realm';
import { json } from 'body-parser';
import Debug from 'debug';
const debug = Debug('users.realm.functions');
/**
 * @deprecated RealmFunctions class may soon be deprecated following decision to move
 * user authentication to the client-side. Some functions may still persist.
 */
class RealmFunctions {
  private _auth: Auth;

  constructor(auth: Auth) {
    console.warn(`Some functions in the RealmFunctions class may soon be deprecated 
      following decision to move user authentication to the client-side. 
      Some functions may still persist.`);
    this._auth = auth;
  }

  public registerUser = async (email: string, password: string) => {
    if (password.length < 6 || password.length > 127) {
      return {
        message: 'password must be between 6 and 128 chars long',
        code: 13,
        userInstance: null
      };
    }
    let result;
    let success = true;
    await this._auth.app.emailPasswordAuth
      .registerUser(email, password)
      .catch((err) => {
        if (err) {
          debug(err);
          success = false;
          result = {
            message: err.message,
            code: err.code,
            userInstance: null
          };;
        }
      });
    if (success) {
      return result;
    } else {
      return result;
    }
  };

  // public resendConfirmationEmail = async (email: string) => {
  //   return await this._auth.app.emailPasswordAuth.resendConfirmationEmail(
  //     email
  //   );
  // };

  // public sendPasswordResetEmail = async (email: string) => {
  //   return await this._auth.app.emailPasswordAuth.sendResetPasswordEmail(email);
  // };

  // public logIn = async (email: string, password: string) => {
  //   const credentials = Realm.Credentials.emailPassword(email, password);
  //   let result;
  //   await this._auth.app.logIn(credentials).then((user) => {
  //     result = {
  //       message: `LOGIN_SUCCESS: {userID: ${user.id}}`,
  //       code: 200,
  //       userInstance: user
  //     };
  //   }).catch((err)=>{
  //     result = {
  //       message: `LOGIN_FAILED: {userID: ${user.id}}`,
  //       code: 200,
  //       userInstance: user
  //     };
  //   });
  //   return result;
  //   //   this._auth.app.switchUser(this._auth.app.currentUser);
  // };

  // Let logged in users log out
  // public logOut = async (userID: string) => {
  //   const currentUser: Realm.User = this._auth.app.allUsers.filter(
  //     (user) => user.id === userID
  //   )[0];
  //   if (currentUser != null) {
  //     await this._auth.app.removeUser(currentUser);
  //     assert(
  //       this._auth.app.allUsers.find(({ id }) => id === currentUser.id) ===
  //         undefined
  //     );
  //   }
  // };
}

export default RealmFunctions;
