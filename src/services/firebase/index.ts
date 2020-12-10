import Debug from 'debug';
import * as admin from 'firebase-admin';
import { IUser } from '../../models/users/users.model';
import * as UserModel from '../../models/users/users.model';

const debug = Debug('firebase.admin.service');
var serviceAccount = require('./hopperclient-3194b-firebase-adminsdk-j6r97-d5ff9e857f.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
class FirebaseFunctions {

  constructor(){
   
  }

  

public registerUser = async (email: string, password: string, phoneNumber?: string) => {
  if (password.length < 6 || password.length > 127) {
    return {
      message: 'password must be between 6 and 128 chars long',
      code: 13,
      userID: ''
    };
  }
  let result;
  let success = true;
  await admin
    .auth()
    .createUser({
      email: `${email}`,
      emailVerified: true,
      password: `${password}`,
      disabled: false,
    })
    .then((userRecord) => {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log('Successfully created new user:', userRecord.uid);
      if (success) {
        result = {message: 'success', code: 200, userID: userRecord.uid};
      } 
    })
    .catch((error) => {
      if (error) {
        debug(error);
        success = false;
        result = {
          message: error,
          code: 400,
          userID: null
        };;
      }
    });
  return result;
}

public deleteUserAccount = async (tokenID: string) => {
  let result:any;
  let uid:string = tokenID;
  result =  admin.auth().verifyIdToken(tokenID).then( async (decodedToken)=>{
    uid = decodedToken.uid;
  }).catch((error)=>{
    debug('Error deleting user:', error);
    result = {message : `Could not delete account due to error: ${error['message']}`,};
    return result;
  });
  if (result) {
    const userData:IUser = await UserModel.getUserData(undefined, undefined, uid);
    result = admin
      .auth()
      .deleteUser(uid)
      .then(() => {
        debug('Successfully deleted user');
        result = {message : 'Successfully deleted user', status: 204, data: {uid: uid, userData: userData}};
        return result;
      })
      .catch((error) => {
        debug('Error deleting user:', error);
        result = {status:500, data: {uid: null, userData: null}, message : `Could not delete account due to error: ${error['message']}`,};
        return result;
      });
  } else {
    result = {message : 'Could not delete account due to error', status: 500};
  }
  return result;
}

}

export default FirebaseFunctions;
