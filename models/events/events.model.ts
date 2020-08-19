import {eventMongooseInstance as mongoose} from '../../services/mongoose/mongoose.events.service';
import { Document, Model, Mongoose } from 'mongoose';
import Debug from 'debug';
const debug = Debug('events.model');

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
}, );


interface EventDoc extends Document {
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
  position: [Number],
  image_url_full: String,
  image_url_small: String,
  public_action: String,
  event_manager_id: String, // change?
});

const Event = mongoose.model<EventDoc>('Events', eventSchema);

const saveEvent = (eventData: any) => { // saves to database
  const event = eventData;
  //debug(event.venue.position);
  return Event.findOneAndUpdate(
    {vendor_id: event.vendor_id},
    event,
    {upsert: true, setDefaultsOnInsert: true, useFindAndModify: true, new: true},
    function(err: any, doc: any) {
      if (err) {
        debug('here is the error:', err);
        return {error: err};
      }
      debug('succesfully saved');
      //debug(doc);
      return 'Succesfully saved.';
    });
};

const list = (perPage: number, page: number, query?: any) => { // list events
  return new Promise((resolve, reject) => {
    debug(query);
    Event.find(query)
      .limit(perPage)
      .skip(perPage * page)
      .exec(function(err:any, events:any) {
        if (err) {
          debug('here is the error:', err);
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
          debug(err);
          reject(err);
        } else {
          resolve(event);
        }
      });
  });
};

const byLatLong = (lon:number, lat:number, query?:any, radius?:number) => {

  return new Promise((resolve, reject) => {

    //TODO: convert radius into coordinate distance
    query? debug(query) : debug('no query');
    const aggregaton = [
      {
        $geoNear : {
          near: [ lon, lat ] ,
          distanceField: 'dist.calculated',
          maxDistance: radius ? radius : 0.02, //See TODO above
          query:  query? JSON.parse(query):{} ,
          includeLocs: 'dist.location',
          spherical: true
        }
      }
    ];

    Event.aggregate(aggregaton).exec(function(err:any, events:any) {
      if (err) {
        reject(err);
      } else {
        resolve(events);
      }
    });;
  });
}

export {Event, saveEvent, list, byID, byLatLong}; //TODO: Can't we export the whole file?
