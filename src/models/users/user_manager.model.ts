import {userMongooseInstance as userMongoose} from '../../services/mongoose/mongoose.users.service';
import { Schema, Document } from 'mongoose';
import { ResponseObject } from '../utils/model_response.object'
import Debug from 'debug';

const debug = Debug('user_manager.model');

interface IUserManager extends Partial<Document> {
  user_id: string,
  device_info: Object,
  fcm_tokens: string[],
  event_preferences: string[],
  calendar_credentials: Object,
  log_url: string,
  friend_rank: string[],
  event_left: string[],
  event_right: string[],
  event_up: string[],
  location : {
    city: string,
  },
} 

const UserManagerSchema = new Schema({
  user_id: String,
  device_info: Object,
  fcm_tokens: [String],
  event_preferences: [String],
  calendar_credentials: Object,
  log_url: String,
  friend_rank: [String],
  event_left: [String],
  event_right: [String],
  event_up: [String],
  location : {
    city: String,
  },
}, {
  timestamps: true
});

const UserManager = userMongoose.model('UserManager', UserManagerSchema);



/****************************************************************************//**
 * @summary initializes user manager in MongoDB
 * @description creates a user manager for the assosciated user id
 * @param {string} user_id - id of associated user
 * @return returns a promise of type ResponseObject containing a status, message and user manager document on success. 
 * Omits document on failure.
 * 
 * ****************************************************************************/
export async function initializeUserManager(user_id:string):Promise<Partial<ResponseObject>> { // saves to database
  
  var result={};
  
  const managerInit:IUserManager = {
    user_id: user_id,
    device_info: {},
    fcm_tokens: [],
    event_preferences: [],
    calendar_credentials: {},
    log_url: '',
    friend_rank: [],
    event_left: [],
    event_right: [],
    event_up: [],
    location : {
      city: '',
    },
  };

  let manager = new UserManager(managerInit);
  await manager.save()
    .then(doc => {
      result = {status: 200, user_manager_doc: doc, message: 'UserManager Succesfully Initialized.'};
    }).catch(err => {
      result = {status: 500, message: err}; 
    });
  return result;
};

/****************************************************************************//**
 * @summary deletes user manager in MongoDB
 * @description deletes user manager for the assosciated id
 * @param {string} user_id - id of associated user account
 * @return returns a promise of type ResponseObject containing a status, message and user manager document on success. 
 * Omits document on failure.
 * 
 * ****************************************************************************/
export async function deleteUserManager(user_id:string):Promise<Partial<ResponseObject>> { // deletes from database
  var result={};
  result = await UserManager.find({user_id: user_id}).remove().exec().then(doc => {
    if (doc) {
      return {status: 200, user_manager_doc: doc, message: `UserManager associated with ${user_id} Deleted.`};
    } else {
      return{status: 400, message: `Error: UserManager associated with ${user_id} not found.`}; 
    }
  }).catch(err => {
    return {status: 500, message: err}; 
  });

  return result;
}
