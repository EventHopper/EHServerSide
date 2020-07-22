const mongoose = require('../../common/services/mongoose.service').mongoose;
const Schema = mongoose.Schema;

const venueSchema = new Schema ({
    name: String,
    city: String,
    country: String,
    street: String,
    zip: String,
    state: String,
    location: [{ //TODO: Discuss: does not need to be an array is single location
        latitude: Number,
        longitude: Number
    }]
});

const eventSchema = new Schema({
    name: String,
    details: String,
    start_date: Date, //TODO: timestamp?
    end_date: Date,
    date_created: Date,
    expiry_date: Date,
    creator_iD: String, //TODO: remove?
    organizer: [{ //TODO: Discuss: does not need to be an array is single organizer
        id: String,
        name: String
    }],
    venue : [venueSchema],
    type: String,
    categories: [String],
    status: ['upcoming', 'past', 'cancelled'],
    rsvp_required: Boolean,
    image_url: String,
    public_action: String,
    event_manager_id: String, //change?
    permissionLevel: Number
 });

 const Event = mongoose.model('Events', eventSchema);

 exports.saveEvent = (eventData) => { //saves to database
    const event = new Event(eventData);
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