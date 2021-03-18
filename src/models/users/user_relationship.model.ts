import {userMongooseInstance as userMongoose} from '../../services/mongoose/mongoose.users.service';
import Debug from 'debug';
import { Document } from 'mongoose';
import * as UserModel from './users.model';
import { isValidUser } from './user.validation';

const Schema = userMongoose.Schema;
const debug = Debug('user_relationship.model');

export interface IUserRelationship extends Partial<Document> {
  requester_id: String;
  recipient_id: String;
  state: Number;
}

const UserRelationshipSchema = new Schema({
  requester_id: {required: true, type: String, ref: 'Users'},
  recipient_id: {required: true, type: String, ref: 'Users'},
  state: {required: true, type: Number},
}, {timestamps: true, toObject:{virtuals:true}});

UserRelationshipSchema.set('toObject', { virtuals: true })
UserRelationshipSchema.set('toJSON', { virtuals: true })

UserRelationshipSchema.virtual('recipient',{
  ref: 'Users',
  localField: 'recipient_id',
  foreignField: 'user_id',
  justOne:true
})

UserRelationshipSchema.virtual('requester',{
  ref: 'Users',
  localField: 'requester_id',
  foreignField: 'user_id',
  justOne:true
})



export const UserRelationship = userMongoose.model('UserRelationships', UserRelationshipSchema);

// block = -1
// reject = 0 // We forcibly delete in this case
// Pending request = 1
// Accepted request = 2

/****************************************************************************//**
 * @summary updates a user relationship state
 * @description updates a user relationship data through 
 * @param {requester_id} string id of user who requested relationship
 * @param {recipient_id} string id of user who recieved relationship request
 * @param {state} string user relationship state code
 * @return returns operation success result status
 * 
 * ****************************************************************************/
export async function updateUserRelationship(requester_id:string, recipient_id:string, state:number, authenticated_user_id?:string) { 

  if (!(await isValidUser(requester_id))) {
    return {status: 404, userDoc: {}, message: 'Requester Does Not Exist.'}; 
  }
  if (!(await isValidUser(recipient_id))){ 
    return {status: 404, userDoc: {}, message: 'Recipient Does Not Exist.'}; 
  }
  // Check if users exist
  let relationshipUpdateResult =  await new Promise<any>((resolve) => { 
    UserRelationship.findOneAndUpdate(
      {$or: 
        [
          { requester_id: requester_id, recipient_id: recipient_id }, // This or....
          { requester_id: recipient_id, recipient_id: requester_id }, // The inverse
        ]
      },
      {
        state: state,
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
    debug(await UserRelationship.deleteOne({_id: document_id}, ((err)=>{
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

    console.log(JSON.stringify(result));

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