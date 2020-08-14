/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import {userMongooseInstance as userMongoose} from '../../services/mongoose/mongoose.users.service';
const Schema = userMongoose.Schema;

const userSchema = new Schema({
  full_name: String,
  username: {required: true, type: String, unique: true},
  imageURL: String,
  user_id: {required: true, type: String, unique: true},
  friends: [String],
  location: {
    city: String,
    // country_code: String,
    // street: String,
    // zip: String,
    // state: String,
    // latitude: Number,
    // longitude: Number,
    // timezone: String,
  },
});

export const User = userMongoose.model('Users', userSchema);

export function saveUser(userData:any) { // saves to database
  const user:any = new User(userData);
  console.log(user);
  return User.findOneAndUpdate(
    {user_id: user.data_id},
    user,
    {upsert: true, new: true, useFindAndModify: true},
    function(err:any, doc:any) {
      console.log(doc);
      if (err) return {status: 500, error: err};
      return ('User Succesfully Updated.');
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

export function getUserData(username:string) { // list all users
  const query = username.toLowerCase();
  return new Promise((resolve, reject) => {
    User.findOne({'username': `${query}`},
      function(err:any, userDocument:any) {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log(userDocument);
          resolve(userDocument);
        }
      });
  });
};
