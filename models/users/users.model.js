/* eslint-disable require-jsdoc */
import {mongoose} from '../../services/mongoose/mongoose.users.service';
const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullname: String,
  username: String,
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

export const User = mongoose.model('Users', userSchema);

export function saveUser(userData) { // saves to database
  const user = new User(userData);
  console.log(user);
  return User.findOneAndUpdate(
      {user_id: user.data_id},
      user,
      {upsert: true, new: true, useFindAndModify: true},
      function(err, doc) {
        console.log(doc);
        if (err) return (500, {error: err});
        return ('User Succesfully Updated.');
      });
};

export function list(perPage, page) { // list all users
  return new Promise((resolve, reject) => {
    User.find()
        .limit(perPage)
        .skip(perPage * page)
        .exec(function(err, users) {
          if (err) {
            reject(err);
          } else {
            resolve(users);
          }
        });
  });
};
