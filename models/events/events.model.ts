import {eventMongooseInstance as mongoose} from '../../services/mongoose/mongoose.events.service';
import { MongooseDocument, Model, Mongoose } from 'mongoose';

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
  position: {
    objectType: String,
    coordinates: [Number]
  },
});


interface EventDoc extends MongooseDocument {
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

const Event = mongoose.model('Events', eventSchema);

const saveEvent = (eventData: any) => { // saves to database
  const event = eventData;
  //console.log(event.venue.position);
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
      //console.log(doc);
      return 'Succesfully saved.';
    });
};

const list = (perPage: number, page: number, query?: Object) => { // list events
  return new Promise((resolve, reject) => {
    console.log(query);
    Event.find(query)
      .limit(perPage)
      .skip(perPage * page)
      .exec(function(err:any, events:any) {
        if (err) {
          console.log('here is the error:', err);
          return {error: err};
        } else {
          resolve(events);
        }
      });
  });
};


const byID = (idParam: string) => { // find event by ID
  return new Promise((resolve, reject) => {
    Event.find({_id:idParam})
      .exec(function(err:any, event:any) {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(event);
        }
      });
  });
};

export {Event, saveEvent, list, byID}; //TODO: Can't we export the whole file?
