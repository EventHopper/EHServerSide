/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
import {aggregate} from '../../services/aggregator/aggregator';
import {list} from '../../models/location/location.model';
import {default as constants} from './constants';
import {setIntervalAsync} from 'set-interval-async/dynamic';
import Debug from 'debug';
const debug = Debug('update.job.index'); 

/** *************************************************************************//**
 * EVENT Update Job
 *
 * The Update Job batch updates external events provided by vendor APIs
 * @function updateJob initiates timed cycle of updateEvents() calls
 * @function updateEvents calls event aggregator for each location object in the database
 ******************************************************************************/

function updateJob() {
  setIntervalAsync(updateEvents, 10);
  // updateEvents();
}

async function updateEvents() {
  // const locations = 
  
  // await list().catch(
  //   (err) => {
  //     debug(err);
  //   });
  // debug(locations);

  
  const locationArray = [
    {
      city: 'Chicago',
      country: 'United States of America',
      region: 'null',
      country_code: 'US',
      region_code:'IL'
    },
    {
      city: 'Philadelphia',
      country: 'United States of America',
      region: 'null',
      country_code: 'US',
      region_code:'PA'
    },
    {
      city: 'New York',
      country: 'United States of America',
      region: 'null',
      country_code: 'US',
      region_code:'NY'
    }
    ,
    {
      city: 'Dallas',
      country: 'United States of America',
      region: 'null',
      country_code: 'US',
      region_code:'TX'
    }
    ,
    {
      city: 'Boston',
      country: 'United States of America',
      region: 'null',
      country_code: 'US',
      region_code:'MA'
    }
    ,
    {
      city: 'Los Angeles',
      country: 'United States of America',
      region: 'null',
      country_code: 'US',
      region_code:'LA'
    },  
  ];

  locationArray.forEach((element: any) => {
    debug('aggregating ' + element.city);
    aggregate(element);
  });
  debug('whats hatnin');
}

const _updateJob = updateJob;
export {_updateJob as updateJob};
