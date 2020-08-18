/* eslint-disable camelcase */
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
import axios from 'axios';
import {default as constants} from './api-config/apiconstants'
import * as eventModel from '../../../models/events/events.model';
import * as countries from 'i18n-iso-countries';
import * as config from '../../../common/utils/config';
import {default as settings} from '../config';
const logging = false;
/** *************************************************************************//**
 * EXTERNAL VENDOR API (EVAPI) Integration
 * @host Ticketleap
 * @author Ransford Antwi, Kyler Mintah, Batchema Sombie
 * @module event_aggregator
 *
 * REQUIRED FUNCTIONS
 * @function aggregateExternalVendor returns vendor object
 * @function getEventObjects recursive middle function to access all possible events
 * @function importToDatabase saves event page to databse
 *
 * @param location EventHopper location object
 ******************************************************************************/

// exports.aggregateExternalVendor = aggregateExternalVendor;

// assembles query and executes aggregation
export function aggregateExternalVendor(location: any) {
  // Construct URL
  const country_code = location.country_code.length === 3 ? location.country_code : countries.alpha2ToAlpha3(location.country_code);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // January is 0
  const day = now.getDate();
  const date = year.toString() + '-' + month.toString() + '-' + day.toString();

  const api_url =
    constants.TICKETLEAP_URL +
    country_code +
    '/' +
    location.region_code +
    '/' +
    location.city +
    '?key=' +
    config.TICKETLEAP_API_KEY +
    '&dates_after=' +
    date +
    '&page_num=';

  const page_num = 1;

  getEventObjects(api_url, page_num);
}

// recursive http request function
export function getEventObjects(api_url: string, page_num: number) {
  axios.get(api_url + page_num).then(function(response) {
    const events = response.data.events;
    if (events.length !== 0) {
      if (settings.LOGGING) {
        console.log('_____________________ NEW PAGE _____________________\n' +
          'API URL: ' +
          api_url +
          page_num +
          '\n___________________________________________________\n');
      }
      importToDatabase(events);
      getEventObjects(api_url, page_num + 1);
    }else {
      console.log('TicketLeap is Done');
    }
  }).catch((error) => {
    if (settings.LOGGING) {
      console.log(error);
    }
  });
}

// converts response to event object and updates database
export function importToDatabase(external_events: any[]) {
  external_events.forEach((element) => {
    const newEvent = {
      vendor_id: element.id + '-' + constants.VENDOR_CODE_TICKETLEAP,
      name: element.name,
      details: element.description,
      start_date_utc: element.earliest_start_utc,
      start_date_local: element.earliest_start_local,
      end_date_utc: element.latest_end_utc,
      end_date_local: element.latest_end_local,
      source: 'Ticketleap', // ticketLeap code
      organizer: element.organization_name,
      venue: {
        name: element.venue_name,
        city: element.venue_city,
        country_code: element.venue_country_code, // countries.alpha2ToAlpha3(element.venue_country_code),
        street: element.venue_street,
        zip: element.venue_postal_code,
        state: element.venue_region_name,
        location: {
          latitude: null, // TODO: Convert location to lat and long
          longitude: null,
          timezone: element.venue_timezone,
        },
      },
      position: [], //TODO: 
      category: null, // FIXME: See Internal Module #37
      tags: element.hashtag_text ? element.hashtag_text.split(' ') : null, // FIXME: See Internal Module #37
      image_url_full: element.image_url_full,
      image_url_small: element.hero_image_url || element.hero_small_image_url,
      public_action: element.url,
      event_manager_id: null, // FIXME: To be added
    };

    // console.log(newEvent);
    eventModel.saveEvent(newEvent);
  });
}
