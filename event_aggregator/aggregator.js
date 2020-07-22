const ticketLeap = require("./event_apis/ticketleap");

function aggregate(location) {
  return ticketLeap.getTicketLeap(
    location.country_code,
    location.region_name,
    location.city
  );
}

function aggregate(location){ 
    return ticketLeap.getTicketLeap(location.country_code, location.region_name, location.city);
}


//ehen
exports.aggregate = aggregate;
//dummy remove later
