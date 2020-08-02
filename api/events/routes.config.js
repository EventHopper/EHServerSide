/* eslint-disable max-len */
// import EventController from '.';
// DEPRECATED
const EventController = require('./events.controller');


exports.routesConfig = function(app) {
  app.post('/events', [ // this will be called by the event aggregator, server side
    EventController.insert,
  ]);

  app.get('/allevents', [ // this is will be called client side


    EventController.list, // will add filtering later e.g. by location
  ]);

  // DONE: Create location object from user location
  /* location = {
    country_code: "USA",
    region_name: "PA",
    city: "Philadelphia"
    latitude: ""
    longitude: ""
};  */
};
