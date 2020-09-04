import supertest from 'supertest';
import App from '../src/api/app';
import {TEST_PORT as PORT, TEST_AUTH_API_KEY as KEY} from '../src/common/utils/config';
import EventsController from '../src/api/events/events.controller';
import UserController from '../src/api/users/users.controller';
import {EventDoc} from '../src/models/events/events.model';
import * as TestingConstants from './utils/testing.constants';
import getType from 'jest-get-type';

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
  
it('Fails to register existing user', async done => {
  // Sends POST Request to /test endpoint
  const res = await request
    .post(`/users/register?key=${KEY}`)
    .set('Content-Type', 'application/json')
    .send(`{"username": "${TestingConstants.testUsername}","email":"${TestingConstants.testEmail}","password": "${TestingConstants.testPassword}"}`);
  expect(res.status).toBe(400);
  expect(res.body).toBeDefined();
  expect(getType(res.body)).toBe('object');
  expect(res.body.message).toMatch('name already in use');
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
  
it('Succeeds to search for user', async done => {
  // Sends GET Request to /test endpoint
  const res = await request
    .get(`/search/users?key=${KEY}&query=${TestingConstants.testUsername}&limit=1`);
  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
  expect(getType(res.body)).toBe('array');
  expect(res.body[0].username).toMatch(TestingConstants.testUsername);
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
  