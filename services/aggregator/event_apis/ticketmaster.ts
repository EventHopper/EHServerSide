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
 * @host Ticketmster
 * @author Ransford Antwi
 * @module event_aggregator
 *
 * REQUIRED FUNCTIONS
 * @function aggregateExternalVendor returns vendor object
 * @function getEventObjects recursive middle function to access all possible events
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
  let hour: string | number = now.getHours();
  hour = hour < 10 ? '0' + hour : hour;
  const date =
    year.toString() +
    '-' +
    (month < 10 ? '0' + month.toString() : month.toString()) +
    '-' +
    (day < 10 ? '0' + day.toString() : day.toString()) +
    'T' +
    hour +
    ':00:00Z';
  const page_num = 1;

  console.log('date is: ' + date);

  const api_url =
    constants.TICKETMASTER_URL +
    'stateCode=' +
    location.region_code +
    '&city=' +
    location.city +
    '&apikey=' +
    process.env.TICKETMASTER_CONSUMER_KEY +
    '&startDateTime=' +
    date +
    '&page=';

  getEventObjects(api_url, page_num);
}

// recursive http request function
export function getEventObjects(api_url: string, page_num: number) {
  axios.get(api_url + page_num).then(function(response) {
    const events = response.data._embedded ? response.data._embedded.events : null;
    if (events !== null && events.length !== 0) {
      if (settings.LOGGING) {
        console.log('_____________________ NEW PAGE _____________________\n' +
          'API URL: ' +
          api_url +
          page_num +
          '\n___________________________________________________\n');
      }
      importToDatabase(events);
      getEventObjects(api_url, page_num + 1);
    } else {
      console.log('TicketMaster is Done');
    }
  }).catch((error) => {
    if (settings.LOGGING) {
      console.log(error);
    }
  });
}

export function importToDatabase(external_events: any[]) {
  external_events.forEach((element) => {
    const venue = element._embedded.venues;
    const newEvent = {
      name: element.name,
      vendor_id: element.id + '-' + constants.VENDOR_CODE_TICKETMASTER,
      details: element.info || 'Please swipe for more info', // some events don't have the info field
      start_date_utc: element.dates.start.dateTime, // TODO: timestamp? probably not according to what I read, timestamp not needed here. Date.parse() gives timestamp though
      start_date_local: `${element.dates.start.localDate}${element.dates.start.localTime? 'T'+element.dates.start.localTime : ''}`,
      end_date_utc: null,
      end_date_local: null,
      organizer: 'Ticketmaster', // FIXME:
      venue: {
        name: venue[0].name,
        city: venue[0].city.name,
        country_code:
          venue[0].country.countryCode.length === 3 ?
            venue[0].country.countryCode :
            countries.alpha2ToAlpha3(venue[0].country.countryCode),
        street: venue[0].address.line1,
        zip: venue[0].postalCode,
        state: venue[0].state.stateCode,
        url: venue[0].url || null,
        imageURL: venue[0].images ? venue[0].images[0].url : null,
        location: {
          latitude: venue[0].location.latitude,
          longitude: venue[0].location.longitude,
          timezone: venue[0].timezone,
        },
        position:{
          objectType: 'Point',
          coordinates: [venue[0].location.longitude, venue[0].location.latitude],
        },
      },
      category: element.classifications[0].segment.name, // FIXME: See Internal Module #37
      tags: element.classifications[0].genre ? element.classifications[0].genre.name : null, // FIXME: See Internal Module #37
      status: 'upcoming', // FIXME:
      image_url_full: element.images[0].url, // TODO: explore furthur
      // TODO: image_url_small missing
      public_action: element.url,
      event_manager_id: null, // TODO: Add later
    };
    eventModel.saveEvent(newEvent);
  });
}
