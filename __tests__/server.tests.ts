import supertest from 'supertest';
import App from '../api/app';
import {TEST_PORT as PORT, TEST_AUTH_API_KEY as KEY} from '../common/utils/config';
import EventsController from '../api/events/events.controller';
import UserController from '../api/users/users.controller';
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

it('Succeeds to get the users endpoint', async done => {
  // Sends GET Request to /test endpoint
  const res = await request.get(`/users?key=${KEY}`);//We may need to explicitly state keys
  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
  expect(getType(res.body)).toBe('array');
  done();
})

it('Succeeds to get events by location with lat/long', async done => {
  // Sends GET Request to /test endpoint
  const res = await request.get(`/events?index=location&lat=39.9594667&long=-75.2249542&key=${KEY}&query={"category":"Music"}&radius=0.02`);
  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
  done()
})