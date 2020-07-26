const axios = require("axios");
const constants = require("./api-config/apiconstants");
const eventModel = require("../../events/models/events.model.js");
const countries = require("i18n-iso-countries");
require("dotenv").config();
/**
 * EXTERNAL VENDOR API (EVAPI) Integration
 * @host Ticketmster
 * @author Ransford Antwi
 * @module event_aggregator
 *
 * REQUIRED FUNCTIONS
 * @function aggregateExternalVendor returns vendor object
 * @function importToDatabase saves aggregated events to databse
 *
 * @param location EventHopper location object
 ******************************************************************************/

/***************************************************************************/ exports.aggregateExternalVendor = aggregateExternalVendor;

function aggregateExternalVendor(location) {
  //Construct URL

  let now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1; //January is 0
  var day = now.getDate();
  var hour = now.getHours();
  hour = hour < 10 ? "0" + hour : hour;
  var date =
    year.toString() +
    "-" +
    (month < 10 ? "0" + month.toString() : month.toString()) +
    "-" +
    (day < 10 ? "0" + day.toString() : day.toString()) +
    "T" +
    hour +
    ":00:00Z";
  let page_num = 1;

  console.log("date is: " + date);

  const api_url =
    constants.TICKETMASTER_URL +
    "stateCode=" +
    location.region_code +
    "&city=" +
    location.city +
    "&apikey=" +
    process.env.TICKETMASTER_CONSUMER_KEY +
    "&startDateTime=" +
    date +
    "&page=";

  console.log(api_url + page_num);
  //send http request
  axios
    .get(api_url + page_num) //TODO: keep iterating the page numbers till the events array is empty
    .then((response) => {
      var events = response.data._embedded.events; //array of event objects
      importToDatabase(events);
    })
    .catch((error) => {
      console.log(error);
    });
}

function importToDatabase(external_events) {
  external_events.forEach((element) => {
    var venue = element._embedded.venues;
    var newEvent = {
      name: element.name,
      vendor_id: element.id + "-" + constants.VENDOR_CODE_TICKETMASTER,
      details: element.info || "Please swipe right for more info", //some events don't have the info field
      start_date_utc:
        element.dates.start.dateTime || element.dates.start.localDate, //TODO: timestamp? probably not according to what I read, timestamp not needed here. Date.parse() gives timestamp though
      end_date_utc: null,
      organizer: "Ticketmaster", //FIXME:
      venue: {
        name: venue[0].name,
        city: venue[0].city.name,
        country_code:
          venue[0].country.countryCode.length === 3
            ? venue[0].country.countryCode
            : countries.alpha2ToAlpha3(venue[0].country.countryCode),
        street: venue[0].address.line1,
        zip: venue[0].postalCode,
        state: venue[0].state.stateCode,
        url: venue[0].url,
        imageURL: venue[0].images ? venue[0].images[0].url : null,
        location: {
          latitude: venue[0].location.latitude,
          longitude: venue[0].location.longitude,
	  timezone: venues[0].timezone,
        },
      },
      category: element.classifications[0].segment.name,
      tags: element.classifications[0].genre.name,
      status: "upcoming", //FIXME:
      image_url_full: element.images[0].url, //TODO: explore furthur
      //TODO: image_url_small missing
      public_action: element.url,
      event_manager_id: null, //TODO: Add later
    };

    console.log(newEvent);

    eventModel.saveEvent(newEvent);
  });
}
