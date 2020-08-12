/* eslint-disable no-invalid-this */
/* eslint-disable new-cap */
/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
// const EventModel = require('../../models/events/events.model');
import * as UserModel from '../../models/users/users.model';
import * as express from 'express';
import {Schema, model, Document, Model} from 'mongoose';
import Auth from '../../auth/server_auth';
import {ControllerInterface} from '../utils/controller.interface';
import RealmFunctions from './realm.functions';
// import EventModel from '../index';

class UserController implements ControllerInterface {
  public rootPath = '/users';
  public registrationPath = `${this.rootPath}/register`;
  public loginPath = `${this.rootPath}/login`;
  public pswdResetPath = `${this.rootPath}/password/reset`;
  public emailConfirmPath = `${this.rootPath}/email/resend-confirmation`;
  public router = express.Router();
  private _auth:Auth;

  constructor() {
    this.initializeRoutes();
    this._auth = new Auth();
  }

  public setAuthObject = (authObject:Auth)=>{
    this._auth = authObject;
  }

  public initializeRoutes() {
    this.router.get(this.rootPath, this.listUsers);
    this.router.post(this.registrationPath, this.registerNewUser);
    this.router.post(this.loginPath, this.logIn);
    this.router.post(this.emailConfirmPath, this.resendEmailVerification);
  }
  resendEmailVerification = (req:express.Request, res:express.Response) => {
    const realmFunc:RealmFunctions = new RealmFunctions(this._auth);
    realmFunc.resendConfirmationEmail(req.body.email);
  }

  registerNewUser = async (req:express.Request, res:express.Response) => { // TODO: accept an encrypted JSON of email & password from client, decrypt and then pass ti realmFunc
    if (JSON.stringify(req.body) != JSON.stringify({})) {
      const realmFunc:RealmFunctions = new RealmFunctions(this._auth);
      const result = await realmFunc.registerUser(String(req.body.email), String(req.body.password));
      if (result?.code==200) {
        const user:Realm.User = result!.userInstance!;
        const newUser = {
          username: req.body.username,
          email: req.body.email,
          data_id: user.id,
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

  logIn = async (req:express.Request, res:express.Response) => {
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

  sendFriendRequest = (req:express.Request, res: express.Response) => {
    if (JSON.stringify(req.body) !== JSON.stringify({})) {

    } else {

    }
  }

  verifyPassword = function(username:string, password:string, done:Function) {

  }

  listUsers = (req:express.Request, res:express.Response) => {
    res.json(UserModel.list(10, 1));
  };
}

export default UserController;
