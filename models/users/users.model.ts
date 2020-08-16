/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import {userMongooseInstance as userMongoose} from '../../services/mongoose/mongoose.users.service';
const Schema = userMongoose.Schema;

const userSchema = new Schema({
  full_name: String,
  username: {required: true, type: String, unique: true},
  email: {required: true, type: String, unique:true},
  image_url: String,
  user_id: {required: true, type: String, unique: true},
  friends: [String],
  location: {
    city: String,
  },
});

export const User = userMongoose.model('Users', userSchema);

export function saveUser(userData:any) { // saves to database
  const user:any = userData;
  return User.findOneAndUpdate(
    {user_id: user.user_id},
    user,
    {upsert: true, new: true, useFindAndModify: false},
    function(err:any, doc:any) {
      console.log(doc);
      if (err) return {status: 500, error: err};
      return ('User Succesfully Updated.');
    });
};

export function newUser(userData:any) { // saves to database
  const user:any = userData;
  return User.create(
    user,
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

export function search(query:string) { // list all users
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
        $limit: 10
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
          console.log(err);
          reject(err);
        } else {
          console.log(userDocument);
          resolve(userDocument);
        }
      });
  });
};

