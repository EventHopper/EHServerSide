const axios = require("axios");
const constants = require("../apiconstants");
const config = require("../../common/config/env.config");
const eventModel = require("../../events/models/events.model.js");


/***************************************************************************//**
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

exports.aggregateExternalVendor = aggregateExternalVendor;

function aggregateExternalVendor(location) {
  //Construct URL

  let now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1; //January is 0
  var day = now.getDate();
  var date = year.toString() + "-" + ((month < 10) ? '0' + month.toString() : month.toString()) + "-" + ((day < 10) ? '0' + day.toString() : day.toString()) + "T" + now.getHours() + ":00:00z";
  let page_num = 0;

  console.log("date is: " + date);
  
  const api_url =
    constants.ticketmasterURL +
    "stateCode=" +
    location.state +
    "&city=" +
    location.city +
    "&apikey=" +
    config["ticketmaster-consumer-key"] +
    "&startDateTime=" +
    date +
    "&page=";

    console.log(api_url);
  //send http request
  axios.get(api_url + page_num) //TODO: keep iterating the page numbers till the events array is empty
    .then((response) => {
      var events = response.data._embedded.events; //array of event objects
      importToDatabase(events);
    })
    .catch((error) => {
      console.log(error);
    });
};

function importToDatabase(external_events) {
  external_events.forEach((element) => {
    var venue = element._embedded.venues;
    var newEvent = {
      name: element.name,
      details: element.info || "Please swipe right for more info", //some events don't have the info field
      start_date: element.dates.start.dateTime || element.dates.start.localDate , //TODO: timestamp? probably not according to what I read, timestamp not needed here. Date.parse() gives timestamp though
      end_date: null,
      date_created: null,
      expiry_date: null, //FIXME: 
      creator_iD: "TicketMaster", //TODO: use api name or our own internal naming system for the apis?
      organizer: {
        id: null, //TODO: Do we need this? Are we storing external organizers?
        name: "Created by Ticketmaster", //FIXME:
      },
      venue: {
        name: venue[0].name,
        city: venue[0].city.name,
        country: venue[0].country.countryCode, //TODO: parse country codes?
        street: venue[0].address.line1,
        zip: venue[0].postalCode,
        state: venue[0].state.stateCode,
        url: venue[0].url,
        imageURL: venue[0].images ? venue[0].images[0].url : null,
        location: {
          latitude: venue[0].location.latitude,
          longitude: venue[0].location.longitude,
        },
      },
      type: element.classifications[0].segment.name, 
      categories: element.classifications[0].genre.name,
      status: "upcoming", //FIXME: 
      rsvp_required: true, //All ticketmaster events require purchasing events hence rsvp required
      image_url: element.images[0].url, //TODO: explore furthur
      public_action: element.url,
      event_manager_id: null, //TODO: Add later
    };

    console.log(newEvent);

    eventModel.saveEvent(newEvent);
  });
}
