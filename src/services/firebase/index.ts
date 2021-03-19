import Debug from 'debug';
import * as admin from 'firebase-admin';
import { IUser } from '../../models/users/users.model';
import * as UserModel from '../../models/users/users.model';
import * as ServerConfig from '../../common/utils/config';

const debug = Debug('firebase.admin.service');

admin.initializeApp({
  credential: admin.credential.cert(ServerConfig.variables.services.firebase.serviceAccountObject as admin.ServiceAccount)
});
class FirebaseFunctions {

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
  let userRecordTemp:any;
  await admin
    .auth()
    .createUser({
      email: `${email}`,
      emailVerified: true,
      password: `${password}`,
      disabled: false,
    }).then((userRecord) => {
      // See the UserRecord reference doc for the contents of userRecord.
      userRecordTemp = userRecord;
    })
    .catch((error) => {
      if (error) {
        debug(error);
        success = false;
        result = {
          message: `An error occured: ${error}`,
          code: error,
          userID: null
        };;
      }
    });

  if (success) {
    result = {message: 'Successfully created new user', code: 10, userID: userRecordTemp.uid};
    console.log('Successfully created new user:', userRecordTemp.uid);
  }
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
        result = {status: 500, data: {uid: null, userData: null}, message : `Could not delete account due to error: ${error['message']}`,};
        return result;
      });
  } else {
    result = {message : 'Could not delete account due to error', status: 500};
  }
  return result;
}

public verififyIdToken = async (tokenID: string) => {
  let result:any;
  let uid:string = tokenID;
  result = await admin
    .auth()
    .verifyIdToken(tokenID)
    .then((decodedToken) => {
      uid = decodedToken.uid;
      console.log('uid: ' + uid);
      return uid;
    })
    .catch((error) => {
      console.log('verifyid error is: ' + error);
      return null;
    });
  return result;
}

}

export default FirebaseFunctions;
