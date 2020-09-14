import { IUser, getUserData } from '../models/users/users.model';
import {REALM_APP_ID as ID, REALM_NUMERICAL_APP_ID as APP_ID, REALM_PRIVATE_KEY as PRIVATE_KEY, 
  REALM_PUBLIC_KEY as PUBLIC_KEY,  MONGO_PROJECT_ID as PROJECT_ID} from '../common/utils/config';
import Auth from './server_auth';
import Realm from 'realm';
import axios from 'axios';

export async function checkCredentials(email:string, password:string, accessToken?:boolean, byID?:boolean):Promise<any> {
  const app: Realm.App = new Realm.App({id: `${ID}`});
  const userCredentials = Realm.Credentials.emailPassword(email, password);
  let success = true;
  let token = null;
  try {

    let user:Realm.User = await app.logIn(userCredentials);

    if (accessToken) {
      token = user.accessToken;
    }
    if (byID){
      return { userData : await getUserData(undefined, undefined, user.id), token: token, message : 'success'};
    } else {
      return { userData : await getUserData(undefined, email), token: token, message : 'success'};
    }
  } catch (error) {
    return {message : `Could not delete account due to error: ${error['message']}`,}
  }
};

export async function deleteUserAccount(email:string, password:string) {

  const responseObject = (await checkCredentials(email, password, true));
  let accessToken = responseObject.token;
  const uid = responseObject.userData.user_id;

  const response = await axios.post('https://realm.mongodb.com/api/admin/v3.0/auth/providers/mongodb-cloud/login',  {
    'username': PUBLIC_KEY, 
    'apiKey': PRIVATE_KEY
  },  {
    headers: {
      'Content-Type' : 'application/json',
    },
  });
  
  accessToken = response.data.access_token;
  
  const api_url = `https://realm.mongodb.com/api/admin/v3.0/groups/${PROJECT_ID}/apps/${APP_ID}/users/${uid}`;
  const res = await axios.delete(api_url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  return {
    status : 204,
    data : res.data
  };
}