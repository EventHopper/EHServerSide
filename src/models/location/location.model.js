/* eslint-disable max-len */
import {eventMongooseInstance} from '../../services/mongoose/mongoose.events.service';
import Debug from 'debug';

const debug = Debug('location.model');
const Schema = eventMongooseInstance.Schema;

const clientLocationSchema = new Schema({
  country_code: String,
  country: {type: String, required: true},
  city: {type: String, required: true},
  zipcode: String,
  lat: Number,
  long: Number,
  region: {type: String, required: true},
  region_code: String,
});

const Location = eventMongooseInstance.model('Location', clientLocationSchema);

export const Location = Location;

export function saveLocation(locationData) { // saves to database
  const location = new Location(locationData);
  // debug(event);
  return Location.updateOne({city: location.city,
    country: location.country,
    region: location.region}, location,
  {upsert: true, setDefaultsOnInsert: true},
  function(err, doc) {
    // debug(doc);
    // debug(err);
  });
}

export function list() { // list all locations
  return new Promise((resolve, reject) => {
    Location.find()
      .exec(function(err, locations) {
        if (err) {
          reject(err);
        } else {
          resolve(locations);
        }
      });
  });
}
