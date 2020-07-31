const mongoose = require('../../services/mongoose.service').mongoose;
const Schema = mongoose.Schema;

const clientLocationSchema = new Schema({
    country_code: String,
    country: {type: String, required: true},
    city: {type: String, required: true},
    zipcode: String, 
    lat: Number,
    long: Number,
    region: {type: String, required: true},
    region_code: String
 });

 const Location = mongoose.model('Location', clientLocationSchema);

 module.exports = { Location: Location };

 module.exports.saveLocation = (locationData) => { //saves to database
    const location = new Location(locationData);
    // console.log(event);
    return Location.updateOne({city : location.city, 
                            country : location.country, 
                            region : location.region}, location, 
                            {upsert : true, setDefaultsOnInsert: true}, 
                            function(err, doc) {
                                // console.log(doc);
                                // console.log(err);
                            });
};

module.exports.list = () => { //list all locations
    return new Promise((resolve, reject) => {
        Location.find()
            .exec(function (err, locations) {
                if (err) {
                    reject(err);
                } else {
                    resolve(locations);
                }
            })
    });
};