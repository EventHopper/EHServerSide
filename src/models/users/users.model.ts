/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import {userMongooseInstance as userMongoose} from '../../services/mongoose/mongoose.users.service';
import Debug from 'debug';
import { Document } from 'mongoose';

const Schema = userMongoose.Schema;
const debug = Debug('users.model');

export interface IUser extends Document {
  user_id: string;
  email: string;
  full_name: string;
  image_url: string;
  friends: string[],
  location: {
    city: String,
  };
}

const UserSchema = new Schema({
  user_id: {required: true, type: String, unique: true},
  full_name: String,
  username: {required: true, type: String, unique: true},
  email: {required: true, type: String, unique:true},
  image_url: String,
  friends: [String],
  location: {
    city: String,
  },
});

export const User = userMongoose.model('Users', UserSchema);

export function saveUser(userData:any) { // saves to database
  const user:any = userData;
  return User.findOneAndUpdate(
    {user_id: user.user_id},
    user,
    {upsert: true, new: true, useFindAndModify: false},
    function(err:any, doc:any) {
      debug(doc);
      if (err) return {status: 500, error: err};
      return ('User Succesfully Updated.');
    });
};

export function newUser(userData:any):any { // saves to database
  const user:any = userData;
  return User.create(
    user,
    function(err:any, doc:IUser) {
      debug(doc);
      if (err) return {status: 500, message: err};
      return {status: 200, userDoc: doc, message: 'User Succesfully Updated.'};
    });
};

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

export function getUserData(username:string) { // list single users
  const query = username.toLowerCase();
  return new Promise((resolve, reject) => {
    User.findOne({'username': `${query}`},
      function(err:any, userDocument:any) {
        if (err) {
          debug(err);
          reject(err);
        } else {
          debug(userDocument);
          resolve(userDocument);
        }
      });
  });
};
