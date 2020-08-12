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
import path from 'path';
import UserFunctions from './users.functions';
import UserRoutes from './users.routes.config';
// import EventModel from '../index';

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
    this.router.post(UserRoutes.loginPath, this.logIn);
    this.router.post(UserRoutes.emailConfirmPath, this.resendEmailVerification);
    this.router.get(UserRoutes.userInformation, this.getUserData);
  }
  resendEmailVerification = (req:express.Request, res:express.Response) => {
    const realmFunc:RealmFunctions = new RealmFunctions(this._auth);
    realmFunc.resendConfirmationEmail(req.body.email);
  }

  registerNewUser = async(req:express.Request, res:express.Response) => {
    // TODO: accept an encrypted JSON of email & password from client, decrypt and then pass to realmFunc
    if (JSON.stringify(req.body) != JSON.stringify({})) {
      const realmFunc:RealmFunctions = new RealmFunctions(this._auth);
      const result = await realmFunc.registerUser(String(req.body.email), String(req.body.password));
      if (result?.code==200) {
        const user:Realm.User = result!.userInstance!;
        const newUser = {
          username: String(req.body.username).toLowerCase(),
          email: req.body.email,
          user_id: user.id,
        };

        UserModel.saveUser(newUser).catch((err: any)=>{
          console.log(err);
        });
      }
      console.log(result);
      res.json(result);
    } else {
      res.json('Cannot Register EventHopper User: Request Body Empty');
    }
  };

  logIn = async(req:express.Request, res:express.Response) => {
    const username = req.query.username;
    if (JSON.stringify(req.body) !== JSON.stringify({})) {
      const email = req.body.email;
      const password = req.body.password;
      const realmFunc:RealmFunctions = new RealmFunctions(this._auth);
      const result = await realmFunc.logIn(email, password);
      console.log(result);
      res.json(result);
    } else {
      res.json('Could not log in user');
    }
  };

  getUserData = async(req:express.Request, res: express.Response) => {
    const userDocument = await UserModel.getUserData(String(req.params.username)).catch((err)=>{
      console.log(err);
    });
    if (userDocument == null) {
      res.status(404)
        .render(path.join(__dirname, '/views/user-not-found'), {username: String(req.params.username)});
    } else {
      res.send(userDocument);
    }
  }

  sendFriendRequest = (req:express.Request, res: express.Response) => {
    if (JSON.stringify(req.body) !== JSON.stringify({})) {

    } else {

    }
  }

  verifyPassword = function(username:string, password:string, done:Function) {

  }

  listUsers = async(req:express.Request, res:express.Response) => {
    const userList = await UserModel.list(100, 0);
    res.json(userList);
  };
}

export default UserController;
