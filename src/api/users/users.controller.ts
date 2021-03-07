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
import Auth from '../../auth/server_auth';
import {ControllerInterface} from '../utils/controller.interface';
import FirebaseFunctions from '../../services/firebase/index';
import path from 'path';
// import UserFunctions from './users.functions';
import UserRoutes from './users.routes.config';
import Debug from 'debug';
import validator from 'validator';
import { error } from 'console';

import * as Event from '../../models/events/events.model';

import * as  EventManager from '../../models/events/event_manager.model';
const debug = Debug('users.controller');

class UserController implements ControllerInterface {
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
    this.router.post(UserRoutes.userRelationshipUpdate, this.updateUserRelationship);

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
    const userDocument = await UserModel.getUserData(String(req.params.username));
    if (userDocument == null) {
      res.status(404)
        .render(path.join(__dirname, '../public/views/user-not-found'), {username: String(req.params.username)});
    } else {
      res.send(userDocument);
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
   * @route POST /users/relationship/:
   * @documentation {https://docs.eventhopper.app/users#h.dap8ntvndtu3}
   */
  updateUserRelationship= async (req:express.Request, res: express.Response) => {
    const relationship_id:string = req.body.requester_id;
    const requester_id:string = req.body.requester_id;
    const recipient_id:string = req.body.recipient_id;
    const state:number = req.body.state;

    if (state < -1 || state > 2) {
      res.status(400).send('Invalid state - state must be between -1 and 2 inclusive');
    }

    if ((recipient_id === null && relationship_id === null) || (requester_id === null && relationship_id === null)) {
      res.status(400).send('Please provide either a relationship_id or both the requester and recipient ids');
    } else {
      
      const modelFunctionResult = await UserRelationshipModel.updateUserRelationship(requester_id, recipient_id, state);
      if(modelFunctionResult.status >= 0) res.status(200).json(modelFunctionResult);
      else res.status(400).json(modelFunctionResult);
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
    
    console.log(oAuthData);
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
      var proceed = UserManager.updateUserManagerEventList(req.body.user_id, req.body.user_manager_update, req.body.direction)
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
    
    res.status(200).json({'count':event_list.length, 'events':events,});
   
  }



}

export default UserController;
