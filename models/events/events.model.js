/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import {eventMongooseInstance} from '../../services/mongoose/mongoose.events.service';
const Schema = eventMongooseInstance.Schema;

const venueSchema = new Schema({
  name: String,
  city: String,
  country_code: String,
  street: String,
  zip: String,
  state: String,
  imageURL: String,
  location: {
    latitude: Number,
    longitude: Number,
    timezone: String,
  },
});

const eventSchema = new Schema({
  vendor_id: {type: String, required: true, unique: true},
  name: String,
  details: String,
  start_date_utc: Date,
  start_date_local: Date,
  end_date_utc: Date,
  end_date_local: Date,
  source: String,
  organizer: String,
  venue: venueSchema,
  category: String,
  tags: [String],
  image_url_full: String,
  image_url_small: String,
  public_action: String,
  event_manager_id: String, // change?
});

export const Event = eventMongooseInstance.model('Events', eventSchema);

export function saveEvent(eventData) { // saves to database
  const event = new Event(eventData);
  console.log(event);
  return Event.findOneAndUpdate(
      {useFindAndMondify: true}, {vendor_id: event.vendor_id},
      event,
      {upsert: true, setDefaultsOnInsert: true},
      function(err, doc) {
        console.log(doc);
        if (err) return {error: err};
        return 'Succesfully saved.';
      });
}

export function list(perPage, page) { // list all events
  return new Promise((resolve, reject) => {
    Event.find()
        .limit(perPage)
        .skip(perPage * page)
        .exec(function(err, events) {
          if (err) {
            reject(err);
          } else {
            resolve(events);
          }
        });
  });
}
