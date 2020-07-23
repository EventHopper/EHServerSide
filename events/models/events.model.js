const mongoose = require('../../common/services/mongoose.service').mongoose;
const Schema = mongoose.Schema;

const venueSchema = new Schema ({
    name: String,
    city: String,
    country: String,
    street: String,
    zip: String,
    state: String,
    imageURL: String,
    location: {
        latitude: Number,
        longitude: Number,
        timezone: String
    }
});

const eventSchema = new Schema({
    name: String,
    details: String,
    start_date_utc: Date, 
    end_date_utc: Date,
    source: String,
    organizer:String,
    venue : venueSchema,
    category: String,
    tags: [String],
    image_url_full: String,
    image_url_small: String,
    public_action: String,
    event_manager_id: String, //change?
 });

 const Event = mongoose.model('Events', eventSchema);

 module.exports = { Event: Event};

 module.exports.saveEvent = (eventData) => { //saves to database
    const event = new Event(eventData);
    // console.log(event);
    return event.save();
};

exports.list = (perPage, page) => { //list all events
    return new Promise((resolve, reject) => {
        Event.find()
            .limit(perPage)
            .skip(perPage * page)
            .exec(function (err, events) {
                if (err) {
                    reject(err);
                } else {
                    resolve(events);
                }
            })
    });
};