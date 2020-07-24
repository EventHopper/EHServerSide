const axios = require("axios");
const constants = require("./api-config/apiconstants");
const eventModel = require("../../events/models/events.model.js");
require("dotenv").config();

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
    constants.TICKETLEAP_URL +
    location.country_code +
    "/" +
    location.region +
    "/" +
    location.city +
    "?key=" +
    process.env.TICKETLEAP_API_KEY +
    "&dates_after=" +
    date +
    "&page_num=";

  console.log(api_url);

  //send http request
  axios
    .get(api_url + page_num) //TODO: keep iterating the page numbers till the events array is empty
    .then((response) => {
      var events = response.data.events; //array of event objects
      importToDatabase(events);
    })
    .catch((error) => {
      console.log(error);
    });
}

function importToDatabase(external_events) {
  external_events.forEach((element) => {
    var newEvent = {
      vendor_id: element.id+'-'+constants.VENDOR_CODE_TICKETLEAP,
      name: element.name,
      details: element.description,
      start_date_utc: element.earliest_start_utc,
      end_date_utc: element.latest_end_utc,
      source: "Ticketleap", //ticketLeap code
      organizer: element.organization_name,
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
          timezone: element.venue_timezone,
        },
      },
      category: null, //FIXME: Need to add
      tags: element.hashtag_text ? element.hashtag_text.split(" ") : null,
      image_url_full: element.image_url_full,
      image_url_small: element.hero_image_url || element.hero_small_image_url,
      public_action: element.url,
      event_manager_id: null, //FIXME: To be added
    };

    console.log(newEvent);

    eventModel.saveEvent(newEvent);
  });
}
