/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
// import EventController from '.';
// DEPRECATED
const EventController = require('./events.controller');
// import EventController from '../events/events.controller';
import express from 'express';


export const routesConfig = function(app:express.Application) {
  app.post('/events', [ // called by the event aggregator, serverside
    EventController.insert,
  ]);
  app.get('/allevents', [ // this is will be called client side
    EventController.list, // will add filtering later e.g. by location
  ]);

  app.get('/hallo', // this is will be called client side
      (req, res) => {
        res.json({'Hell naw': 'to the nah nah nah. Hell to the nah'});
      }, // will add filtering later e.g. by location
  );

  /* DONE: Create location object from user location
    /*location = {
    country_code: "USA",
    region_name: "PA",
    city: "Philadelphia"
    latitude: ""
    longitude: ""
};  */
};
