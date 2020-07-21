const config = require('../common/config/env.config');
const constants = require('./apiconstants');
const axios = require('axios');

function aggregate(location){ 
    return getTicketleap(location.country_code, location.region_name, location.city);
}

function getTicketleap(country_code, region_name, city){
    //Construct URL

    let now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1; //January is 0
    var day = now.getDate();
    var date = year.toString() + '-' + month.toString() + '-' +  day.toString();
    let page_num = 1;
    
    const url = constants.ticketleapURL + country_code + '/' + region_name + '/' + city + "?key=" + config["ticketleap-api-key"] + "&dates_after=" + date + "&page_num=";
    
    //send http request
    axios.get(url + page_num) //TODO: keep iterating the page numbers till the events array is empty
        .then(response => {
            var events = response.data.events; //array of event objects
            console.log(events);
        })
        .catch(error => {
             console.log(error);
  });
};

exports.aggregate = aggregate;