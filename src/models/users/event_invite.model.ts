import {userMongooseInstance as userMongoose} from '../../services/mongoose/mongoose.users.service';
import {eventMongooseInstance as eventMongoose} from '../../services/mongoose/mongoose.events.service';
import { eventSchema } from '../events/events.model';
import Debug from 'debug';
import { Document } from 'mongoose';
import * as UserModel from './users.model';
import { isValidUser } from './user.validation';

const Schema = userMongoose.Schema;

const debug = Debug('event_invite.model');

interface IRSVP extends Document{
    rsvp: [{
        recipient_id : String,
        state: Number
    },]
  };

const rsvpSchema = new Schema ({
  rsvp: [{
    recipient_id : {type: String, required: true},
    state: Number
  },]
});

export interface IEventInvite extends Partial<Document> {
  event_id: String;
  requester_id: String;
  rsvp: IRSVP;
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
 * @description updates an event invite doc
 * @param {requester_id} string id of user who initiated the invite.
 * @param {recipient_id} string id of user who's status we're updating
 * @param {state} string the rsvp state of the recipient
 * @param {event_invite_id} string the id of the event invite doc
 * @return returns operation success result status
 * 
 * ****************************************************************************/
export async function updateEventInviteRsvp(requester_id:string, recipient_id:string, state:number, authenticated_user_id:string, event_invite_id:string) { 

  //Check that only the subjects of the relationship document can edit that document.
  if(!(authenticated_user_id == requester_id || authenticated_user_id == recipient_id || authenticated_user_id == 'Fordo')){
    return {status: 401, userDoc: {}, message: 'Unauthorized user'}; 
  }
  if (!(await isValidUser(requester_id))) {
    return {status: 404, userDoc: {}, message: 'Requester Does Not Exist.'}; 
  }
  if (!(await isValidUser(recipient_id))){ 
    return {status: 404, userDoc: {}, message: 'Recipient Does Not Exist.'}; 
  }

  if(requester_id == authenticated_user_id && state == 2){
    return {status: 401, userDoc: {}, message: 'Requestor cannot accept an invite on behalf of someone'}; 
  }
  // Check if event invite exists

  var entry = {'recipient_id' : recipient_id, 'state' : state};
  let eventUpdateResult =  await new Promise<any>((resolve) => { 
    EventInvite.findOneAndUpdate(
      {_id: event_invite_id
      },
      {useFindAndModify: false, new: true},
    ).then((userRelationshipDoc:any)  => {
      debug(userRelationshipDoc);
      if (userRelationshipDoc != null) {
        resolve({status: 200, userDoc: userRelationshipDoc, message: 'User Relationship Succesfully Updated.'});
      } else {
        resolve({status: 404, userDoc: {}, message: 'User Relationship Does Not Exist.'});
      }
    }).catch((err)=>{
      return {status: -1, message: 'An error occurred during relationship update:\n '+ err};
    })
  }).catch((err)=>{
    return {status: -1, message: 'An error occurred during relationship update:\n '+ err};
  })

  debug('The result was ' + relationshipUpdateResult.status +' & state was ' +state);

  // If the status of the update is a 0 (which is considered a request rejection) then delete the relationship document
  if (relationshipUpdateResult.status == 200 && state == 0) {
    const document_id = relationshipUpdateResult.userDoc._id;
    debug(await UserRelationship.deleteOne({_id: document_id}, {}, ((err)=>{
      debug(err);
    })).then(async ()=> {
      // Once deleted, we must remove the relationship from the list of each user
      const removalQuery = {$pull : {relationships: String(document_id)}};
      await UserModel.updateUser('', removalQuery, requester_id);
      await UserModel.updateUser('', removalQuery, recipient_id);
    }).catch((err)=>{
      return {status: -2, message: 'An error occurred during relationship deletion:\n '+ err};
    }));
    
    return {status: 2, message: 'successfully deleted relationship'};

  }
  
  // If relationship does not already exist, we create one

  if (( relationshipUpdateResult.status) == 404 && state != 0) {

    var userRelationshipDocument : IUserRelationship =  {
      requester_id: requester_id,
      recipient_id: recipient_id,
      state: state,
    }
    
    var doc = new UserRelationship(userRelationshipDocument);
    let error;
    let result:any = await doc.save().catch((err)=>{
      error = {status: -2, message: 'an error occurred during relationship creation:\n'+ err};
    });

    if (error) return error;

    // console.log(JSON.stringify(result));

    const update = {$addToSet : {relationships: String(result._id)}};

    await UserModel.updateUser('', update, requester_id);
    await UserModel.updateUser('', update, recipient_id);

    return {status: 2, message: 'successfully created relationship'};

  }
  
  return {status: 1, message: 'successfully updated relationship'};

};

/****************************************************************************//**
 * @summary gets a list of user relationships for a given user_id
 * @description updates a user relationship data through 
 * @param {requester_id} string id of user who requested relationship
 * @param {recipient_id} string id of user who recieved relationship request
 * @param {state} string user relationship state code
 * @return returns operation success result status
 * 
 * ****************************************************************************/
export async function getUserRelationshipList(user_id:string, state:number) { // saves to database

  let userRelationshipIDs = (await UserModel.getUserData(undefined,undefined,user_id))['relationships'];

  let userRelationshipList = (await UserRelationship.find({
    $and:
     [ 
       {'_id' : {'$in' : userRelationshipIDs}}, 
       {state: state},
     ]
  })
    .populate('recipient', 'full_name image_url username')
    .populate('requester', 'full_name image_url username')
    .exec()
    .catch());

  debug(userRelationshipList)

  if (userRelationshipList) return {status: 200, relationship_list: userRelationshipList}
  else return {status: 400, relationship_list: null}

}

/****************************************************************************//**
 * @summary gets a user relationships for a given two users
 * @description updates a user relationship data through 
 * @param {userid_a} string id of user 1
 * @param {userid_b} string id of user 2
 * @return returns operation success result status
 * 
 * ****************************************************************************/
export async function getUserRelationship(userid_a:string, userid_b:string) { // saves to database

  let userRelationship = (await UserRelationship.find({
    $or: 
        [
          { requester_id: userid_a, recipient_id: userid_b }, // This or....
          { requester_id: userid_b, recipient_id: userid_a }, // The inverse
        ]
     
  })
    .exec()
    .catch());

  // console.log(userRelationship)

  if (userRelationship) return {status: 200, relationship: userRelationship}
  else return {status: 400, relationship: null}

}