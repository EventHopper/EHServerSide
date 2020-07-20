const mongoose = require('../../common/services/mongoose.service').mongoose;
const Schema = mongoose.Schema;

const eventManagerSchema = new Schema ({
    id: String,
    event_id: String,
    users_attended: [String],
    left_swiped_users: [String],
    right_swiped_users: [String],
    upswiped_users: [String],
});

const EventManager = mongoose.model('EventManager', eventManagerSchema);