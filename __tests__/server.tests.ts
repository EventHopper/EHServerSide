import supertest from 'supertest';
import App from '../src/api/app';
import {TEST_PORT as PORT, TEST_AUTH_API_KEY as KEY} from '../src/common/utils/config';
import EventsController from '../src/api/events/events.controller';
import UserController from '../src/api/users/users.controller';

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
