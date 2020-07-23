const ticketLeap = require("./event_apis/ticketleap");
const ticketMaster = require("./event_apis/ticketmaster");

/***************************************************************************//**
 * EVENT AGGREGATOR
 *
 * The Event Aggregator schedules batch updates external events
 * @param aggregate imports external events into event database
 ******************************************************************************/

function aggregate(location){ 
    //ticketLeap.aggregateExternalVendor(location);
    //ticketMaster.aggregateExternalVendor(location);
}

exports.aggregate = aggregate;