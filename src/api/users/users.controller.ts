/* eslint-disable no-invalid-this */
/* eslint-disable new-cap */
/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
// const EventModel = require('../../models/events/events.model');
import * as UserModel from '../../models/users/users.model';
import * as express from 'express';
import Auth from '../../auth/server_auth';
import {ControllerInterface} from '../utils/controller.interface';
import RealmFunctions from './users.realm.functions';
import Realm from 'realm';
import path, { relative } from 'path';
import UserFunctions from './users.functions';
import UserRoutes from './users.routes.config';
import Debug from 'debug';
import { initializeUserManager } from '../../models/users/user_manager.model';
const debug = Debug('users.controller');

class UserController implements ControllerInterface {
  public router = express.Router();
  private _auth:Auth;

  constructor() {
    this.initializeRoutes();
    this._auth = new Auth();
  }

  public setAuthObject = (authObject:Auth) => {
    this._auth = authObject;
  }

  public initializeRoutes() {
    this.router.get(UserRoutes.rootPath, this.listUsers);
    this.router.post(UserRoutes.registrationPath, this.registerNewUser);
    // this.router.post(UserRoutes.loginPath, this.logIn);
    // this.router.post(UserRoutes.emailConfirmPath, this.resendEmailVerification);
    this.router.get(UserRoutes.userInformation, this.getUserData);
    this.router.get(UserRoutes.userSearch, this.searchUsers)
  }
  // resendEmailVerification = (req:express.Request, res:express.Response) => {
  //   const realmFunc:RealmFunctions = new RealmFunctions(this._auth);
  //   realmFunc.resendConfirmationEmail(req.body.email);
  // }

  registerNewUser = async (req:express.Request, res:express.Response) => {

    if (JSON.stringify(req.body) != JSON.stringify({})) {
      const realmFunc:RealmFunctions = new RealmFunctions(this._auth);
      const result = await realmFunc.registerUser(String(req.body.email), String(req.body.password));
      if (result?.code==200) {
        const user:Realm.User = result!.userInstance!;
        const newUser:UserModel.IUser = {
          username: String(req.body.username).toLowerCase(),
          email: req.body.email,
          user_id: user.id,
          full_name: req.body.full_name ? req.body.full_name : 'null',
          image_url: req.body.image_url ? req.body.image_url : 'null',
          user_manager_id: '',
        };
        console.log ('this is the user id: ', user.id);
        let creationResult = await UserModel.newUser(newUser);
        if (creationResult.status == 200) {
          res.status(creationResult.status).json(creationResult.message);
          return;
        } else {
          res.status(500).json('Cannot Register User, we encountered an error');
          return;
        }
      }
      debug(result);
      res.status(400).json(result);
      return;
    } else {
      res.status(400).json('Cannot Register User, Missing Request Body');
      return;
    }
  };

  logIn = async (req:express.Request, res:express.Response) => {
    const username = req.query.username;
    if (JSON.stringify(req.body) !== JSON.stringify({})) {
      const email = req.body.email;
      const password = req.body.password;
      const realmFunc:RealmFunctions = new RealmFunctions(this._auth);
      const result = await realmFunc.logIn(email, password);
      debug(result);
      res.json(result);
    } else {
      res.status(400).json('Could not log in user');
    }
  };

  getUserData = async (req:express.Request, res: express.Response) => {
    const userDocument = await UserModel.getUserData(String(req.params.username)).catch((err)=>{
      debug(err);
    });
    if (userDocument == null) {
      res.status(404)
        .render(path.join(__dirname, '../public/views/user-not-found'), {username: String(req.params.username)});
    } else {
      res.send(userDocument);
    }
  }

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

  sendFriendRequest = (req:express.Request, res: express.Response) => {
    if (JSON.stringify(req.body) !== JSON.stringify({})) {

    } else {

    }
  }

  verifyPassword = function(username:string, password:string, done:Function) {

  }

  listUsers = async (req:express.Request, res:express.Response) => {
    const userList = await UserModel.list(100, 0);
    res.json(userList);
  };
}

export default UserController;
