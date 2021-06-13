/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import * as ticketLeap from './event_apis/ticketleap';
import * as ticketMaster from './event_apis/ticketmaster';
/** *************************************************************************//**
 * EVENT AGGREGATOR
 *
 * The Event Aggregator batch updates external events provided by vendor APIs
 * @function aggregate imports external events into event database
 ******************************************************************************/

export function aggregate(location : any) {
  console.log('reached');
  ticketLeap.aggregateExternalVendor(location);
  ticketMaster.aggregateExternalVendor(location);
}

exports.aggregate = aggregate;
