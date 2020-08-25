/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
import {aggregate} from '../../services/aggregator/aggregator';
import {list} from '../../models/location/location.model';
import {default as constants} from './constants';
import {setIntervalAsync} from 'set-interval-async/dynamic';

/** *************************************************************************//**
 * EVENT Update Job
 *
 * The Update Job batch updates external events provided by vendor APIs
 * @function updateJob initiates timed cycle of updateEvents() calls
 * @function updateEvents calls event aggregator for each location object in the database
 ******************************************************************************/

function updateJob() {
  setIntervalAsync(updateEvents, constants.UPDATE_JOB_INTERVAL);
}

async function updateEvents() {
  const locations = await list().catch(
    (err) => {
      console.log(err);
    });
  console.log(locations);
  locations.forEach((element: any) => {
    aggregate(element);
  });
  console.log('whats hatnin');
}

const _updateJob = updateJob;
export {_updateJob as updateJob};
