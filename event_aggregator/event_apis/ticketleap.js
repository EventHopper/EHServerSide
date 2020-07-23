const axios = require("axios");
const constants = require("../apiconstants");
const config = require("../../common/config/env.config");
const eventModel = require("../../events/models/events.model.js");


/***************************************************************************//**
 * EXTERNAL VENDOR API (EVAPI) Integration
 * @host Ticketleap
 * @author Kyler Mintah
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

  const api_url =
    constants.ticketleapURL +
    location.country_code +
    "/" +
    location.region_name +
    "/" +
    location.city +
    "?key=" +
    config["ticketleap-api-key"] +
    "&dates_after=" +
    date +
    "&page_num=";

  //send http request
  axios.get(api_url + page_num) //TODO: keep iterating the page numbers till the events array is empty
    .then((response) => {
      var events = response.data.events; //array of event objects
      importToDatabase(events);
    })
    .catch((error) => {
      console.log(error);
    });
};

function importToDatabase(external_events) {
  external_events.forEach((element) => {
    var newEvent = {
      name: element.name,
      details: element.description,
      start_date: element.earliest_start_utc, //TODO: timestamp? probably not according to what I read, timestamp not needed here. Date.parse() gives timestamp though
      end_date: element.earliest_end_utc,
      date_created: element.created_utc,
      expiry_date: element.latest_end_utc,
      creator_iD: null, //TODO: remove?
      organizer: {
        id: null, //TODO: Do we need this? Are we storing external organizers?
        name: element.organization_name,
      },
      venue: {
        name: element.venue_name,
        city: element.venue_city,
        country: element.venue_country_code, //TODO: parse country codes?
        street: element.venue_street,
        zip: element.venue_postal_code,
        state: element.venue_region_name,
        location: {
          latitude: null,
          longitude: null,
        },
      },
      type: null, //FIXME: Need to add
      categories: element.hashtag_text ? element.hashtag_text.split(" ") : null, // TODO: Discuss
      status: ["upcoming", "past", "cancelled"], //FIXME: Unsure of ticket leap equivalent
      rsvp_required: null, //FIXME: Unsure of ticket leap equivalent
      image_url:
        element.hero_image_url ||
        element.hero_small_image_url ||
        element.image_url_full, //ACK: hero images never null
      public_action: element.url,
      event_manager_id: null, //FIXME: Unsure of ticket leap equivalent
      permissionLevel: null, //FIXME: Unsure of ticket leap equivalent
    };

    console.log(newEvent);

    eventModel.saveEvent(newEvent);
  });
}
