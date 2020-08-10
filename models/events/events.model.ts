import {mongoose} from '../../services/mongoose.service'
const Schema = mongoose.Schema;

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


interface EventDoc extends mongoose.Document {
  vendor_id: {type: String, required: true, unique: true},
  name: String,
  details: String,
  start_date_utc: Date,
  start_date_local: Date,
  end_date_utc: Date,
  end_date_local: Date,
  source: String,
  organizer: String,
  venue: typeof venueSchema,
  category: String,
  tags: [String],
  image_url_full: String,
  image_url_small: String,
  public_action: String,
  event_manager_id: String, // change?
}

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

const Event = mongoose.model<EventDoc>('Events', eventSchema);

const saveEvent = (eventData: any) => { // saves to database
  const event = new Event(eventData);
  console.log(event);
  return Event.findOneAndUpdate(
    {vendor_id: event.vendor_id},
    event,
    {upsert: true, setDefaultsOnInsert: true, useFindAndModify: true, new: true},
    function(err: any, doc: any) {
      if (err) {
        console.log('here is the error:', err);
        return {error: err};
      }
      console.log('succesfully saved');
      console.log(doc);
      return 'Succesfully saved.';
    });
};

const list = (perPage: number, page: number) => { // list all events
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
      });
  });
};

export {Event, saveEvent, list};
