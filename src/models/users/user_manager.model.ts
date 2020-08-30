import {userMongooseInstance as userMongoose} from '../../services/mongoose/mongoose.users.service';
import { Schema, Document } from 'mongoose';
import Debug from 'debug';

const debug = Debug('user_manager.model');

interface IUserManager extends Document {
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

export function initializeUserManager(userData:any) { // saves to database
  const user:any = userData;
  return UserManager.findOneAndUpdate(
    {user_id: user.user_id},
    user,
    {upsert: true, new: true, useFindAndModify: false},
    function(err:any, doc:any) {
      debug(doc);
      if (err) return {status: 500, message: err};
      return {status: 200, message: 'UserManager Succesfully Updated.'};
    }
  );
};
