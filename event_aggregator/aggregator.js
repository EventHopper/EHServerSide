const ticketLeap = require("./event_apis/ticketleap");
const ticketMaster = require("./event_apis/ticketmaster");

/***************************************************************************//**
 * EVENT AGGREGATOR
 *
 * The Event Aggregator batch updates external events provided by vendor APIs
 * @param aggregate imports external events into event database
 ******************************************************************************/

function aggregate(location){ 
    // ticketLeap.aggregateExternalVendor(location);
    ticketMaster.aggregateExternalVendor(location);
}

exports.aggregate = aggregate;