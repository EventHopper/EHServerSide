const config = require('../common/config/env.config');
const constants = require('./apiconstants');
const axios = require('axios');

function aggregate(location){
    return 0;
}

function getTicketleap(country_code, region_name, city){
    //Construct URL

    let now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1; //January is 0
    var day = now.getDate();
    var date = year.toString() + '-' + month.toString() + '-' +  day.toString();
    let page_num = 1;
    
    const url = constants.ticketleapURL + country_code + '/' + region_name + '/' + city + "?key=" + config["ticketleap-api-key"] + "&dates_after=" + date;
    var pagedURL = url + "&page_num=" + page_num;
    console.log(pagedURL);
    //send http request
    axios.get(pagedURL) //TODO: keep iterating the page numbers till the events array is empty
        .then(response => {
            console.log(response);
        })
        .catch(error => {
             console.log(error);
  });
};

exports.aggregate = aggregate;
exports.ticketleap = getTicketleap;