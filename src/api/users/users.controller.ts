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
import FirebaseFunctions from '../../services/firebase/index';
import path from 'path';
// import UserFunctions from './users.functions';
import UserRoutes from './users.routes.config';
import Debug from 'debug';
import validator from 'validator';
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
  }

  /**
   * @route GET /users
   * @documentaiton {https://docs.eventhopper.app/users#h.28k4ntj99bnx}
   */
  listUsers = async (req:express.Request, res:express.Response) => {
    const userList = await UserModel.list(100, 0);
    res.json(userList);
  };

  /**
   * @route POST /users/register
   * @documentaiton {https://docs.eventhopper.app/users#h.tdqa8qxms843}
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
   * @documentaiton {https://docs.eventhopper.app/users#h.8ck31sozoexm}
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
   * @documentaiton {https://docs.eventhopper.app/users#h.dap8ntvndtu3}
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
   * @route DELETE /users/:username
   * @documentaiton {https://docs.eventhopper.app/users#h.fzbj7ypc3ybm}
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
   * @route GET /search/users
   * @documentaiton {https://docs.eventhopper.app/users#h.s2q7rru30coi}
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

}

export default UserController;
