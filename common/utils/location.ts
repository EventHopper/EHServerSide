/* eslint-disable require-jsdoc */
import nodeGeocoder, {Geocoder} from 'node-geocoder';
import Debug from 'debug';
const debug = Debug('location');
require('dotenv').config();

/* ***************************************************************************
 * Timezone and location object Integration
 * @provider Google
 * @author Ransford Antwi
 * @module utils
 *
 * REQUIRED FUNCTIONS
 * @function constructLocation returns Event Hopper Location object
 *
 * @param latitude
 * @param longitude
 ******************************************************************************/


/* Init Geocoder  */
const options : nodeGeocoder.Options = {
  provider: 'google',
  // Optional depending on the providers
  // fetch: customFetchImplementation,
  apiKey: process.env.GOOGLE_GEOCODING_API_KEY,
  formatter: null, // 'gpx', 'string', ...
};
const geocoder = nodeGeocoder(options);

export async function constructLocation(latitude: number, longitude:number) {
  const res = await geocoder.reverse({ lat: latitude, lon: longitude })
    .catch((err) => {
      debug('error: ' + err);
    });
  if (res) {
    const result = res[0];
    const location = {
      country_code: result.countryCode,
      country: result.country,
      city: result.city,
      zipcode: result.zipcode,
      lat: result.latitude,
      long: result.longitude,
      region: result.administrativeLevels ?
        (result.administrativeLevels.level1long ?
          result.administrativeLevels.level1long : null) : null,
      region_code: result.administrativeLevels ?
        (result.administrativeLevels.level1short ?
          result.administrativeLevels.level1short : null) : null,
    };
    debug(res);

    return location;
  }
}
