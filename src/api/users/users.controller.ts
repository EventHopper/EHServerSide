/* eslint-disable no-invalid-this */
/* eslint-disable new-cap */
/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
// const EventModel = require('../../models/events/events.model');
import * as UserModel from '../../models/users/users.model';
import * as UserRelationshipModel from '../../models/users/user_relationship.model';
import * as UserManager from '../../models/users/user_manager.model';
import * as express from 'express';
import * as s3Module from '../../services/storage/users';
import Auth from '../../auth/server_auth';
import {ControllerInterface} from '../utils/controller.interface';
import FirebaseFunctions from '../../services/firebase/index';
import path from 'path';
import UserRoutes from './users.routes.config';
import Debug from 'debug';
import validator from 'validator';
import * as Event from '../../models/events/events.model';

import * as  EventManager from '../../models/events/event_manager.model';
import { UploadedFile } from 'express-fileupload';
import { sendNotification } from '../../services/onesignal/index';
import { NotificationHandler } from '../utils/notification.handler';
const debug = Debug('users.controller');


export default class UserController implements ControllerInterface {
  public router = express.Router();

  constructor() {
    this.initializeRoutes();   
  }

  public setAuthObject = (authObject:Auth) => {
  }

  public initializeRoutes() {
    this.router.get(UserRoutes.rootPath, this.listUsers);
    this.router.post(UserRoutes.registrationPath, this.registerNewUser);
    // this.router.post(UserRoutes.loginPath, this.logIn);
    // this.router.post(UserRoutes.emailConfirmPath, this.resendEmailVerification);
    this.router.get(UserRoutes.userInformation, this.getUserData);
    this.router.post(UserRoutes.userInformation, this.updateUserData);
    this.router.delete(UserRoutes.userInformation, this.deleteUserAccount);
    this.router.get(UserRoutes.userSearch, this.searchUsers);
    this.router.post(UserRoutes.swipe, this.updateCardSwipe);
    this.router.get(UserRoutes.userManager, this.getEventList);
    this.router.post(UserRoutes.userOAuthGrant, this.addUserOAuthData);
    this.router.post(UserRoutes.userRelationship, this.updateUserRelationship);
    this.router.get(UserRoutes.userRelationship, this.getUserRelationship);
    this.router.post(UserRoutes.userUpload, this.uploadUserMedia);
  }

  /**
   * @route GET /users
   * @documentation {https://docs.eventhopper.app/users#h.28k4ntj99bnx}
   */
  listUsers = async (req:express.Request, res:express.Response) => {
    const userList = await UserModel.list(100, 0);
    res.json(userList);
  };

  /**
   * @route POST /users/register
   * @documentation {https://docs.eventhopper.app/users#h.tdqa8qxms843}
   */
  registerNewUser = async (req:express.Request, res:express.Response) => {

    if (JSON.stringify(req.body) != JSON.stringify({})) {
      
      if (!validator.isEmail(req.body.email)) {
        res.status(400).send({ message: 'malformatted email', code: 49, userInstance: null });
        return;
      }

      // const realmFunc:RealmFunctions = new RealmFunctions(this._auth);
      const firebaseFunc:FirebaseFunctions = new FirebaseFunctions();
      const result = await firebaseFunc.registerUser(String(req.body.email), String(req.body.password));
      if (result?.code==10) {
        // const user:Realm.User = result!.userInstance!;
        const newUser:UserModel.IUser = {
          username: String(req.body.username).toLowerCase(),
          email: req.body.email,
          user_id: result.userID,
          full_name: req.body.full_name ? req.body.full_name : 'null',
          image_url: req.body.image_url ? req.body.image_url : 'null',
          user_manager_id: '',
        };
        
        let creationResult = await UserModel.initializeUserData(newUser);

        if (creationResult.status == 200) {
          res.status(creationResult.status).json(result);
          return;
        } else {
          res.status(400).send({ message: 'Cannot Register User, we encountered an error', code: 400, userInstance: null });
          return;
        }
      }
      debug(result);
      res.status(400).json(result);
      return;
    } else {
      res.status(400).send({ message: 'Cannot Register User, missing request body', code: 400, userInstance: null });
      return;
    }
  };

  /**
   * @route GET /users/:username
   * @documentation {https://docs.eventhopper.app/users#h.8ck31sozoexm}
   */
  getUserData = async (req:express.Request, res: express.Response) => {
    const firebaseFunc:FirebaseFunctions = new FirebaseFunctions();
    // const authenticated_user_id:string = await firebaseFunc.verififyIdToken(String(req.headers.id_token));
    let userDocument;
    if (req.query.user_id){
      userDocument = await UserModel.getUserData('','',String(req.query.user_id));
    } else {
      userDocument = await UserModel.getUserData(String(req.params.username));
    }
    let relationshipDoc;
    if (req.query.related_to) {
      let relatedUser = await UserModel.getUserData(String(req.query.related_to));
      relationshipDoc = await UserRelationshipModel.getUserRelationship(userDocument.user_id, relatedUser.user_id);
    }

    if (userDocument == null) {
      res.status(404)
        .render(path.join(__dirname, '../public/views/user-not-found'), {username: String(req.params.username)});
    } else {
      res.json({
        user: userDocument,
        relationship: relationshipDoc?.relationship,
      });
    }
  }

  /**
   * @route POST /users/:username
   * @documentation {https://docs.eventhopper.app/users#h.dap8ntvndtu3}
   */
  updateUserData = async (req:express.Request, res: express.Response) => {
    const updates:UserModel.IUserUpdate = req.body;
    const username = req.params.username;
    const userDocument = await UserModel.updateUser(username, updates);
    if (userDocument == null) {
      res.status(404)
        .render(path.join(__dirname, '../public/views/user-not-found'), {username: String(req.params.username)});
    } else {
      res.send(userDocument);
    }
  }

  /**
   * @route POST /users/media/:userid
   * @documentation {tbc}
   */
   uploadUserMedia = async (req:express.Request, res: express.Response) => {
     if(!req.params.userid){
       res.status(400).send({
         message: 'No user id specified'
       });
       return;
     }
     const userID = req.params.userid;
     //console.log('userid: ' + userID);
     try {
       if(!req.files) {
         res.status(400).send({
           message: 'No file specified'
         });
       } else {
         //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
         let avatar:UploadedFile = req.files.avatar as UploadedFile;      
         
         //Use the mv() method to place the file in upload directory (i.e. "uploads")
         const filePath:string = './uploads/' + userID;
         avatar.mv(filePath);
         //  ('avatar name: ' + avatar.name);
         //  console.log('avatar size: ' + avatar.sizeconsole.log);
         s3Module.uploadUserFile(userID, filePath, true).then(async (imageURL) => {
         //console.log('server url is: ' + imageURL);
           const updates:UserModel.IUserUpdate = {image_url: imageURL}; 
           const userDocument = await UserModel.updateUser(/*username= */ '', updates, userID);
           if (userDocument == null) {
             res.status(404)
               .render(path.join(__dirname, '../public/views/user-not-found'), {username: String(req.params.username)});
           } else {
             res.send(userDocument);
           }
           return;
         }).catch((err) => {
           console.log(err); 
           res.status(500).send(err);
           return;
         });
       }
     } catch (err) {
       res.status(500).send(err);
     } 
   }

  /**
   * @route POST /users/network/relationship/:
   * @documentation {https://docs.eventhopper.app/users#h.dap8ntvndtu3}
   */
  updateUserRelationship= async (req:express.Request, res: express.Response) => {
    const relationship_id:string = req.body.requester_id;
    let requester_id:string = req.body.requester_id;
    let recipient_id:string = req.body.recipient_id;
    const state:number = req.body.state;

    if(!req.headers.id_token){
      res.status(401).send('ID token not present');
      return;
    }
    const firebaseFunc:FirebaseFunctions = new FirebaseFunctions();
    const authenticated_user_id:string = await firebaseFunc.verififyIdToken(String(req.headers.id_token));

    // console.log('authenticated user id: ' + authenticated_user_id);
    if (state < -1 || state > 2) {
      res.status(400).send('Invalid state - state must be between -1 and 2 inclusive');
      return;
    }
    if (authenticated_user_id == null) {
      res.status(400).send('Invalid user id token');
      return;
    }

    if ((recipient_id === null && relationship_id === null) || (requester_id === null && relationship_id === null)) {
      res.status(400).send('Please provide either a relationship_id or both the requester and recipient ids');
      return;
    } else {
      
      const modelFunctionResult = await UserRelationshipModel.updateUserRelationship(requester_id, recipient_id, state, authenticated_user_id);
      // Ensuring correct recipient and requester 
      let doc : any;
      if (doc = modelFunctionResult.userDoc){
        requester_id = doc.requester_id;
        recipient_id = doc.recipient_id;
      }
     
      if (state == 1) {
        NotificationHandler.sendFriendRequestNotification(requester_id, recipient_id);
      }

      if (state == 2) {
        NotificationHandler.acceptFriendRequestNotification(recipient_id, requester_id);
      }
      if(modelFunctionResult.status >= 0) {
        res.status(200).json(modelFunctionResult);
      } 
      else res.status(400).json(modelFunctionResult);
      return;
    }
  }

  /**
   * @route GET /users/network/relationship/:
   * @documentation {https://docs.eventhopper.app/users#h.dap8ntvndtu3}
   */
  getUserRelationship = async (req:express.Request, res: express.Response) => {
    const relationship_id:string = String(req.query.relationship_id);
    const user_id:string = String(req.query.user_id);
    debug(user_id);
    // const isRecipient:Boolean = req.body.isRecipient;
    const state:number = Number(req.query.state);

    if (state < -1 || state > 2) {
      res.status(400).send('Invalid state - state must be between -1 and 2 inclusive');
      return;
    }

    if ((user_id == null && relationship_id == null)) {
      res.status(400).send('Please provide either a relationship_id or both the requester and recipient ids');
      return;
    } else {
      
      const modelFunctionResult = await UserRelationshipModel.getUserRelationshipList(user_id, state);
      debug(modelFunctionResult);
      if(modelFunctionResult.status >= 0) res.status(200).json(modelFunctionResult);
      else res.status(400).json(modelFunctionResult);
      return;
    }
  }

  /**
   * @route DELETE /users/:username
   * @documentation {https://docs.eventhopper.app/users#h.fzbj7ypc3ybm}
   */
  deleteUserAccount = async (req:express.Request, res: express.Response) => {
    const result = await UserModel.wipeUserData(req.body.tokenID);
    if (result.status == 200) {
      res.status(200).send(result);
    } else {
      res.status(result.status).send(result);
    }
  }

  /**
   * @route POST /users/:user_id/oauth/grant
   * @documentation {https://docs.eventhopper.app/users#h.dap8ntvndtu3}
   */
  addUserOAuthData = async (req:express.Request, res: express.Response) => {
    const oAuthData:UserManager.IUserOAuthData = req.body;
    const name = req.body.provider_name;
    let oAuthUpdateQuery; 
    name == 'SPOTIFY' ? oAuthUpdateQuery = {spotify_oauth: oAuthData} : 
      name == 'GOOGLE' ? oAuthUpdateQuery = {google_oauth: oAuthData}  : 
        oAuthUpdateQuery = 'error';
    if (oAuthUpdateQuery == 'error') {
      res.status(400).json({message: 'provider not supported', code: -1});
      return;
    }
    
    // console.log(oAuthData);
    const userManagerDocument = await UserManager.updateUserManager(req.params.user_id, oAuthUpdateQuery);
    if (userManagerDocument == null) {
      res.status(404)
        .render(path.join(__dirname, '../public/views/user-not-found'), {username: String(req.params.username)});
    } else {
      res.send(userManagerDocument);
    }
  }
  
  /**
   * @route POST /users/swipe/:event_id
   * @documentation TODO
   */
  updateCardSwipe = async (req:express.Request, res: express.Response) => {
    if (req.body.event_manager_update && req.body.user_manager_update ) { //TODO: assign an interface to the update bodies
      let error_message;
      var proceed =  await UserManager.updateUserManagerEventList(req.body.user_id, req.body.user_manager_update, req.body.direction)
        .then((result:any) => {
          return true;
        }).catch((error)=> {
          error_message = error;
          return false;
        });
      proceed ? EventManager.updateEventManagerUserList(req.params.event_id, req.body.event_manager_update,  `${req.body.direction}_swipe`)
        .then((result:any) => {
          return res.status(200).send({code: 10, message: 'successfully registered swipe'});
        }).catch((error)=> {
          return res.status(200).send({error: error, code: 13});
        }) : res.json({message: 'failed to register swipe', code: 13, error: error_message});;
    } else {
      res.json({message: 'failed to register swipe', code: 14, error: 'body must contain updates for event and corresponding user manager'});;
    }
  }

  /**
   * @route GET /search/users
   * @documentation {https://docs.eventhopper.app/users#h.s2q7rru30coi}
   */
  searchUsers = async (req:express.Request, res: express.Response) => {
    let searchQuery:string = '';
    debug(req.query.query);
    if (req.query.query != null){
      searchQuery = String(req.query.query);
    } 

    let result:any;
    let limit = Number(req.query.limit) ? Number(req.query.limit) : undefined;
    if (limit) {
      result = await UserModel.search(searchQuery, limit);
    } else {
      result = await UserModel.search(searchQuery);
    }
    if (result.length >= 1) {
      res.status(200).json(result);
    } else {
      res.status(200).json('No Search Results');
    }
  }

  /**
   * @route GET /users/manager/:user_id
   * @documentation {WIP}
   */
  getEventList = async (req:express.Request, res:express.Response) => {
    const list_type = req.params.list_type;
    const user_id = req.params.user_id; 

    if (!list_type||!user_id) {
      res.status(400).json();
    }
    const event_list = await UserManager.getUserEventList(user_id, list_type);
    // debug(`user_id: ${user_id}\n list_type: ${list_type}\nevent list is: ${event_list}`);
    
    const events = await Event.byID(event_list);
    
    res.status(200).json({'count': event_list == null ? 0 : event_list.length, 'events':events,});
   
  }



}




