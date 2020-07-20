const mongoose = require('../../common/services/mongoose.service').mongoose;
const Schema = mongoose.Schema;

const venueSchema = new Schema ({
    id: String,
    name: String,
    city: String,
    country: String,
    zip: String,
    state: String,
    location: [{
        latitude: Number,
        longitude: Number
    }]
});

const eventSchema = new Schema({
    id: String, //TODO: overwrite _id?
    name: String,
    details: String,
    start_date: Date, //TODO: timestamp?
    end_date: Date,
    date_created: Date,
    expiry_date: Date,
    creator_iD: String, //TODO: remove?
    organizer: [{
        id: String,
        name: String
    }],
    venue : [venueSchema],
    type: String,
    category: String, // remove?
    status: ['upcoming', 'past', 'cancelled'],
    rsvp_required: Boolean,
    image_url: String,
    public_action: String,
    event_manager_id: String, //change?
    permissionLevel: Number
 });

 const Event = mongoose.model('Events', eventSchema);