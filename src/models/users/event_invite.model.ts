import {userMongooseInstance as userMongoose} from '../../services/mongoose/mongoose.users.service';
import {eventMongooseInstance as eventMongoose} from '../../services/mongoose/mongoose.events.service';
import { eventSchema } from '../events/events.model';
import Debug from 'debug';
import { Document } from 'mongoose';
import * as UserModel from './users.model';
import { isValidUser } from './user.validation';

const Schema = userMongoose.Schema;

const debug = Debug('event_invite.model');

interface IRSVP extends Partial<Document>{
    recipient_id : String,
    state: Number
  };

const rsvpSchema = new Schema ({
  recipient_id : String,
  state: Number
});

export interface IEventInvite extends Partial<Document> {
  vendor_id: String;
  requester_id: String;
  rsvp: IRSVP[];
}

const EventInviteSchema = new Schema({
  vendor_id: {required: true, type: String, ref: 'Users'},
  requester_id: {required: true, type: String, ref: 'Users'},
  rsvp: {required: true, type: [rsvpSchema]},
}, {timestamps: true, toObject:{virtuals:true}});

EventInviteSchema.set('toObject', { virtuals: true })
EventInviteSchema.set('toJSON', { virtuals: true })
rsvpSchema.set('toObject', { virtuals: true })
rsvpSchema.set('toJSON', { virtuals: true })

rsvpSchema.virtual('recipient',{
  ref: 'Users',
  localField: 'recipient_id',
  foreignField: 'user_id',
  justOne:true
})

EventInviteSchema.virtual('requester',{
  ref: 'Users',
  localField: 'requester_id',
  foreignField: 'user_id',
  justOne:true
})

export const Event = eventMongoose.model('Event', eventSchema);

EventInviteSchema.virtual('event',{
  ref: Event,
  localField: 'vendor_id',
  foreignField: 'vendor_id',
  justOne:true
})

export const EventInvite = userMongoose.model('EventInvites', EventInviteSchema);


// block = -1
// reject = 0 // We forcibly delete in this case
// Pending request = 1
// Accepted request = 2

/****************************************************************************//**
 * @summary updates a user's rsvp state
 * @description updates an event invite doc to accept or decline an invite
 * @param {recipient_id} string id of user who's status we're updating
 * @param {state} string the rsvp state of the recipient
 * @param {event_invite_id} string the id of the event invite doc
 * @return returns operation success result status
 * 
 * ****************************************************************************/
export async function updateEventInviteRsvp(recipient_id:string, state:number, authenticated_user_id:string, event_invite_id:string) { 

  //Check that only the invitee can accept or decline an invite.
  if(authenticated_user_id != recipient_id){
    return {status: 401, userDoc: {}, message: 'Unauthorized user'}; 
  }
  if (!(await isValidUser(recipient_id))){ 
    return {status: 404, userDoc: {}, message: 'Recipient Does Not Exist.'}; 
  }

  let eventInviteUpdateResult =  await new Promise<any>((resolve) => { EventInvite.findOneAndUpdate({_id: event_invite_id, rsvp: {$elemMatch: {recipient_id: recipient_id}}},
    {$set: {'rsvp.$.state': state,}},
  ).then((eventInviteDoc:any)  => {
    debug(eventInviteDoc);
    if (eventInviteDoc != null) {
      resolve({status: 200, eventInviteDoc: eventInviteDoc, message: 'Event Invite Doc Succesfully Updated.'});
    } else {
      resolve({status: 404, eventInviteDoc: {}, message: 'Event Invite Doc Does Not Exist.'});
    }
  }).catch((err)=>{
    return {status: -1, message: 'An error occurred during event invite update:\n '+ err};
  }).catch((err)=>{
    return {status: -1, message: 'An error occurred during event invite update:\n '+ err};
  });

  debug('The result was ' + eventInviteUpdateResult.status +' & state was ' +state);

  return {status: 1, message: 'successfully updated relationship'};
  });
}

/****************************************************************************//**
 * @summary creates an event invite doc 
 * @description creates a new event invite doc and adds recipients to the rsvp array
 * @param {requester_id} string id of user who created the event
 * @param {recipient_ids} [string] ids of users who are invited
 * @param {event_id} string the id of the event 
 * @return returns operation success result status
 * 
 * ****************************************************************************/
export async function createEventInvite(requester_id:string, recipient_ids:string[], authenticated_user_id:string, event_id:string) { 
  // TODO: Check that recipients are friends.

  //Check that only the invitee can accept or decline an invite.
  if(authenticated_user_id != requester_id){
    return {status: 401, userDoc: {}, message: 'Unauthorized user'}; 
  }
  if (!(await isValidUser(requester_id))){ 
    return {status: 404, userDoc: {}, message: 'Recipient Does Not Exist.'}; 
  }
  const rsvpArray:IRSVP[] = [];
  recipient_ids.map(function(id, index) {
    let rsvp : IRSVP = {
      recipient_id : id,
      state: 0,
    }
    rsvpArray.push(rsvp);
  });

  let eventInviteDocument : IEventInvite =  {
    vendor_id: event_id,
    requester_id: requester_id,
    rsvp: rsvpArray,
  }
    
  var doc = new EventInvite(eventInviteDocument);
  let error;
  let result:any = await doc.save().catch((err)=>{
    error = {status: -2, message: 'an error occurred during event invite creation:\n'+ err};
  });

  if (error) return error;

  // TODO: Update user manager with new event invite array.
  return {status: 2, message: 'successfully created event invite', result: result};
}