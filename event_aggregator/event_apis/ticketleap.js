const axios = require("axios");
const constants = require("./api-config/apiconstants");
const eventModel = require("../../events/models/events.model.js");
const countries = require("i18n-iso-countries");
require("dotenv").config();

/***************************************************************************//**
 * EXTERNAL VENDOR API (EVAPI) Integration
 * @host Ticketleap
 * @author Ransford Antwi, Kyler Mintah
 * @module event_aggregator
 *
 * REQUIRED FUNCTIONS
 * @function aggregateExternalVendor returns vendor object
 * @function getEventObjects recursive middle function to access all possible events
 * @function importToDatabase saves event page to databse
 *
 * @param location EventHopper location object
 ******************************************************************************/

exports.aggregateExternalVendor = aggregateExternalVendor;

//assembles query and executes aggregation
function aggregateExternalVendor(location) {
  //Construct URL
  var country_code = location.country_code.length === 3 ? location.country_code : countries.alpha2ToAlpha3(location.country_code); 
  let now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1; //January is 0
  var day = now.getDate();
  var date = year.toString() + "-" + month.toString() + "-" + day.toString();

  const api_url =
    constants.TICKETLEAP_URL +
    country_code +
    "/" +
    location.region_code +
    "/" +
    location.city +
    "?key=" +
    process.env.TICKETLEAP_API_KEY +
    "&dates_after=" +
    date +
    "&page_num=";

  console.log(api_url);
  
    var page_num = 1;

    getEventObjects(api_url, page_num);
}

//recursive http request function
function getEventObjects(api_url, page_num) {
    axios.get(api_url+page_num).then(function(response){
        var events = response.data.events;
        importToDatabase(events);
        if(events !== null ){
            getEventObjects(api_url, page_num+1);
        }
    }).catch((error)=>{
        console.log(error);
    });
}

//converts response to event object and updates database
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
        country_code: element.venue_country_code, //countries.alpha2ToAlpha3(element.venue_country_code), 
        street: element.venue_street,
        zip: element.venue_postal_code,
        state: element.venue_region_name,
        location: {
          latitude: null,
          longitude: null,
          timezone: element.venue_timezone,
        },
      },
      category: null, //FIXME: See Internal Module #37
      tags: element.hashtag_text ? element.hashtag_text.split(" ") : null, //FIXME: See Internal Module #37
      image_url_full: element.image_url_full,
      image_url_small: element.hero_image_url || element.hero_small_image_url,
      public_action: element.url,
      event_manager_id: null, //FIXME: To be added
    };

    console.log(newEvent);
    eventModel.saveEvent(newEvent);
  });
}
