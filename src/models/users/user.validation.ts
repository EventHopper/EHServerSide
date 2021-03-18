import * as User from './users.model';
import Debug from 'debug';

const debug = Debug('user.validation');

export async function isValidUser(user_id:string) {
  var document = await User.getUserData(undefined, undefined, user_id);
  debug(document);
  return  !(document == null);
};