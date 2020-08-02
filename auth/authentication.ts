/* eslint-disable max-len */
import Realm from 'realm';
import assert from 'assert';
import {APP_ID as ID} from '../common/utils/config';

const app = new Realm.App({id: `${ID}`}); // TODO: change to dotenv

/**
 * Logs in a user onto the Realm App via and APIKey.
 * To log in with an API key, create an API Key credential with a server
 * or user API key and pass it to App.logIn()
 * @param {string} apiKey The API key.
 * @return {int} The sum of the two numbers.
 */
async function loginApiKey(apiKey: string) {
  // Create an API Key credential
  console.log('hi');
  const credentials = Realm.Credentials.userApiKey(apiKey);

  try {
    // Authenticate the user
    const user: Realm.User = await app.logIn(credentials);

    // `App.currentUser` updates to match the logged in user
    assert(user.id === app.currentUser!.id);

    return user;
  } catch (err) {
    console.error('Failed to log in', err);
  }
}

loginApiKey('frfhr').then((user) => {
  user ? console.log('alive') : console.log('nah');
  // console.log('Successfully logged in!', user);
});
