import {eventMongooseInstance as mongoose} from '../../services/mongoose/mongoose.events.service'
import { Document, Schema} from 'mongoose';
import Debug from 'debug';
const debug = Debug('events_manager.model');

//const Schema = mongoose.Schema;

 interface IEventManager extends Document {
  event_id: string,
  users_attended: string[],
  left_swipe: string[],
  right_swiped_users: string[],
  up_swipe: string[],
  log_url: string,
  conversions: string[]
}

const EventManagerSchema = new Schema({
  event_id: {type: String, required: true, unique: true},
  users_attended: [String],
  left_swipe: [String],
  right_swiped_users: [String],
  up_swipe: [String],
  log_url: String,
  conversions: [String]
});

export const EventManager = mongoose.model<IEventManager>('EventManager', EventManagerSchema);

export const initializeEventManager = async (eventID: string) => { // saves to database
  const manager:any = {
    event_id: eventID,
    users_attended: [],
    left_swipe: [],
    right_swiped_users: [],
    up_swipe: [],
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

export const updateEventManager = async (eventID: string, updateFields: any) => { // saves to database
  
  let result:any;
  let update_1 = { $push: updateFields};
  let update_2 = {log_url : 'fordo', $push: updateFields};
  let fieldsUpdate = updateFields.log_url ? update_2 : update_1;

  await EventManager.findOneAndUpdate(
    {event_id: eventID},
    fieldsUpdate,
    {setDefaultsOnInsert: true, useFindAndModify: true, new: true},
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

/*
PersonModel.update(
    { _id: person._id }, 
    { $push: { friends: friend, } },
    done
);  */