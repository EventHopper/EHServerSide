import { IUser, getUserData } from '../models/users/users.model';
import {REALM_APP_ID as ID} from '../common/utils/config';
import Realm from 'realm';


export async function checkCredentials(email:string, password:string):Promise<any> {
  const app: Realm.App = new Realm.App({id: `${ID}`});
  const userCredentials = Realm.Credentials.emailPassword(email, password);
  let user:any;
  try {
    user = await app.logIn(userCredentials);
  } catch (error) {
    user = null;
  }
  
  if (user!=null) {
    return await getUserData(undefined, email);
  } else {
    return {message : 'invalid username/password',}
  }
};