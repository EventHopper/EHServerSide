const aggregator = require("../aggregator/aggregator");
const LocationModel = require("../models/location.model");
const constants = require("../constants");
const { setIntervalAsync } = require('set-interval-async/dynamic');

/***************************************************************************//**
 * EVENT Update Job
 *
 * The Update Job batch updates external events provided by vendor APIs
 * @function update calls event aggregator for each location object in the database
 ******************************************************************************/

 function updateJob() {   
    setIntervalAsync(updateEvents, constants.UPDATE_JOB_INTERVAL);
}
   
async function updateEvents(){ 
    var locations = await LocationModel.list().catch(
        (err) => {
            console.log(err);
        });
    console.log(locations);
    locations.forEach(element => {
        aggregator.aggregate(element);
    });   
    console.log("whats hatnin");
}

exports.updateJob = updateJob;