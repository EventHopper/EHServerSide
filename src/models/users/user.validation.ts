import * as User from './users.model';
import Debug from 'debug';

const debug = Debug('user.validation');

export async function isValidUser(user_id:string) {
  return await User.getUserData(undefined, undefined, user_id) != null;
};