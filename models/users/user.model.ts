import Realm from 'realm';
import {REALM_APP_ID as ID} from '../common/utils/config';
const USER_SCHEMA = 'User';

const UserSchema = {
  uasername: USER_SCHEMA,
  primaryKey: 'id',
  properties: {
    id: 'int',
    username: {type: 'string', indexed: true},
    imageURL: 'string?',
    email: 'string',
    fullName: 'string',
  },
};

