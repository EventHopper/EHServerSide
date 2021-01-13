import {eventMongooseInstance as mongoose} from '../../services/mongoose/mongoose.events.service'
import { Document, Schema} from 'mongoose';
import Debug from 'debug';
const debug = Debug('events_manager.model');

//const Schema = mongoose.Schema;

 interface IEventManager extends Document {
  event_id: string,
  users_attended: string[],
  event_left_swipe: [String],
  event_right_swipe: [String],
  event_up_swipe: [String],
  log_url: string,
  conversions: string[]
}

const EventManagerSchema = new Schema({
  event_id: {type: String, required: true, unique: true},
  users_attended: [String],
  event_left_swipe: [String],
  event_right_swipe: [String],
  event_up_swipe: [String],
  log_url: String,
  conversions: [String]
});

export const EventManager = mongoose.model<IEventManager>('EventManager', EventManagerSchema);

export const initializeEventManager = async (eventID: string) => { // saves to database
  const manager:any = {
    event_id: eventID,
    users_attended: [],
    event_left_swipe: [],
    event_right_swipe: [],
    event_up_swipe: [],
    log_url: '',
    conversions: []  
  } ;
  const eventManager:IEventManager = manager;
  let result:any;
  await EventManager.findOneAndUpdate(
    {event_id: eventID},
    eventManager,
    {upsert: true, setDefaultsOnInsert: true, useFindAndModify: true, new: true},
    function(err: any, doc: any) {
      if (err) {
        console.log('error in manager: ', err);
        debug('here is the error:', err);
        result = {error: err};
      }
      debug('succesfully saved event manager');
      //console.log(doc._id);
      result = doc._id;
    });
  return result;
};

export const updateEventManager = async (event_id: string, updateFields: any) => { // saves to database
  
  let result:any;
  let update_1 = { $addToSet: updateFields}; //for updating arrays
  let fieldsUpdate = updateFields.log_url ? {log_url: updateFields.log_url} : update_1;

  await EventManager.findOneAndUpdate(
    {event_id: event_id},
    fieldsUpdate,
    {setDefaultsOnInsert: true, useFindAndModify: true, new: true},
    function(err: any, doc: any) {
      if (err) {
        console.log('error in manager: ', err);
        debug('here is the error:', err);
        result = {error: err};
      }
      debug('succesfully updated event manager');
      //console.log(doc._id);
      result = doc._id;
    });
  return result;
}; 

export const updateEventManagerUserList = async (event_id: string, update_fields: any, list_type: String) => { // saves to database
  const list_types = ['event_left_Swipe', 'event_up_swipe', 'event_right_swipe'];
  let result:any;
  let update_1 = { $addToSet: update_fields}; //for updating arrays
  let update_2 = { $pull: update_fields}; //for ensuring arrays do not hold duplicates

  await EventManager.findOneAndUpdate(
    {event_id: event_id},
    update_1,
    {setDefaultsOnInsert: true, useFindAndModify: true, new: true},
    function(err: any, doc: any) {
      if (err) {
        console.log('error in manager: ', err);
        debug('here is the error:', err);
        result = {error: err};
      }
      debug('succesfully updated event manager');
      //console.log(doc._id);
      result = doc._id;
    });

  list_types.forEach((value)=>{
    if ( value != list_type) {
      EventManager.findOneAndUpdate(
        {event_id: event_id},
        update_2,
        {setDefaultsOnInsert: true, useFindAndModify: true, new: true},
        function(err: any, doc: any) {
          if (err) {
            console.log('error in manager: ', err);
            debug('here is the error:', err);
            result = {error: err};
          }
          debug('succesfully updated user manager');
      
          //console.log(doc._id);
          result = doc._id;
        }) 
    } else{ return; }
  })

}; 
