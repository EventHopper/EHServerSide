/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import {userMongooseInstance as userMongoose} from '../../services/mongoose/mongoose.users.service';
import Debug from 'debug';
import { Document } from 'mongoose';
import { initializeUserManager, deleteUserManager } from './user_manager.model';
import { deleteUserAccount } from '../../auth/user.auth'
import { checkCredentials } from '../../auth/user.auth';

const Schema = userMongoose.Schema;
const debug = Debug('users.model');

export interface IUser extends Partial<Document> {
  user_id: string;
  username: string;
  email: string;
  full_name?: string;
  image_url?: string;
  friends?: string[];
  user_manager_id: string;
  location?: {
    city: string;
  };
}

export interface IUserUpdate extends Partial<Document> {
  username?: string;
  email: string;
  full_name?: string;
  image_url?: string;
  friends?: string[];
  location?: {
    city: string;
  };
}

const UserSchema = new Schema({
  user_id: {required: true, type: String, unique: true},
  full_name: String,
  username: {required: true, type: String, unique: true},
  email: {required: true, type: String, unique:true},
  image_url: String,
  friends: [String],
  user_manager_id: {required: true, type: String, unique: true},
  location: {
    city: String,
  },
});

export const User = userMongoose.model('Users', UserSchema);

/****************************************************************************//**
 * @summary updates a user's data 
 * @description updates a user's data through 
 * @param {IUserUpdate} userData object of data containing updates
 * @return returns response object with fields `message`, `status` and `userDoc` if successful
 * 
 * ****************************************************************************/
export function updateUser(username:string, userData:IUserUpdate) { // saves to database
  const updates:IUserUpdate = userData;
  return new Promise((resolve, reject) => { 
    User.findOneAndUpdate(
      {username: username},
      updates,
      {useFindAndModify: false},
    ).exec(function(err:any, userDoc:any) {
      debug(userDoc);
      if (err) reject({status: 500, message: err});
      resolve({status: 200, userDoc: userDoc, message: 'User Succesfully Updated.'});
    });
  });
};

/****************************************************************************//**
 * @summary creates a new set of userdata associated with a user account
 * @description creates userdata along with associated property models such as UserManager
 * @param {IUser} userData object of data associated with new user
 * @return returns response object with fields message, status and userDoc if successful
 * 
 * ****************************************************************************/
export async function initializeUserData(userData:IUser){ // saves to database
  let creationResult:any = await initializeUserManager(userData.user_id);
  if(creationResult.status == 200){
    userData.user_manager_id = creationResult.user_manager_doc._id;
    let userDoc:any;
    User.findOneAndUpdate(
      {user_id: userData.user_id},
      userData,
      {upsert: true, new: true, useFindAndModify: false},
      function(err:any, doc:any) {
        debug(doc);
        userDoc = doc;
        if (err) creationResult = {status: 500, message: err};
      });
    creationResult = {status: 200, userDoc: userDoc, message: 'User Succesfully Updated.'};
  }
  return creationResult;
};

/****************************************************************************//**
 * @summary lists all users 
 * @description lists all users available paginated by the page & perPage params.
 * @param {number} perPage number of results to display per page
 * @param {number} page page number to index to
 * @return returns array list of user objects
 * 
 * ****************************************************************************/
export function list(perPage:number, page:number) { // list all users
  return new Promise((resolve, reject) => {
    User.find()
      .limit(perPage)
      .skip(perPage * page)
      .exec(function(err:any, users:any) {
        if (err) {
          reject(err);
        } else {
          resolve(users);
        }
      });
  });
};

/****************************************************************************//**
 * @summary searches for user(s) based on query
 * @description partial search on username and email
 * @param {string} query search query
 * @param {number} limit number of users to return
 * @return returns array list of user objects
 * 
 * ****************************************************************************/
export function search(query:string, limit?:number) { // list users matching query
  let resultLimit:number = limit? limit: 10;
  return new Promise((resolve, reject) => {
    const aggregation = [
      {
        $match : {
          $or: [
            {
              username : {
                $regex: query
              }
            }, {
              full_name : {
                $regex: query
              }
            }
          ]
        }
      }, 
      {
        $limit: resultLimit
      },
      {
        $project: {
          '_id': 0,
          'username': 1,
          'full_name': 1,
          'email': 1,
          'image_url':1
        }
      }];

    User.aggregate(aggregation).exec(function(err:any, users:any) {
      if (err) {
        reject(err);
      } else {
        resolve(users);
      }
    });
  
  });
};

/****************************************************************************//**
 * @summary returns a specific user's data
 * @description returns user data associated with username
 * @param {string} username (optional) username of target user
 * @param {string} email (optional) email of target user
 * @return returns Promise of user document or error on fail
 * 
 * ****************************************************************************/
export function getUserData(username?:string, email?:string, id?:string):any { // list single users
  return new Promise((resolve, reject) => {

    if(id) {
      User.findOne({user_id : `${id}`},
        function(err:any, userDocument:any) {
          if (err) {
            debug(err);
            reject(err);
          } else {
            debug(userDocument);
            resolve(userDocument);
          }
        });
    }
    else if (username) {
      User.findOne({username : `${username}`},
        function(err:any, userDocument:any) {
          if (err) {
            debug(err);
            reject(err);
          } else {
            debug(userDocument);
            resolve(userDocument);
          }
        });
    } else if(email){
      User.findOne({email : `${email}`},
        function(err:any, userDocument:any) {
          if (err) {
            debug(err);
            reject(err);
          } else {
            debug(userDocument);
            resolve(userDocument);
          }
        });
    } else {
      return {message:'No email or username provided'}
    }
  });
};

/****************************************************************************//**
 * @summary deletes associated user data from database
 * @description deletes User document and User Manager document from user database
 * @param {string} email email associated with account
 * @param {string} password password associated with account
 * @return returns response object with fields message, status
 * 
 * ****************************************************************************/
export async function wipeUserData(email:string, password:string) { // deletes from database
  let result = {status: 500, message: 'Internal Error'};
  const userData:IUser = (await checkCredentials(email, password, undefined, true)).userData;
  console.log(userData);
  if (userData) {
    let accountDeletionResult = await deleteUserAccount(email, password);
    console.log(accountDeletionResult);
    if (accountDeletionResult.status == 204) {
      let deletionResult:any = await deleteUserManager(userData.user_id);
      if(deletionResult.status == 200) {
        result = await User.find({user_id:userData.user_id}).remove().exec().then(doc => {
          result = {status: 200, message: `UserManager associated with ${userData.user_id} deleted.`};
          return result;
        }).catch(err => {
          result = {status: 500, message: err}; 
          return result;
        });
      } else {
        result = {status: 400, message: 'Was unable to perform deletion. Please try again later.'};
        return result;
      }
    } else {
      result = {status: 400, message: 'Was unable to perform deletion. Please try again later.'};
      return result;
    }
  }else {
    result = {status: 400, message: 'Invalid credentials. Cannot perform acoount deletion'};
    return result;
  }
  return result;
};
