import supertest from 'supertest';
import App from '../src/api/app';
import {TEST_PORT as PORT, TEST_AUTH_API_KEY as KEY} from '../common/utils/config';
import EventsController from '../api/events/events.controller';
import UserController from '../api/users/users.controller';
import {EventDoc} from '../models/events/events.model';
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
});

it('Succeeds to get events by location with lat/long', async done => {
  // Sends GET Request to /events?index=location endpoint
  const res = await request.get(`/events?index=location&lat=39.9594667&long=-75.2249542&key=${KEY}&category="Music"}&radius=0.02`);
  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
  done();
});

it('Succeeds to get events by Venue Name', async done => {
  // Sends GET Request to /event endpoint
  const res = await request.get(`/events?index=venue&name=Citizens Bank Park&key=${KEY}`);
  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
  done();
});

it('Fails to get the events venue endpoint due to lack of venue name', async done => {
  // Sends GET Request to /test endpoint
  const res = await request.get(`/events?index=venue&key=${KEY}`);
  expect(res.status).toBe(400);
  expect(res.body).toContain('Invalid venue name');
  done()
});

it('Succeeds to get events by Location with filters', async done => {
  // Sends GET Request to /event endpoint
  const res = await request.get(`/events?index=location&lat=39.9594667&long=-75.2249542&key=${KEY}&limit=5&date_after=2020-12-05T00:00:00.000Z&category=Music&radius=0.001`);
  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();

  let size:number = Number(res.body.length);
  let dateAfter:Date = new Date('2020-12-05T00:00:00.000Z');
  expect(size).toBeLessThanOrEqual(5); //checks that the limit filter works
  res.body.forEach((event:EventDoc) => {
    let eventDate:Date = new Date(event.start_date_utc);
    expect(event.category).toBe('Music'); //checks that only events with specified category are returned
    expect(eventDate.getTime()).toBeGreaterThanOrEqual(dateAfter.getTime()); //checks the date filter works
  });
  done();
});