const ticketLeap = require("./event_apis/ticketleap");
const ticketMaster = require("./event_apis/ticketmaster");

function aggregate(location){ 
    //return ticketLeap.getTicketLeap(location.country_code, location.region_name, location.city);
   return ticketMaster.getTicketMaster(location.region_name, location.city);

}

exports.aggregate = aggregate;
