import supertest from 'supertest';
import App from '../src/api/app';
import {TEST_PORT as PORT, TEST_AUTH_API_KEY as KEY} from '../src/common/utils/config';
import * as TestingConstants from './utils/testing.constants';
import EventsController from '../src/api/events/events.controller';
import UserController from '../src/api/users/users.controller';
import * as Auth from '../src/auth/user.auth';

const request = supertest(new App([
  new EventsController(),
  new UserController(),
],
Number(PORT)).app)

it('Succeeds to get home route', async done => {
  // Sends GET Request to /test endpoint
  const res = await request.get(`/?key=${KEY}`);
  expect(res.status).toBe(200);
  done()
});

it('Fails to get home route', async done => {
  // Sends GET Request to /test endpoint
  const res = await request.get('/');
  expect(res.status).toBe(400);
  done()
});

// it(`should return user object of ${TestingConstants.testUsername}`, async done => {
//   const userObject = (await Auth.checkCredentials(TestingConstants.testEmail, TestingConstants.testPassword)).userData;
//   expect(userObject.username).toBe(TestingConstants.testUsername);
//   done();
// });

it(`should fail to return the user object of ${TestingConstants.testUsername}`, async done => {
  const userObject = await Auth.checkCredentials(TestingConstants.testEmail, (TestingConstants.testPassword+'wrong'));
  expect(userObject.message).toBe('Could not delete account due to error: invalid username/password');
  done();
});
