const mongoose = require('../../common/services/mongoose.service').mongoose;
const Schema = mongoose.Schema;

const venueSchema = new Schema ({
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

const eventManagerSchema = new Schema ({
    event_id: String,
    users_attended: [String],
    left_swiped_users: [String],
    right_swiped_users: [String],
    upswiped_users: [String],
});

const eventSchema = new Schema({
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