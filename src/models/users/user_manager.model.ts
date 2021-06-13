import {userMongooseInstance as userMongoose} from '../../services/mongoose/mongoose.users.service';
import { Schema, Document } from 'mongoose';
import { ResponseObject } from '../utils/model_response.object'
import Debug from 'debug';
import { ConfigurationServicePlaceholders } from 'aws-sdk/lib/config_service_placeholders';

const debug = Debug('user_manager.model');

export interface IUserOAuthData extends Partial<Document>{
  provider_name: string, // SPOTIFY | GOOGLE | PANDORA
  client_id: string, // CLIENT ID USED FOR GRANT FLOW ON CLIENT
  refresh_token: string, // TO BE STORED FOR PROVIDER API ACCCESS 
}
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
  google_calendar : {
    refresh_token: string,
    primary_email: string,
    calendar_ids: string[],
  },
  oauth_data: IUserOAuthData[],
} 

const userOAuthSchema = new Schema({
  provider_name: {required: true, type: String, unique: true},
  client_id: {required: true, type: String},
  refresh_token: {required: true, type: String},
}, {
  timestamps: true
});

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
  spotify_oauth: userOAuthSchema,
  google_oauth: userOAuthSchema,
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
    google_calendar : {
      refresh_token: '',
      primary_email: '',
      calendar_ids: [],
    },
    oauth_data: [],
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

/****************************************************************************//**
 * @summary updates user manager in MongoDB
 * @description updates user manager for the assosciated id
 * @param {string} user_id - id of associated user account
 * @param {string} updateFields - fields to be updated
 * @return returns a 
 * 
 * ****************************************************************************/
export const updateUserManager = async (user_id: string, updateFields: any, isArray:boolean = false) => { // updates database
   
  let result:any;
  let update_1 = isArray ? { $addToSet: updateFields}: updateFields; //for updating arrays

  await UserManager.findOneAndUpdate(
    {user_id: user_id},
    update_1,
    {setDefaultsOnInsert: true, useFindAndModify: true, new: true},
    function(err: any, doc: any) {
      if (err) {
        // console.log('error in manager: ', err);
        debug('here is the error:', err);
        result = {error: err};
      }
      debug('succesfully updated user manager');
      //console.log(doc._id);
      result = doc?._id;
    });
  return result;
}; 


/****************************************************************************//**
 * @summary updates user event lists in MongoDB
 * @description updates user manager event lists for the assosciated id, and removes events from other lists
 * @param {string} user_id - id of associated user account
 * @param {string} update_fields - fields to be updated
 * @param {string} list_type - list that retains event
 * @return returns a 
 * 
 * ****************************************************************************/
export const updateUserManagerEventList = async (user_id: string, update_fields: any, list_type: String) => { // updates database
  const list_types = ['event_left', 'event_up', 'event_right'];
  let result:any;
  let update_1 = { $addToSet: update_fields}; //for updating arrays
  let update_2 = { $pull: update_fields}; //for ensuring arrays do not hold duplicates
  
  await UserManager.findOneAndUpdate(
    {user_id: user_id},
    update_1,
    {setDefaultsOnInsert: true, useFindAndModify: true, new: true},
    function(err: any, doc: any) {
      if (err) {
        console.log('error in manager: ', err);
        debug('here is the error:', err);
        result = {error: err};
      }
      debug('succesfully updated user manager');

      //console.log(doc._id);
      result = doc._id;
    });
  
  list_types.forEach((value)=>{
    if ( value != list_type) {
      UserManager.findOneAndUpdate(
        {user_id: user_id},
        update_2,
        {setDefaultsOnInsert: true, useFindAndModify: true, new: true},
        function(err: any, doc: any) {
          if (err) {
            console.log('error in manager: ', err);
            debug('here is the error:', err);
            result = {error: err};
          }
          debug('succesfully updated user manager');
    
          //console.log(doc._id);
          result = doc._id;
        }) 
    } else{ return; }
  });
  
  return result;
}; 

/****************************************************************************//**
 * @summary 
 * @description 
 * @param {string} user_id - id of associated user account
 * @param {string} list_type - fields to be retrieved
 * @return returns a list of event ids from given list_type
 * 
 * ****************************************************************************/
export const getUserEventList = async (user_id: string, list_type: string) => { // retrieves from database
  let result:any;
  await UserManager.find(
    {user_id: user_id},
    list_type,
    {},
    function(err: any, doc: any) {
      if (err) {
        console.log('error in manager: ', err);
        debug('here is the error:', err);
        result = {error: err};
      } else {
        debug('succesfully retrieved document');
        result = doc[0][list_type];
      }
    }).then((value)=>{
    // console.log(value);
  })

  return result;
}; 

/****************************************************************************//**
 * @summary 
 * @description 
 * @param {string} user_id - id of associated user account
 * @return returns the google calendar credentials for the given user
 * 
 * ****************************************************************************/
export const getUserCalendarCredentials = async (user_id: string) => { // retrieves from database
  let result:any;
  await UserManager.find(
    {user_id: user_id},
    'google_oauth',
    {},
    function(err: any, doc: any) {
      if (err) {
        console.log('error in manager: ', err);
        debug('here is the error:', err);
        result = {error: err};
      } else {
        debug('succesfully retrieved document');
        // console.log(doc);
        result = doc[0]['google_oauth'];
      }
    });
  return result;
}; 

