// import EventController from '.';
// DEPRECATED
const EventController = require('./events.controller');


exports.routesConfig = function(app) {
  app.post('/events', [ // called by the event aggregator, serverside
    EventController.insert,
  ]);
  app.get('/allevents', [ // this is will be called client side
    EventController.list, // will add filtering later e.g. by location
  ]);

  /* DONE: Create location object from user location
    /*location = {
    country_code: "USA",
    region_name: "PA",
    city: "Philadelphia"
    latitude: ""
    longitude: ""
};  */
};
