/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable require-jsdoc */
import axios from 'axios';
import {default as constants} from './api-config/apiconstants'
import * as eventModel from '../../../models/events/events.model';
import * as countries from 'i18n-iso-countries';
import * as config from '../../../common/utils/config';
import {default as settings} from '../config';
const logging = false;
/** *************************************************************************//**
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

// exports.aggregateExternalVendor = aggregateExternalVendor;

export function aggregateExternalVendor(location: any) {
  // Construct URL

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // January is 0
  const day = now.getDate();
  const date = year.toString() + '-' + month.toString() + '-' + day.toString();
  const page_num = 1;

  const api_url = null;

  // send http request
  axios.get(api_url + page_num) // TODO: keep iterating the page numbers till the events array is empty
    .then((response) => {
      const events = null; // array of event objects
      importToDatabase(events);
    })
    .catch((error) => {
      console.log(error);
    });
};

function importToDatabase(external_events) {
  external_events.forEach((element) => {
    console.log(element);
    eventModel.saveEvent(element);
  });
}
