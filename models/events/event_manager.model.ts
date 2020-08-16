import {eventMongooseInstance as mongoose} from '../../services/mongoose/mongoose.events.service'

const Schema = mongoose.Schema;

const eventManagerSchema = new Schema({
  event_id: String,
  users_attended: [String],
  left_swiped_users: [String],
  right_swiped_users: [String],
  upswiped_users: [String],
});

const EventManager = mongoose.model('EventManager', eventManagerSchema);
