const axios = require("axios");
const constants = require("../apiconstants");
const config = require("../../common/config/env.config");
const eventModel = require("../../events/models/events.model.js");

exports.getTicketLeap = function getTicketLeap(
  country_code,
  region_name,
  city
) {
  //Construct URL

  let now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1; //January is 0
  var day = now.getDate();
  var date = year.toString() + "-" + month.toString() + "-" + day.toString();
  let page_num = 1;

  const url =
    constants.ticketleapURL +
    country_code +
    "/" +
    region_name +
    "/" +
    city +
    "?key=" +
    // config["ticketleap-api-key"] +
    2912304204111641 +
    "&dates_after=" +
    date +
    "&page_num=" +
    page_num;

  console.log(url);

  //send http request
  axios
    //TODO: keep iterating the page numbers till the events array is empty
    .get(url + page_num)
    .then((response) => {
      var events = response.data.events; //array of event objects
      // console.log(events);
      // console.log(url + page_num);

      saveTicketLeapEvents(events);
    })
    .catch((error) => {
      console.log(error);
    });
};

function saveTicketLeapEvents(external_events) {
  external_events.forEach((element) => {
    var newEvent = {
      name: element.name,
      details: element.description,
      event_start_utc: element.earliest_start_utc,
      event_end_utc: element.latest_end_utc,
      source: "TicketLeap",
      organizer: element.organization_name,
      venue: {
        name: element.venue_name,
        city: element.venue_city,
        country: element.venue_country_code, //TODO: Parse Country Code?
        street: element.venue_street,
        zip: element.venue_postal_code,
        state: element.venue_region_name,
        location: {
          latitude: null,
          longitude: null,
          timezone: element.venue_timezone,
        },
      },
      category: null,
      tags: element.hashtag_text ? element.hashtag_text.split(" ") : null,
      image_url_full: element.image_url_full,
      image_url_small:
        element.image_url_small ||
        element.hero_image_url ||
        element.hero_small_image_url,
      public_action: element.url,
      event_manager_id: null, //FIXME: AutoGenerate
    };

    console.log(newEvent);

    eventModel.saveEvent(newEvent);
  });
}
