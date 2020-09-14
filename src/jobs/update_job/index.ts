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
  setIntervalAsync(updateEvents, constants.UPDATE_JOB_INTERVAL);
}

async function updateEvents() {
  const locations = await list().catch(
    (err) => {
      debug(err);
    });
  debug(locations);
  locations.forEach((element: any) => {
    aggregate(element);
  });
  debug('whats hatnin');
}

const _updateJob = updateJob;
export {_updateJob as updateJob};
