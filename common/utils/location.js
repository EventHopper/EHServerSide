const NodeGeocoder = require('node-geocoder');
require("dotenv").config();


/****************************************************************************
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


 /*Init Geocoder  */
const options = {
    provider: 'google',  
    // Optional depending on the providers
   // fetch: customFetchImplementation,
    apiKey: process.env.GOOGLE_GEOCODING_API_KEY,
    formatter: null // 'gpx', 'string', ...
  };
const geocoder = NodeGeocoder(options);

async function constructLocation(latitude, longitude){    
    const res = await geocoder.reverse({ lat: latitude, lon: longitude }).catch((err) => {
        console.log('error: ' + err);
      });     
      if (res) {
          var result = res[0];
          var location = {
            country_code: result.countryCode,
            country: result.country,
            city: result.city,
            zipcode: result.zipcode,
            lat: result.latitude,
            long: result.longitude,
            region: result.administrativeLevels ? (result.administrativeLevels.level1long ? result.administrativeLevels.level1long : null) : null,
            region_code: result.administrativeLevels ? (result.administrativeLevels.level1short ? result.administrativeLevels.level1short : null) : null
          };       
          console.log(res);

          return location;
      }
}

exports.constructLocation = constructLocation;