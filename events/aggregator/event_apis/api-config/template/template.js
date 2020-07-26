const axios = require("axios");
const constants = require("../apiconstants");
const config = require("../../common/config/env.config");
const eventModel = require("../../events/models/events.model.js");


/***************************************************************************//**
 * EXTERNAL VENDOR API (EVAPI) Integration
 * @host TODO: Add Vendor Name
 * @author TODO: Add Internal Developer Name(s)
 * @module event_aggregator
 * 
 * REQUIRED FUNCTIONS
 * @function aggregateExternalVendor returns vendor object
 * @function importToDatabase saves aggregated events to databse
 *
 * @param location EventHopper location object
 ******************************************************************************/

exports.aggregateExternalVendor = aggregateExternalVendor;

function aggregateExternalVendor(location) {
  //Construct URL

  let now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1; //January is 0
  var day = now.getDate();
  var date = year.toString() + "-" + month.toString() + "-" + day.toString();
  let page_num = 1; 

  const api_url = null

  //send http request
  axios.get(api_url + page_num) //TODO: keep iterating the page numbers till the events array is empty
    .then((response) => {
      var events = null; //array of event objects
      importToDatabase(events);
    })
    .catch((error) => {
      console.log(error);
    });
};

function importToDatabase(external_events) {
  external_events.forEach((element) => {
    var newEvent = {
      name: null,
      details: null,
      start_date: null, //TODO: timestamp? probably not according to what I read, timestamp not needed here. Date.parse() gives timestamp though
      end_date: null,
      date_created: null,
      expiry_date: null,
      creator_iD: null, //TODO: remove?
      organizer: {
        id: null, //TODO: Do we need this? Are we storing external organizers?
        name: null,
      },
      venue: {
        name: null,
        city: null,
        country: null, //TODO: parse country codes?
        street: null,
        zip: null,
        state: null,
        location: {
          latitude: null,
          longitude: null,
        },
      },
      type: null, //FIXME: Need to add
      categories: null, // TODO: Discuss
      status: null, //FIXME: Unsure of ticket leap equivalent
      rsvp_required: null, //FIXME: Unsure of ticket leap equivalent
      image_url: null,
      public_action: null,
      event_manager_id: null, //FIXME: Unsure of ticket leap equivalent
      permissionLevel: null, //FIXME: Unsure of ticket leap equivalent
    };

    console.log(newEvent);

    eventModel.saveEvent(newEvent);
  });
}