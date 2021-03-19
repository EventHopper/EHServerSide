import supertest from 'supertest';
import App from '../src/api/app';
import  * as Config from '../src/common/utils/config';
import EventsController from '../src/api/events/events.controller';
import UserController from '../src/api/users/users.controller';
import { deleteUserManager } from '../src/models/users/user_manager.model';
import * as TestingConstants from './utils/testing.constants';
import getType from 'jest-get-type';
import { getUserData } from '../src/models/users/users.model';


const PORT = Config.variables.ports.testPort;
const KEY = Config.variables.environment.testAuthApiKey;

const request = supertest(new App([
  new EventsController(),
  new UserController(),
],   
Number(PORT)).app)

it('Fails to get the users endpoint due to lack of apiKey', async done => {
  // Sends GET Request to /test endpoint
  const res = await request.get('/users');
  expect(res.status).toBe(400);
  expect(res.body).toContain('Failed to authenticate request');
  done()
});
  
it('Succeeds to get the users endpoint and list users', async done => {
  // Sends GET Request to /test endpoint
  const res = await request.get(`/users?key=${KEY}`);//We may need to explicitly state keys
  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
  expect(getType(res.body)).toBe('array');
  done();
});

// it('Wipe User Data', async done => {
//   // Sends GET Request to /test endpoint
//   const res = await request
//     .delete(`/users/${TestingConstants.testUsername}?key=${KEY}`)
//     .set('Content-Type', 'application/json')
//     .send(`{"email":"${TestingConstants.testEmail}","password": "${TestingConstants.testPassword}"}`);
//   expect(res.status).toBe(200);
//   expect(res.body).toBeDefined();
//   expect(String(res.body.message)).toMatch('UserManager associated with');
//   done();
// });

// it('Succeeds to register user', async done => {
//   // Sends POST Request to /test endpoint
//   const res = await request
//     .post(`/users/register?key=${KEY}`)
//     .set('Content-Type', 'application/json')
//     .send(`{"username": "${TestingConstants.testUsername}","email":"${TestingConstants.testEmail}","password": "${TestingConstants.testPassword}"}`);
//   expect(res.status).toBe(200);
//   expect(res.body).toBeDefined();
//   expect(getType(res.body)).toBe('string');
//   console.log(res.body);
//   expect(res.body).toMatch('Successfully registered user');
//   done();
// });
  
it('Fails to register existing user', async done => {
  // Sends POST Request to /test endpoint
  const res = await request
    .post(`/users/register?key=${KEY}`)
    .set('Content-Type', 'application/json')
    .send(`{"username": "${TestingConstants.testUsername}","email":"${TestingConstants.testEmail}","password": "${TestingConstants.testPassword}"}`);
  expect(res.status).toBe(400);
  expect(res.body).toBeDefined();
  expect(getType(res.body)).toBe('object');
  expect(res.body.message).toMatch('An error occured: Error: The email address is already in use by another account.');
  done();
});
  
it('Fails to register user malformatted email', async done => {
  // Sends POST Request to /test endpoint
  const res = await request
    .post(`/users/register?key=${KEY}`)
    .set('Content-Type', 'application/json')
    .send('{"username": "aaa","email":"spidermanwedoo","password": "googleking"}');
  console.log(res.body);
  expect(res.status).toBe(400);
  expect(res.body.message).toBeDefined();
  expect(getType(res.body)).toBe('object');
  expect(res.body.message).toMatch('malformatted email');
  done();
});
  
it('Fails to register password too short', async done => {
  // Sends POST Request to /test endpoint
  const res = await request
    .post(`/users/register?key=${KEY}`)
    .set('Content-Type', 'application/json')
    .send('{"username": "spiderman","email":"spiderman@wedoo.app","password": "fordo"}');
  expect(res.status).toBe(400);
  expect(res.body).toBeDefined();
  expect(getType(res.body)).toBe('object');
  expect(res.body.message).toMatch('password must be between 6 and 128 chars long');
  done();
});
  
it('Fails to register password too long', async done => {
  // Sends POST Request to /test endpoint
  const res = await request
    .post(`/users/register?key=${KEY}`)
    .set('Content-Type', 'application/json')
    .send(`{"username": "spiderman","email":"spiderman@wedoo.app","password":"${TestingConstants.longString}"}`);
  expect(res.status).toBe(400);
  expect(res.body).toBeDefined();
  expect(getType(res.body)).toBe('object');
  expect(res.body.message).toMatch('password must be between 6 and 128 chars long');
  done();
});
  
it('Succeeds to search for user (limit)', async done => {
  // Sends GET Request to /test endpoint
  const res = await request
    .get(`/search/users?key=${KEY}&query=${TestingConstants.testUsername}&limit=1`);
  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
  expect(getType(res.body)).toBe('array');
  expect(res.body[0].username).toMatch(TestingConstants.testUsername);
  done();
});

it('Succeeds to search for user (no limit)', async done => {
  // Sends GET Request to /test endpoint
  const res = await request
    .get(`/search/users?key=${KEY}&query=${TestingConstants.testUsername}`);
  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
  expect(getType(res.body)).toBe('array');
  expect(res.body[0].username).toMatch(TestingConstants.testUsername);
  done();
});

it('No result on search for impossible user', async done => {
  // Sends GET Request to /test endpoint
  const res = await request
    .get(`/search/users?key=${KEY}&query=${1234567890}`);
  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
  expect(getType(res.body)).toBe('string');
  expect(res.body).toMatch('No Search Results');
  done();
});
  
it('Succeeds to get user based on username', async done => {
  // Sends GET Request to /test endpoint
  const res = await request
    .get(`/users/${TestingConstants.testUsername}?key=${KEY}`);
  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
  expect(getType(res.body)).toBe('object');
  expect(res.body.username).toMatch(TestingConstants.testUsername);
  done();
});

it('Succeeds to get user based on id', async done => {
  // Sends GET Request to /test endpoint
  const res = await getUserData(null, null, TestingConstants.testID);
  expect(getType(res)).toBe('object');
  console.log(`This is the object: /n ${res}`);
  expect(res.username).toMatch(TestingConstants.testUsername);
  done();
});

it('Succeeds to get user based on email', async done => {
  // Sends GET Request to /test endpoint
  const res = await getUserData(null, TestingConstants.testEmail, null);
  expect(getType(res)).toBe('object');
  console.log(`This is the object: /n ${res}`);
  expect(res.username).toMatch(TestingConstants.testUsername);
  done();
});
  
it('Succeeds to update user based on username', async done => {
  // Sends GET Request to /test endpoint
  const firstResponse = await request
    .post(`/users/${TestingConstants.testUsername}?key=${KEY}`)
    .set('Content-Type', 'application/json')
    .send('{"full_name":"Johnny Karate"}');
  expect(firstResponse.status).toBe(200);
  expect(firstResponse.body).toBeDefined();
  expect(getType(firstResponse.body)).toBe('object');
  expect(String(firstResponse.body.message)).toMatch('User Succesfully Updated.');
  const secondResponse = await request
    .get(`/users/${TestingConstants.testUsername}?key=${KEY}`)
  expect(secondResponse.status).toBe(200);
  expect(secondResponse.body).toBeDefined();
  expect(secondResponse.body.full_name).toBe('Johnny Karate');
  done();
});
  
it('Fails to get user due to invalid username', async done => {
  // Sends GET Request to /test endpoint
  const res = await request
    .get(`/users/!@#%!@?key=${KEY}`);
  expect(res.status).toBe(400);
  expect(res.body).toBeDefined();
  expect(getType(res.body)).toBe('string');
  done();
});
  
it('Fails to get user due to not found', async done => {
  // Sends GET Request to /test endpoint
  const res = await request
    .get(`/users/.asd?key=${KEY}`);
  expect(res.status).toBe(404);
  expect(res.body).toBeDefined();
  expect(getType(res.body)).toBe('object');
  done();
});

it('User manager successfully created', async done => {
  // Sends GET Request to /test endpoint
  const res = await request
    .get(`/manager/users/${TestingConstants.testUsername}?key=${KEY}`);
  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
  expect(getType(res.body)).toBe('object');
  done();
});

it('User manager updated', async done => {
  // Sends GET Request to /test endpoint
  const res = await request
    .post(`/users/swipe/${TestingConstants.testID}?key=${KEY}`)
    .set('Content-Type', 'application/json')
    .send('{"event_left":"test"}');
  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
  expect(getType(res.body)).toBe('object');
  done();
});


it('List retrieved from User Manager', async done => {
  // Sends GET Request to /test endpoint
  const res = await request
    .get(`/users/manager/${TestingConstants.testID}/event_left?key=${KEY}`)
  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
  expect(getType(res.body)).toBe('object');
  done();
});

it('Fails to Update User Relationship without ID Token', async done => {
  // Sends GET Request to /test endpoint
  const res = await request
    .post(`/users/network/relationships/?key=${KEY}`)
    .set('Content-Type','application/json')
    .send(`
      {
      "recipient_id" : "f41Quf8OiRMVipRersYKSxh9V2j1",
      "requester_id" : "3LoUabnfbNfwgieGST7aVfSMk3l2",
      "state" : "2"
    }`)
  expect(res.status).toBe(401);
  done();
});

it('Updates User Relationship', async done => {
  // Sends GET Request to /test endpoint
  const res = await request
    .post(`/users/network/relationships/?key=${KEY}`)
    .set('Content-Type','application/json')
    .set('id_token', TestingConstants.testID)
    .send(`
      {
      "recipient_id" : "f41Quf8OiRMVipRersYKSxh9V2j1",
      "requester_id" : "3LoUabnfbNfwgieGST7aVfSMk3l2",
      "state" : "1"
    }`)

  expect(res.status).toBe(200);
  done();
});

it('Deletes User Relationship', async done => {
  // Sends GET Request to /test endpoint
  const res = await request
    .post(`/users/network/relationships/?key=${KEY}`)
    .set('Content-Type','application/json')
    .set('id_token', TestingConstants.testID)
    .send(`
      {
      "recipient_id" : "f41Quf8OiRMVipRersYKSxh9V2j1",
      "requester_id" : "3LoUabnfbNfwgieGST7aVfSMk3l2",
      "state" : "0"
    }`)

  expect(res.status).toBe(200);
  done();
}); 

it('Attempts to Get User Relationship', async done => {
  // Sends GET Request to /test endpoint
  const res = await request
    .get(`/users/network/relationships/?user_id=${TestingConstants.testID}&state=1&key=${KEY}`)
  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
  expect(getType(res.body)).toBe('object');
  done();
});

// it('Invalid ID for User Manager Deletion', async done => {
//   // Sends GET Request to /test endpoint
//   const res = await deleteUserManager('');
//   expect(res.status).toBe(400);
//   expect(getType(res)).toBe('object');
//   done();
// });


  