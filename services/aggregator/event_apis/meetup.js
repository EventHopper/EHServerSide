const axios = require("axios");
const constants = require("./api-config/apiconstants");
const eventModel = require("../../events/models/events.model.js");

/***************************************************************************//**
 * EXTERNAL VENDOR API (EVAPI) Integration
 * @host MeetUp
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
    console.log(newEvent);
    eventModel.saveEvent(newEvent);
  });
}