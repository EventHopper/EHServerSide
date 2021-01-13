import supertest from 'supertest';
import App from '../src/api/app';
import {TEST_PORT as PORT, TEST_AUTH_API_KEY as KEY} from '../src/common/utils/config';
import EventsController from '../src/api/events/events.controller';
import {eventBySample } from '../src/models/events/events.model';
import UserController from '../src/api/users/users.controller';
import {EventDoc} from '../src/models/events/events.model';
import getType from 'jest-get-type';

const request = supertest(new App([
  new EventsController(),
  new UserController(),
],
Number(PORT)).app)


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

it('Succeeds to get event by ID', async done => {
  // Sends GET Request to /test endpoint
  const res = await request.get(`/events?index=id&id=1d1d88a8-35aa-11ea-81de-22000b39e366-001&key=${KEY}`);
  expect(res.status).toBe(200);
  done()
});

it('Succeeds to get event by city', async done => {
  // Sends GET Request to /test endpoint
  const res = await request.get(`/events?index=location&city=philadelphia&key=${KEY}`);
  expect(res.status).toBe(200);
  done()
});

it('Succeeds to get event by city with swipe parameter true', async done => {
  // Sends GET Request to /test endpoint
  const res = await request.get(`/events?index=location&city=Philadelphia&page=1&swipe=true&user_id=49jeTln6yNMBVUwUGFAfx9BsQVv1&limit=100&key=${KEY}`);
  expect(res.status).toBe(200);
  done()
});

it('Succeeds to get event by lat/long with swipe parameter true', async done => {
  // Sends GET Request to /test endpoint
  const res = await request.get(`/events?index=location&lat=39.9594667&long=-75.2249542&page=0&swipe=true&user_id=49jeTln6yNMBVUwUGFAfx9BsQVv1&limit=100&key=${KEY}`);
  expect(res.status).toBe(200);
  done()
});
  
it('Succeeds to get random event from database', async done => {
  // Sends GET Request to /test endpoint
  const event = (await eventBySample(1))[0];
  console.log(event);
  expect(event).toBeDefined;
  expect(event.vendor_id).toBeDefined;
  expect(String(event['vendor_id']).length).toBeGreaterThan(0);
  done()
});

// TODO: Add test that checks evnetBySample list length given a sample size

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
  